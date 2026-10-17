"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "@/lib/config";
import { audioContext, outputLatencyMs, SongPlayer } from "@/lib/show/audio";
import { ShowEngine, type ShowResults } from "@/lib/show/engine";
import { CROWD_LABELS, crowdState } from "@/lib/show/scoring";
import { buildPerformance, COUNT_IN_BEATS, WARM_UP_LOOP, type Performance } from "@/lib/show/songs";
import { Calibration, calibrationSkipped, savedOffset } from "./Calibration";
import { geometry, Highway, laneAt, TAP_ZONE_ABOVE, type Geometry, type Judgment } from "./highway";
import { PracticeResults } from "./PracticeResults";

export type PracticeWhere = "home" | "grind";

export interface PracticeOptions {
  where: PracticeWhere;
  speed: number;
  /** A section to loop, or null for the whole song. */
  loop: string | null;
}

export const PRACTICE_VENUES: Record<PracticeWhere, { name: string; sub: string }> = {
  home: { name: "Practice amp", sub: "at home" },
  grind: { name: "The Grind", sub: "open-mic practice" },
};

const SONG = WARM_UP_LOOP;
const DIFFICULTY = "open_mic" as const;
const DIFF = GAME_CONFIG.show.difficulties[DIFFICULTY];
/** The highway starts under the show HUD and the practice tag. */
const HIGHWAY_TOP = 92;
const KEYS: Record<string, number> = { d: 0, f: 1, j: 2, k: 3 };

type Phase = "gate" | "calibrate" | "play" | "paused" | "resume" | "results";

interface Run {
  perf: Performance;
  engine: ShowEngine;
  player: SongPlayer;
  /** Audio-clock time (s) of the first downbeat. */
  startAt: number;
  /** Output latency (ms): notes cross the line when they're heard. */
  latency: number;
  /** The device's tap offset (ms) from calibration, or the output latency until calibrated. */
  offset: number;
}

export interface PracticeOutcome {
  results: ShowResults;
  newBest: boolean;
  /** Bests count whole songs only; a loop records none. */
  counted: boolean;
}

/** Bests per song, difficulty and speed, kept on this phone (practice saves nothing to the account). */
export function readBests(): Record<string, { score: number; stars: number }> {
  try {
    return JSON.parse(localStorage.getItem(GAME_CONFIG.show.bestKey) ?? "{}");
  } catch {
    return {};
  }
}
export const bestKey = (songId: string, speed: number) => `${songId}:${DIFFICULTY}:${speed}`;

/**
 * A practice run at Open Mic difficulty (Clarifications 4.10, Design C50 to C57, C64): free, unlimited and
 * pays nothing. Full screen; the game's HUD is hidden for the whole song.
 */
