"use client";

import type { PracticeOutcome, PracticeWhere } from "./PracticeShow";

const LOLA: Record<number, string> = {
  1: "Everyone starts somewhere. Usually somewhere quieter.",
  2: "Two stars. The amp has heard worse. Not much worse.",
  3: "Three stars. The neighbors stopped banging on the wall. Progress.",
  4: "Four stars for a laundromat. The dryers were into it.",
  5: "Five stars in practice. Save some for an actual crowd.",
};
const LOLA_GRIND: Record<number, string> = {
  ...LOLA,
  4: "Four stars. The barista stopped steaming milk to listen. Briefly.",
};

/** The results card (C57), practice version: no rewards row, a "Play again" button and a personal best for this phone. */
export function PracticeResults({
  outcome,
  where,
  venueName,
  onAgain,
  onExit,
}: {
  outcome: PracticeOutcome;
  where: PracticeWhere;
  venueName: string;
  onAgain: () => void;
  onExit: () => void;
}) {
  const r = outcome.results;
  const lola = (where === "grind" ? LOLA_GRIND : LOLA)[r.stars];
  return (
    <div className="show-results" role="dialog" aria-label="Results">
      <div className="show-results-card">
        <div className="show-marquee">
          <span className="overline" style={{ color: "var(--spotlight-400)" }}>Practice</span>
          <span className="show-marquee-name">{venueName}</span>
        </div>
        <div className="show-results-body">
          <div className="results-stars" aria-label={`${r.stars} of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={i <= r.stars ? "on" : ""} style={{ animationDelay: `${i * 120}ms` }}>★</span>
            ))}
          </div>
          <div className="display-xl tabular" style={{ textAlign: "center" }}>{r.score.toLocaleString("en-US")}</div>
          {(outcome.newBest || r.fullCombo) && (
            <div className="row" style={{ justifyContent: "center", gap: 6 }}>
              {r.fullCombo && <span className="tag show-badge-combo">FULL COMBO</span>}
              {outcome.newBest && <span className="tag show-badge-best">NEW BEST</span>}
            </div>
          )}
          <div className="show-stats">
            <div><b className="tabular">{Math.round(r.accuracy * 100)}%</b><span className="overline">Accuracy</span></div>
            <div><b className="tabular">{r.bestStreak}</b><span className="overline">Best streak</span></div>
            <div><b className="tabular">{r.crowdPeak}</b><span className="overline">Crowd peak</span></div>
            <div><b className="tabular">{r.hit} / {r.total}</b><span className="overline">Notes hit</span></div>
          </div>
          <p className="body lola-line">&ldquo;{lola}&rdquo;</p>
          <p className="meta" style={{ textAlign: "center", margin: 0 }}>
            Practice pays nothing and costs no Energy.{outcome.counted ? "" : " Bests count whole songs only."}
          </p>
          <div className="show-results-btns">
            <button className="btn btn-secondary" onClick={onAgain}>Play again</button>
            <button className="btn btn-taxi" onClick={onExit}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
