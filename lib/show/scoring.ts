// Grades, points, streaks, stars and the crowd meter's labels (Clarifications 4.5, 4.8, 4.9).

import { GAME_CONFIG } from "../config.ts";
import type { ChartNote } from "./chart.ts";

export type Grade = "perfect" | "great" | "good" | "miss";
export type HitGrade = Exclude<Grade, "miss">;

const S = GAME_CONFIG.show;

/** The grade for a tap this far (ms, either side) from its note, or null when it's outside every window. */
export function gradeFor(errorMs: number): HitGrade | null {
  const e = Math.abs(errorMs);
  if (e <= S.windows.perfect) return "perfect";
  if (e <= S.windows.great) return "great";
  if (e <= S.windows.good) return "good";
  return null;
}

/** The streak multiplier: ×1, then ×2 at 10 notes, ×3 at 20, ×4 at 30. */
export function multiplierFor(streak: number): number {
  return 1 + S.multiplierSteps.filter((n) => streak >= n).length;
}

/** The chart's base maximum: every note Perfect and every hold held to the end, without Hype. */
export function maxScore(notes: ChartNote[], beatMs: number): number {
  let total = 0;
  notes.forEach((n, i) => {
    const mult = multiplierFor(i + 1);
    total += S.points.perfect * mult;
    if (n.type === "hold") total += ((n.len ?? 0) / beatMs) * S.holdPointsPerBeat * mult;
  });
  return Math.round(total);
}

/** Stars: 1 for finishing, then 2 from 40% of the base maximum, 3 from 60%, 4 from 75%, 5 from 90%. */
export function starsFor(score: number, max: number): number {
  const share = max > 0 ? score / max : 0;
  return 1 + S.starShares.filter((s) => share >= s).length;
}

export type CrowdState = "losing_it" | "into_it" | "restless" | "booing";

export const CROWD_LABELS: Record<CrowdState, { label: string; emoji: string; color: string }> = {
  losing_it: { label: "LOSING IT", emoji: "🔥", color: "var(--crowd-losing-it)" },
  into_it: { label: "INTO IT", emoji: "🙌", color: "var(--crowd-into-it)" },
  restless: { label: "RESTLESS", emoji: "😐", color: "var(--crowd-restless)" },
  booing: { label: "BOOING", emoji: "👎", color: "var(--crowd-booing)" },
};

export function crowdState(value: number): CrowdState {
  if (value >= S.crowd.losingIt) return "losing_it";
  if (value >= S.crowd.intoIt) return "into_it";
  if (value >= S.crowd.restless) return "restless";
  return "booing";
}
