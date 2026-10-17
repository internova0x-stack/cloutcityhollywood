"use client";

import { useState } from "react";
import { GAME_CONFIG } from "@/lib/config";
import { WARM_UP_LOOP } from "@/lib/show/songs";
import { Sheet } from "../Sheet";
import { bestKey, PRACTICE_VENUES, readBests, type PracticeOptions, type PracticeWhere } from "./PracticeShow";

const SONG = WARM_UP_LOOP;

/** Practice setup (Clarifications 4.10): where, the song, speed and an optional looped section. */
export function PracticeSheet({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart: (o: PracticeOptions) => void }) {
  const [where, setWhere] = useState<PracticeWhere>("home");
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState<string | null>(null);
  const best = open ? readBests()[bestKey(SONG.id, speed)] : undefined;

  return (
    <Sheet open={open} onClose={onClose} label="Practice">
      <div className="stack-16" style={{ paddingTop: 4 }}>
        <div className="stack-4" style={{ paddingRight: 44 }}>
          <h2 className="display-lg" style={{ margin: 0 }}>Practice</h2>
          <p className="subtext" style={{ margin: 0 }}>Free and unlimited. Nothing to lose but your dignity.</p>
        </div>

        <div className="stack-8">
          <span className="overline">Where</span>
          <div className="practice-pair">
            {(Object.keys(PRACTICE_VENUES) as PracticeWhere[]).map((w) => (
              <button key={w} className="select-card multi" aria-pressed={where === w} onClick={() => setWhere(w)}>
                <span className="body-strong">{PRACTICE_VENUES[w].name}</span>
                <span className="subtext" style={{ display: "block" }}>{PRACTICE_VENUES[w].sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="stack-8">
          <span className="overline">Song</span>
          <div className="practice-song">
            <span className="practice-tile" aria-hidden="true">🎵</span>
            <span className="stack-4" style={{ flex: 1, minWidth: 0 }}>
              <span className="title" style={{ display: "block" }}>{SONG.title}</span>
              <span className="meta" style={{ display: "block" }}>Placeholder tune · {SONG.feel} · {SONG.bpm} BPM</span>
            </span>
            <span className="stars practice-stars" aria-label={best ? `Best: ${best.stars} stars` : "Not played yet"}>
              {best ? [1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= best.stars ? "on" : ""}>★</span>) : <span className="tag tag-event">NEW</span>}
            </span>
          </div>
        </div>

        <div className="stack-8">
          <span className="overline">Difficulty</span>
          <div className="row" style={{ gap: 6 }}>
            <span className="tag practice-diff">OPEN MIC</span>
            <span className="tag tag-neutral">BAR · coming in v0.2</span>
          </div>
        </div>

        <div className="stack-8">
          <span className="overline">Speed</span>
          <div className="row" style={{ gap: 8 }}>
            {GAME_CONFIG.show.practiceSpeeds.map((s) => (
              <button key={s} className="chip" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s * 100}%</button>
            ))}
          </div>
        </div>

        <div className="stack-8">
          <span className="overline">Loop a section</span>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="chip" aria-pressed={loop === null} onClick={() => setLoop(null)}>Whole song</button>
            {SONG.loopable.map((id) => (
              <button key={id} className="chip" aria-pressed={loop === id} onClick={() => setLoop(id)}>{SONG.sections[id].label}</button>
            ))}
          </div>
          {loop && <p className="meta" style={{ margin: 0 }}>Plays the {SONG.sections[loop].label.toLowerCase()} {GAME_CONFIG.show.loopPasses} times in a row.</p>}
        </div>

        <button className="btn btn-taxi" style={{ width: "100%" }} onClick={() => onStart({ where, speed, loop })}>Take the stage</button>
      </div>
    </Sheet>
  );
}
