// Charts for the performance game (Clarifications 4.12): one per song and difficulty, as data. Times are ms
// from the song's first downbeat; the count-in comes before 0.

import { GAME_CONFIG } from "../config.ts";

export type Difficulty = keyof typeof GAME_CONFIG.show.difficulties;
export type NoteType = "tap" | "hold";

export interface ChartNote {
  /** When the note crosses the hit line, in ms. */
  t: number;
  /** 0-based lane: 0 is the leftmost. */
  lane: number;
  type: NoteType;
  /** A hold's length in ms (holds only). */
  len?: number;
}

export interface ChartSection {
  id: string;
  label: string;
  start: number;
  end: number;
}

export interface Chart {
  songId: string;
  difficulty: Difficulty;
  bpm: number;
  /** Shifts every note against the audio (ms), for songs whose audio starts late. */
  offsetMs: number;
  sections: ChartSection[];
  notes: ChartNote[];
}

/** Where a note ends: its tail for a hold, the note itself otherwise. */
export const noteEnd = (n: ChartNote) => n.t + (n.type === "hold" ? n.len ?? 0 : 0);

/** Checks a chart against its difficulty's rules (4.12). Returns what's wrong; empty means it's fine. */
export function validateChart(chart: Chart): string[] {
  const cfg = GAME_CONFIG.show;
  const diff = cfg.difficulties[chart.difficulty];
  const errors: string[] = [];
  const notes = chart.notes;
  const lastInLane = new Map<number, ChartNote>();

  notes.forEach((n, i) => {
    const where = `note ${i} at ${Math.round(n.t)} ms`;
    if (!Number.isInteger(n.lane) || n.lane < 0 || n.lane >= diff.lanes) errors.push(`${where}: lane ${n.lane} is outside ${diff.lanes} lanes`);
    if (i > 0 && n.t < notes[i - 1].t) errors.push(`${where}: notes are out of order`);
    if (n.type === "hold" && (n.len ?? 0) < cfg.minHoldMs) errors.push(`${where}: holds last at least ${cfg.minHoldMs} ms`);
    if (i > 0 && n.t === notes[i - 1].t && chart.difficulty !== "club" && chart.difficulty !== "theater") {
      errors.push(`${where}: no chords below Club`);
    }
    const prev = lastInLane.get(n.lane);
    if (prev && n.t - noteEnd(prev) < cfg.minSameLaneGapMs) errors.push(`${where}: under ${cfg.minSameLaneGapMs} ms after the last note in lane ${n.lane}`);
    lastInLane.set(n.lane, n);

    let inSecond = 0;
    for (let j = i; j < notes.length && notes[j].t < n.t + 1000; j++) inSecond++;
    if (inSecond > diff.maxNotesPerSecond) errors.push(`${where}: ${inSecond} notes in one second (max ${diff.maxNotesPerSecond})`);
  });
  return errors;
}