export function PracticeShow({ options, onExit, auto = false }: { options: PracticeOptions; onExit: () => void; auto?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const multRef = useRef<HTMLDivElement>(null);
  const crowdFillRef = useRef<HTMLElement>(null);
  const crowdLabelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const run = useRef<Run | null>(null);
  const geo = useRef<Geometry | null>(null);
  const highway = useRef<Highway | null>(null);
  const clock = useRef({ c: -1, p: 0 });
  const pointers = useRef(new Map<number, number>());
  const pressed = useRef([0, 0, 0, 0]);
  const judgments = useRef<(Judgment | null)[]>([null, null, null, null]);
  const missAt = useRef([-1e9, -1e9, -1e9, -1e9]);
  const calloutUntil = useRef(0);
  const shown = useRef({ score: "", mult: 0, crowd: -1, label: "", count: "" });

  const [phase, setPhaseState] = useState<Phase>("gate");
  const phaseRef = useRef<Phase>("gate");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [countdown, setCountdown] = useState(0);
  const [outcome, setOutcome] = useState<PracticeOutcome | null>(null);
  const reduced = useRef(false);

  const venue = PRACTICE_VENUES[options.where];
  const loopLabel = options.loop ? SONG.sections[options.loop].label : null;

  /** The audio clock in ms from the first downbeat, smoothed between the clock's small jumps. */
  function audioNow(r: Run): number {
    const ctx = ctxRef.current!;
    const c = ctx.currentTime, p = performance.now();
    if (c !== clock.current.c) clock.current = { c, p };
    return (c + Math.min(p - clock.current.p, 50) / 1000 - r.startAt) * 1000;
  }

  function begin() {
    const ctx = ctxRef.current!;
    run.current?.player.stop();
    const perf = buildPerformance(SONG, { difficulty: DIFFICULTY, speed: options.speed, loop: options.loop });
    const latency = outputLatencyMs(ctx);
    const startAt = ctx.currentTime + 0.4 + (COUNT_IN_BEATS * perf.beatMs) / 1000;
    run.current = {
      perf,
      engine: new ShowEngine(perf.chart, perf.beatMs),
      player: new SongPlayer(ctx, perf, startAt),
      startAt,
      latency,
      offset: savedOffset() ?? latency,
    };
    pointers.current.clear();
    pressed.current = [0, 0, 0, 0];
    judgments.current = [null, null, null, null];
    shown.current = { score: "", mult: 0, crowd: -1, label: "", count: "" };
    setOutcome(null);
    setPhase("play");
  }

  /** After the gate (or straight away): calibrate once per phone, then play. */
  function ready() {
    if (savedOffset() == null && !calibrationSkipped() && !auto) setPhase("calibrate");
    else begin();
  }

  // Audio starts only from a tap. Coming from "Take the stage" it's already running; a direct load waits at the gate.
  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = audioContext();
    ctxRef.current = ctx;
    let alive = true;
    const go = () => alive && (ctx.state === "running" ? ready() : setPhase("gate"));
    const t = setTimeout(go, 150);
    return () => {
      alive = false;
      clearTimeout(t);
      run.current?.player.stop();
      if (ctx.state === "suspended") void ctx.resume();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas size follows the screen.
  useEffect(() => {
    const canvas = canvasRef.current!, root = rootRef.current!;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = root.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo.current = geometry(width, height, DIFF.lanes, HIGHWAY_TOP);
      if (highway.current) highway.current.resize(geo.current, dpr);
      else highway.current = new Highway(ctx, geo.current, dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // The frame loop: schedule audio, judge, draw, and update the HUD without re-rendering React.
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = run.current;
      if (!r || !highway.current) return;
      const playing = phaseRef.current === "play";
      const a = audioNow(r);
      if (playing) {
        r.player.pump();
        const judgeNow = a - r.offset;
        if (auto) {
          for (const n of r.engine.notes) {
            if (n.t > judgeNow) break;
            if (n.state === 0) r.engine.press(n.lane, n.t);
          }
        }
        r.engine.update(judgeNow);
        handleEvents(r);
        if (a - r.latency > r.perf.lengthMs + 1200) finish(r);
      }
      const now = a - r.latency;
      highway.current.draw({
        now,
        notes: r.engine.notes,
        beatMs: r.perf.beatMs,
        lengthMs: r.perf.lengthMs,
        visibleMs: DIFF.visibleMs,
        pressed: pressed.current,
        judgments: judgments.current,
        missAt: missAt.current,
        reduced: reduced.current,
      });
      updateHud(r, now);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving the app pauses (4.13).
  useEffect(() => {
    const onHide = () => document.hidden && pause();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard, for testing on a computer: D F J K are the lanes, Space or Escape pauses.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k in KEYS) press(KEYS[k], -1 - KEYS[k], e.timeStamp);
      else if ((k === " " || k === "escape") && phaseRef.current === "play") {
        e.preventDefault();
        pause();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in KEYS) lift(-1 - KEYS[k]);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEvents(r: Run) {
    const now = performance.now();
    for (const ev of r.engine.events) {
      if (ev.kind === "judge") {
        judgments.current[ev.lane] = { lane: ev.lane, grade: ev.grade, at: now };
        if (ev.grade === "miss") missAt.current[ev.lane] = now;
        else highway.current?.spark(ev.lane, ev.grade === "perfect", reduced.current);
      } else if (ev.kind === "miss") {
        r.player.dropLead();
      } else if (ev.kind === "callout" && now > calloutUntil.current && calloutRef.current) {
        // Never more than one callout at a time.
        calloutUntil.current = now + 1200;
        const el = calloutRef.current;
        el.textContent = ev.text;
        el.classList.remove("show");
        void el.offsetWidth;
        el.classList.add("show");
      }
    }
    r.engine.events.length = 0;
  }

  function updateHud(r: Run, now: number) {
    const s = shown.current;
    const score = Math.round(r.engine.score).toLocaleString("en-US");
    if (score !== s.score && scoreRef.current) scoreRef.current.textContent = s.score = score;
    const mult = r.engine.multiplier;
    if (mult !== s.mult && multRef.current) {
      const el = multRef.current;
      el.textContent = `×${mult}`;
      el.classList.toggle("dim", mult === 1);
      if (mult > s.mult && s.mult > 0) {
        el.classList.remove("pop");
        void el.offsetWidth;
        el.classList.add("pop");
      }
      s.mult = mult;
    }
    const crowd = Math.round(r.engine.crowd);
    if (crowd !== s.crowd && crowdFillRef.current) {
      const st = CROWD_LABELS[crowdState(crowd)];
      crowdFillRef.current.style.height = `${crowd}%`;
      crowdFillRef.current.style.background = st.color;
      const label = `${st.emoji} ${st.label}`;
      if (label !== s.label && crowdLabelRef.current) crowdLabelRef.current.textContent = s.label = label;
      s.crowd = crowd;
    }
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, now / r.perf.lengthMs))})`;
    // The count-in: a beat to get ready, then 3, 2, 1.
    const beat = Math.floor(now / r.perf.beatMs);
    const count = beat < -COUNT_IN_BEATS || beat >= 0 ? "" : beat === -COUNT_IN_BEATS ? "Ready" : String(-beat);
    if (count !== s.count && countRef.current) {
      countRef.current.textContent = s.count = count;
      countRef.current.hidden = !count;
    }
  }

  function press(lane: number, pointerId: number, timeStamp: number) {
    const r = run.current;
    if (!r || phaseRef.current !== "play" || lane >= DIFF.lanes) return;
    pointers.current.set(pointerId, lane);
    pressed.current[lane]++;
    // Judge at the moment the finger landed, not when this code got to run.
    const late = Math.max(0, Math.min(100, performance.now() - timeStamp));
    r.engine.press(lane, audioNow(r) - late - r.offset);
  }

  function lift(pointerId: number) {
    const lane = pointers.current.get(pointerId);
    if (lane == null) return;
    pointers.current.delete(pointerId);
    pressed.current[lane] = Math.max(0, pressed.current[lane] - 1);
    const r = run.current;
    if (r && phaseRef.current === "play") r.engine.release(lane, audioNow(r) - r.offset);
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button") || !geo.current) return;
    const rect = rootRef.current!.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y < geo.current.hitY - TAP_ZONE_ABOVE) return;
    e.preventDefault();
    press(laneAt(geo.current, e.clientX - rect.left), e.pointerId, e.timeStamp);
  }

  function releaseAll() {
    for (const id of [...pointers.current.keys()]) lift(id);
  }

  function pause() {
    if (phaseRef.current !== "play") return;
    releaseAll();
    void ctxRef.current?.suspend();
    setPhase("paused");
  }

  /** Resuming counts 3, 2, 1 before the music moves again, so pausing gives no advantage. */
  function resume() {
    setPhase("resume");
    let n = 3;
    setCountdown(n);
    const tick = () => {
      n--;
      if (n > 0) {
        setCountdown(n);
        setTimeout(tick, 650);
      } else {
        void ctxRef.current?.resume().then(() => setPhase("play"));
      }
    };
    setTimeout(tick, 650);
  }

  function withAudio(next: () => void) {
    const ctx = ctxRef.current!;
    if (ctx.state === "running") next();
    else void ctx.resume().then(next);
  }

  function finish(r: Run) {
    setPhase("results");
    const results = r.engine.results();
    let newBest = false;
    const counted = options.loop == null;
    if (counted) {
      const bests = readBests();
      const key = bestKey(SONG.id, options.speed);
      if (results.score > (bests[key]?.score ?? 0)) {
        newBest = true;
        bests[key] = { score: results.score, stars: results.stars };
        try {
          localStorage.setItem(GAME_CONFIG.show.bestKey, JSON.stringify(bests));
        } catch {
          // Private windows: the best just isn't remembered.
        }
      }
    }
    setOutcome({ results, newBest, counted });
    const player = r.player;
    setTimeout(() => player.stop(), 1500);
  }

  return (
    <div
      ref={rootRef}
      className={`show-root show-${options.where}`}
      onPointerDown={onPointerDown}
      onPointerUp={(e) => lift(e.pointerId)}
      onPointerCancel={(e) => lift(e.pointerId)}
      role="application"
      aria-label={`Practice: ${SONG.title}`}
    >
      <div className="show-stage" aria-hidden="true" />
      <canvas ref={canvasRef} className="show-canvas" />

      <div className="show-hud">
        <button className="icon-round show-pause" onClick={pause} aria-label="Pause">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
        </button>
        <div className="show-title">
          <span>{SONG.title}</span>
          <span className="show-venue">{venue.name} · {DIFF.label}</span>
        </div>
        <span ref={scoreRef} className="show-score tabular">0</span>
      </div>
      <div className="show-progress" aria-hidden="true"><i ref={progressRef} /></div>
      <div className="show-tag">PRACTICE{options.speed !== 1 ? ` · ${options.speed * 100}%` : ""}{loopLabel ? ` · LOOPING ${loopLabel.toUpperCase()}` : ""}</div>

      <div className="show-crowd" aria-hidden="true">
        <span ref={crowdLabelRef} className="show-crowd-label">🙌 INTO IT</span>
        <div className="show-crowd-meter"><i ref={crowdFillRef} /></div>
      </div>
      <div ref={multRef} className="show-mult dim">×1</div>
      <div ref={calloutRef} className="show-callout" aria-live="polite" />
      <div ref={countRef} className="show-count" hidden />

      {phase === "gate" && (
        <div className="show-overlay">
          <div className="show-card">
            <p className="overline" style={{ color: "var(--marquee-bulb)", margin: 0 }}>{venue.name}</p>
            <h2 className="display-lg" style={{ margin: 0 }}>Ready when you are</h2>
            <p className="subtext on-dark-text">Turn your sound on. Tap the lanes as the notes cross the line.</p>
            <button className="btn btn-taxi" onClick={() => withAudio(ready)}>Tap to start</button>
          </div>
        </div>
      )}

      {phase === "calibrate" && ctxRef.current && (
        <Calibration ctx={ctxRef.current} onDone={() => begin()} />
      )}

      {phase === "paused" && (
        <div className="show-overlay">
          <div className="show-card">
            <h2 className="display-lg" style={{ margin: 0 }}>Paused</h2>
            <button className="btn btn-taxi" onClick={resume}>Resume</button>
            <button className="btn on-dark-secondary" onClick={() => withAudio(begin)}>Restart</button>
            <button className="btn on-dark-secondary" onClick={() => withAudio(() => {
              run.current?.player.stop();
              run.current = null;
              setPhase("calibrate");
            })}>Recalibrate</button>
            <button className="btn btn-ghost on-dark-ghost" onClick={() => withAudio(onExit)}>Quit practice</button>
          </div>
        </div>
      )}

      {phase === "resume" && <div className="show-count big">{countdown}</div>}

      {phase === "results" && outcome && (
        <PracticeResults
          outcome={outcome}
          where={options.where}
          venueName={venue.name}
          onAgain={() => withAudio(begin)}
          onExit={onExit}
        />
      )}
    </div>
  );
}
