// The performance game's rules for one run: judging taps, holds, misses, the streak, the crowd meter and
// callouts. It knows nothing about audio or drawing: callers pass times in ms on the song's clock (the
// audio clock), so the same engine runs in the browser and in tests.

import { GAME_CONFIG } from "../config.ts";
import { noteEnd, type Chart, type ChartNote } from "./chart.ts";
import { gradeFor, maxScore, multiplierFor, starsFor, type Grade, type HitGrade } from "./scoring.ts";

export interface LiveNote extends ChartNote {
  /** 0 waiting, 1 hit, 2 missed. */
  state: 0 | 1 | 2;
  /** A hit hold the player is still holding. */
  holding?: boolean;
  /** How far (ms) a hold's points have been counted. */
  heldTo?: number;
}

export type ShowEvent =
  | { kind: "judge"; lane: number; grade: Grade }
  | { kind: "hold-end"; lane: number }
  | { kind: "callout"; text: string }
  | { kind: "miss" };

export interface ShowResults {
  score: number;
  max: number;
  stars: number;
  accuracy: number;
  bestStreak: number;
  crowdPeak: number;
  hit: number;
  total: number;
  fullCombo: boolean;
}

const S = GAME_CONFIG.show;

export class ShowEngine {
  readonly notes: LiveNote[];
  readonly beatMs: number;
  readonly max: number;
  score = 0;
  streak = 0;
  bestStreak = 0;
  crowd: number = S.crowd.start;
  crowdPeak: number = S.crowd.start;
  counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  /** Things the screen should show or play; the caller drains this each frame. */
  events: ShowEvent[] = [];
  private readonly drain: number;
  private crowdCheered = false;
  /** Index of the first note that may still be waiting, so each frame skips judged notes. */
  private cursor = 0;

  constructor(chart: Chart, beatMs: number) {
    this.notes = chart.notes.map((n) => ({ ...n, state: 0 }));
    this.beatMs = beatMs;
    this.max = maxScore(chart.notes, beatMs);
    this.drain = S.difficulties[chart.difficulty].crowdDrain;
  }

  get multiplier(): number {
    return multiplierFor(this.streak);
  }

  /** A thumb goes down in a lane at time t. Returns the grade, or null when no note was close (never penalized). */
  press(lane: number, t: number): HitGrade | null {
    let best: LiveNote | null = null;
    let bestErr = Infinity;
    for (let i = this.cursor; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.t - t > S.windows.good) break;
      if (n.state || n.lane !== lane) continue;
      const err = Math.abs(n.t - t);
      if (err < bestErr) {
        best = n;
        bestErr = err;
      }
    }
    const grade = best ? gradeFor(bestErr) : null;
    if (!best || !grade) return null;

    best.state = 1;
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.counts[grade]++;
    this.score += S.points[grade] * this.multiplier;
    this.moveCrowd(S.crowd[grade]);
    if (best.type === "hold") {
      best.holding = true;
      best.heldTo = Math.max(best.t, t);
    }
    this.events.push({ kind: "judge", lane, grade });
    this.callouts();
    return grade;
  }

  /** A thumb comes up: a hold stops counting points there (letting go early is never a miss). */
  release(lane: number, t: number) {
    for (const n of this.notes) {
      if (n.holding && n.lane === lane) {
        this.accrue(n, t);
        n.holding = false;
      }
    }
  }

  /** Moves the run to time t: counts hold points and misses notes that slid past the last window. */
  update(t: number) {
    for (let i = this.cursor; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.t - t > S.windows.good) break;
      if (n.holding) {
        this.accrue(n, t);
        if (t >= noteEnd(n)) {
          n.holding = false;
          this.events.push({ kind: "hold-end", lane: n.lane });
        }
      }
      if (n.state === 0 && t - n.t > S.windows.good) {
        n.state = 2;
        this.streak = 0;
        this.counts.miss++;
        this.moveCrowd(S.crowd.miss * this.drain);
        this.events.push({ kind: "judge", lane: n.lane, grade: "miss" }, { kind: "miss" });
      }
    }
    while (this.cursor < this.notes.length) {
      const n = this.notes[this.cursor];
      if (n.state === 0 || n.holding) break;
      this.cursor++;
    }
  }

  results(): ShowResults {
    const total = this.notes.length;
    const hit = this.counts.perfect + this.counts.great + this.counts.good;
    const a = S.accuracy;
    const weighted = this.counts.perfect * a.perfect + this.counts.great * a.great + this.counts.good * a.good;
    const score = Math.round(this.score);
    return {
      score,
      max: this.max,
      stars: starsFor(score, this.max),
      accuracy: total ? weighted / total : 0,
      bestStreak: this.bestStreak,
      crowdPeak: Math.round(this.crowdPeak),
      hit,
      total,
      fullCombo: total > 0 && this.counts.miss === 0 && hit === total,
    };
  }

  private accrue(n: LiveNote, t: number) {
    const to = Math.min(t, noteEnd(n));
    const from = n.heldTo ?? n.t;
    if (to <= from) return;
    this.score += ((to - from) / this.beatMs) * S.holdPointsPerBeat * this.multiplier;
    n.heldTo = to;
  }

  private moveCrowd(delta: number) {
    this.crowd = Math.max(0, Math.min(100, this.crowd + delta));
    this.crowdPeak = Math.max(this.crowdPeak, this.crowd);
    if (!this.crowdCheered && this.crowd >= S.crowd.losingIt) {
      this.crowdCheered = true;
      this.events.push({ kind: "callout", text: "CROWD'S ON ITS FEET!" });
    } else if (this.crowdCheered && this.crowd < S.crowd.losingIt - 10) {
      this.crowdCheered = false;
    }
  }

  private callouts() {
    const hits = this.counts.perfect + this.counts.great + this.counts.good;
    if (hits === S.hotStartNotes && this.counts.miss === 0) this.events.push({ kind: "callout", text: "HOT START!" });
    if (this.streak > 0 && this.streak % S.streakCallout === 0) this.events.push({ kind: "callout", text: `${this.streak} NOTE STREAK!` });
  }
}
