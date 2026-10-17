"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "@/lib/config";
import { click, outputLatencyMs } from "@/lib/show/audio";

const KEY = GAME_CONFIG.show.calibrationKey;
const SKIP_KEY = `${KEY}_skipped`;
const BEAT_S = 0.6;

/** This phone's saved tap offset (ms), or null before calibration. */
export function savedOffset(): number | null {
  try {
    const v = localStorage.getItem(KEY);
    return v == null || !Number.isFinite(Number(v)) ? null : Number(v);
  } catch {
    return null;
  }
}

/** Whether the player chose "Skip for now" on this phone (asked once; Recalibrate is in the pause menu). */
export function calibrationSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return true;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows: asked again next time.
  }
}

/**
 * Calibration (C64): tap along to 8 beats; the median gap between each click and its tap is this phone's
 * offset, saved on the device. It covers both the speaker's delay and the screen's.
 */
export function Calibration({ ctx, onDone }: { ctx: AudioContext; onDone: () => void }) {
  const [stage, setStage] = useState<"intro" | "running" | "done" | "retry">("intro");
  const [offset, setOffset] = useState(0);
  const ringRef = useRef<HTMLButtonElement>(null);
  const taps = useRef<number[]>([]);
  const start = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beats = GAME_CONFIG.show.calibrationBeats;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // The ring pulses on each beat as it's heard.
  useEffect(() => {
    if (stage !== "running") return;
    let raf = 0;
    const latency = outputLatencyMs(ctx) / 1000;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const since = ctx.currentTime - latency - start.current;
      const k = since < 0 ? 1 : (since % BEAT_S) / BEAT_S;
      ringRef.current?.style.setProperty("--pulse", String(1 - Math.min(1, k * 2.5)));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [stage, ctx]);

  function run() {
    taps.current = [];
    start.current = ctx.currentTime + 1;
    for (let i = 0; i < beats; i++) click(ctx, start.current + i * BEAT_S, i === 0);
    setStage("running");
    timer.current = setTimeout(measure, (1 + beats * BEAT_S + 0.5) * 1000);
  }

  function measure() {
    const clicks = Array.from({ length: beats }, (_, i) => start.current + i * BEAT_S);
    const gaps = taps.current
      .map((tap) => {
        const nearest = clicks.reduce((best, c) => (Math.abs(tap - c) < Math.abs(tap - best) ? c : best), clicks[0]);
        return tap - nearest;
      })
      .filter((g) => Math.abs(g) < 0.3)
      .sort((a, b) => a - b);
    if (gaps.length < 5) {
      setStage("retry");
      return;
    }
    setOffset(Math.round(gaps[Math.floor(gaps.length / 2)] * 1000));
    setStage("done");
  }

  function onTap(e: React.PointerEvent) {
    e.preventDefault();
    if (stage !== "running") return;
    const late = Math.max(0, Math.min(100, performance.now() - e.timeStamp)) / 1000;
    taps.current.push(ctx.currentTime - late);
  }

  return (
    <div className="show-overlay calib">
      <div className="show-card">
        <p className="overline" style={{ color: "var(--marquee-bulb)", margin: 0 }}>Calibration</p>
        <h2 className="display-lg" style={{ margin: 0 }}>{stage === "done" ? "You're synced" : "Sync your taps"}</h2>
        {stage === "intro" && (
          <>
            <p className="subtext on-dark-text">
              Phones and headphones add a little delay. Tap along to {beats} beats so your notes land on time. Do it with the sound you&apos;ll play with.
            </p>
            <button className="btn btn-taxi" onClick={run}>Start</button>
            <button className="btn btn-ghost on-dark-ghost" onClick={() => {
              store(SKIP_KEY, "1");
              onDone();
            }}>Skip for now</button>
          </>
        )}
        {(stage === "running" || stage === "retry") && (
          <>
            <p className="subtext on-dark-text">{stage === "retry" ? "Missed a few. Tap on every click." : "Tap the big button on every beat."}</p>
            <button ref={ringRef} className="calib-ring" onPointerDown={onTap} aria-label="Tap on the beat" disabled={stage === "retry"} />
            {stage === "retry" && <button className="btn btn-taxi" onClick={run}>Try again</button>}
          </>
        )}
        {stage === "done" && (
          <>
            <p className="meta on-dark-meta">Offset {offset} ms</p>
            <button className="btn btn-taxi" onClick={() => {
              store(KEY, String(offset));
              onDone();
            }}>Done</button>
            <button className="btn on-dark-secondary" onClick={run}>Redo</button>
          </>
        )}
      </div>
    </div>
  );
}
