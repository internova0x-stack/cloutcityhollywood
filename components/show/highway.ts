// Draws the note highway (C51 to C53) on a canvas: lanes narrowing toward the top for depth, beat lines,
// the hit line 22% up with a target per lane, notes and hold tails, judgments and hit sparks.

import type { LiveNote } from "@/lib/show/engine";
import type { Grade } from "@/lib/show/scoring";

/** Lane colors (tokens --lane-1 to --lane-4); each lane also has its own shape so it reads without color. */
export const LANE_COLORS = ["#2EC4FF", "#FF2E88", "#FFC21A", "#8BE04B"];
const CREAM = "#FFF6E0";
const JUDGE_COLORS: Record<Grade, string> = { perfect: "#FFF6E0", great: "#8BE04B", good: "#2EC4FF", miss: "rgba(217,58,47,.9)" };
const JUDGE_WORDS: Record<Grade, string> = { perfect: "PERFECT", great: "GREAT", good: "GOOD", miss: "MISS" };
const NOTE_SIZE = 48;
const HIT_LINE = 0.22;
/** Taps count from the bottom edge up to this far above the hit line (C51). */
export const TAP_ZONE_ABOVE = 40;

export interface Geometry {
  w: number;
  h: number;
  lanes: number;
  hitY: number;
  topY: number;
  bottomW: number;
  topW: number;
}

export function geometry(w: number, h: number, lanes: number, topY: number): Geometry {
  // About 300 pt wide at the hit line, never under 64 pt a lane, leaving room for the meters at the edges.
  const bottomW = Math.max(lanes * 64, Math.min(w - 72, lanes * 112));
  return { w, h, lanes, hitY: h * (1 - HIT_LINE), topY, bottomW, topW: bottomW * 0.6 };
}

const progress = (g: Geometry, y: number) => (y - g.topY) / (g.hitY - g.topY);
const widthAt = (g: Geometry, y: number) => g.topW + (g.bottomW - g.topW) * progress(g, y);
const laneX = (g: Geometry, lane: number, y: number) => g.w / 2 + (lane + 0.5 - g.lanes / 2) * (widthAt(g, y) / g.lanes);

/** The lane under a tap at x. Taps outside the highway count for the nearest outer lane. */
export function laneAt(g: Geometry, x: number): number {
  const left = g.w / 2 - g.bottomW / 2;
  return Math.max(0, Math.min(g.lanes - 1, Math.floor(((x - left) / g.bottomW) * g.lanes)));
}

function shapePath(ctx: CanvasRenderingContext2D, lane: number, x: number, y: number, r: number) {
  ctx.beginPath();
  if (lane === 0) ctx.arc(x, y, r, 0, Math.PI * 2);
  else if (lane === 1) {
    ctx.moveTo(x, y - r * 1.15);
    ctx.lineTo(x + r * 1.15, y);
    ctx.lineTo(x, y + r * 1.15);
    ctx.lineTo(x - r * 1.15, y);
    ctx.closePath();
  } else if (lane === 2) ctx.roundRect(x - r * 0.92, y - r * 0.92, r * 1.84, r * 1.84, r * 0.18);
  else {
    ctx.moveTo(x, y - r * 1.1);
    ctx.lineTo(x + r * 1.05, y + r * 0.8);
    ctx.lineTo(x - r * 1.05, y + r * 0.8);
    ctx.closePath();
  }
}

/** Notes are pre-drawn once per lane (shape, cream outline, soft glow) and stamped each frame: glow is slow to draw live. */
function noteSprite(lane: number, dpr: number): HTMLCanvasElement {
  const size = Math.ceil(NOTE_SIZE * 1.6 * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const mid = size / dpr / 2;
  ctx.shadowColor = LANE_COLORS[lane] + "59";
  ctx.shadowBlur = 12;
  shapePath(ctx, lane, mid, mid, NOTE_SIZE / 2);
  ctx.fillStyle = LANE_COLORS[lane];
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = CREAM;
  ctx.stroke();
  return c;
}

export interface Judgment {
  lane: number;
  grade: Grade;
  /** performance.now() when it appeared. */
  at: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface FrameState {
  /** The song's clock as heard, in ms (negative during the count-in). */
  now: number;
  notes: LiveNote[];
  beatMs: number;
  lengthMs: number;
  visibleMs: number;
  /** How many thumbs are down in each lane. */
  pressed: number[];
  judgments: (Judgment | null)[];
  /** performance.now() of each lane's last miss, for the red flash. */
  missAt: number[];
  reduced: boolean;
}

export class Highway {
  private sprites: HTMLCanvasElement[] = [];
  private sparks: Spark[] = [];
  private rings: { x: number; y: number; at: number }[] = [];
  private font = "Bungee, Impact, sans-serif";
  private last = performance.now();

  constructor(private readonly ctx: CanvasRenderingContext2D, private g: Geometry, private dpr: number) {
    this.sprites = LANE_COLORS.map((_, i) => noteSprite(i, dpr));
    const family = getComputedStyle(document.documentElement).getPropertyValue("--ff-bungee").trim();
    if (family) this.font = `${family}, Impact, sans-serif`;
  }

  resize(g: Geometry, dpr: number) {
    this.g = g;
    if (dpr !== this.dpr) {
      this.dpr = dpr;
      this.sprites = LANE_COLORS.map((_, i) => noteSprite(i, dpr));
    }
  }

  /** Hit sparks from a lane's target: 6 to 10 particles, more and a cream ring on Perfect; a plain ring under reduced motion. */
  spark(lane: number, perfect: boolean, reduced: boolean) {
    const x = laneX(this.g, lane, this.g.hitY), y = this.g.hitY;
    if (perfect || reduced) this.rings.push({ x, y, at: performance.now() });
    if (reduced) return;
    const n = perfect ? 10 : 6;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 160;
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 1, color: LANE_COLORS[lane] });
    }
  }

  draw(s: FrameState) {
    const { ctx, g } = this;
    const t = performance.now();
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    ctx.clearRect(0, 0, g.w, g.h);

    // The highway: a dark trapezoid so notes always win over the stage behind.
    const extend = (g.h - g.topY) / (g.hitY - g.topY);
    const bottomEdgeW = g.topW + (g.bottomW - g.topW) * extend;
    ctx.fillStyle = "rgba(20,17,26,.62)";
    ctx.beginPath();
    ctx.moveTo(g.w / 2 - g.topW / 2, g.topY);
    ctx.lineTo(g.w / 2 + g.topW / 2, g.topY);
    ctx.lineTo(g.w / 2 + bottomEdgeW / 2, g.h);
    ctx.lineTo(g.w / 2 - bottomEdgeW / 2, g.h);
    ctx.closePath();
    ctx.fill();

    const yFor = (time: number) => g.topY + (1 - (time - s.now) / s.visibleMs) * (g.hitY - g.topY);

    // Beat lines every beat (8%), stronger every bar (16%).
    const firstBeat = Math.ceil((s.now - s.visibleMs * 0.3) / s.beatMs);
    for (let k = firstBeat; ; k++) {
      const time = k * s.beatMs;
      if (time > s.lengthMs) break;
      const y = yFor(time);
      if (y < g.topY) break;
      if (y > g.h) continue;
      const half = widthAt(g, y) / 2;
      ctx.fillStyle = k % 4 === 0 ? "rgba(255,246,224,.16)" : "rgba(255,246,224,.08)";
      ctx.fillRect(g.w / 2 - half, y - 0.5, half * 2, 1);
    }

    // Lane dividers.
    ctx.strokeStyle = "rgba(255,246,224,.18)";
    ctx.lineWidth = 1;
    for (let i = 1; i < g.lanes; i++) {
      ctx.beginPath();
      ctx.moveTo(g.w / 2 + (i - g.lanes / 2) * (g.topW / g.lanes), g.topY);
      ctx.lineTo(g.w / 2 + (i - g.lanes / 2) * (bottomEdgeW / g.lanes), g.h);
      ctx.stroke();
    }

    // Pressed lanes: a 40% lane-color column; misses flash the lane red for 120 ms.
    for (let lane = 0; lane < g.lanes; lane++) {
      const missAge = t - s.missAt[lane];
      const pressed = s.pressed[lane] > 0;
      if (!pressed && missAge > 120) continue;
      const y0 = g.hitY - 240;
      const w0 = widthAt(g, y0) / g.lanes, w1 = widthAt(g, g.h) / g.lanes;
      const grad = ctx.createLinearGradient(0, g.h, 0, y0);
      const color = missAge <= 120 ? "rgba(217,58,47," : LANE_COLORS[lane];
      if (missAge <= 120) {
        grad.addColorStop(0, color + ".25)");
        grad.addColorStop(1, color + "0)");
      } else {
        grad.addColorStop(0, color + "66");
        grad.addColorStop(1, color + "00");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(laneX(g, lane, y0) - w0 / 2, y0);
      ctx.lineTo(laneX(g, lane, y0) + w0 / 2, y0);
      ctx.lineTo(laneX(g, lane, g.h) + w1 / 2, g.h);
      ctx.lineTo(laneX(g, lane, g.h) - w1 / 2, g.h);
      ctx.closePath();
      ctx.fill();
    }

    // The hit line and the targets: an outlined copy of each lane's shape, brighter while pressed.
    ctx.fillStyle = "rgba(255,246,224,.7)";
    const half = g.bottomW / 2 + 8;
    ctx.fillRect(g.w / 2 - half, g.hitY - 1.5, half * 2, 3);
    for (let lane = 0; lane < g.lanes; lane++) {
      const x = laneX(g, lane, g.hitY);
      shapePath(ctx, lane, x, g.hitY, NOTE_SIZE / 2 + 2);
      if (s.pressed[lane] > 0) {
        ctx.fillStyle = LANE_COLORS[lane] + "55";
        ctx.fill();
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = LANE_COLORS[lane];
      ctx.stroke();
    }

    // Notes, last first so earlier notes draw on top. A hit hold keeps its head on the line while held.
    // Clipped to the highway, so notes coming in never draw over the HUD.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, g.topY, g.w, g.h - g.topY);
    ctx.clip();
    for (let i = s.notes.length - 1; i >= 0; i--) {
      const n = s.notes[i];
      if (n.state === 1 && !(n.type === "hold" && n.holding)) continue;
      const end = n.type === "hold" ? n.t + (n.len ?? 0) : n.t;
      const headT = n.holding ? Math.max(n.t, s.now) : n.t;
      const yHead = yFor(headT);
      const yTail = yFor(end);
      if (yTail > g.h + NOTE_SIZE || yHead < g.topY - NOTE_SIZE) continue;
      const dim = n.state === 2 ? 0.35 : 1;
      if (n.type === "hold") {
        const top = Math.max(g.topY, yTail);
        if (yHead > top) {
          const wTop = 18 * (0.55 + 0.45 * Math.max(0, progress(g, top)));
          const wBot = 18 * (0.55 + 0.45 * Math.max(0, progress(g, yHead)));
          ctx.globalAlpha = (n.holding ? 0.9 : 0.55) * dim;
          ctx.fillStyle = LANE_COLORS[n.lane];
          ctx.beginPath();
          ctx.moveTo(laneX(g, n.lane, top) - wTop / 2, top);
          ctx.lineTo(laneX(g, n.lane, top) + wTop / 2, top);
          ctx.lineTo(laneX(g, n.lane, yHead) + wBot / 2, yHead);
          ctx.lineTo(laneX(g, n.lane, yHead) - wBot / 2, yHead);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      if (yHead < g.topY - NOTE_SIZE || yHead > g.h + NOTE_SIZE) continue;
      const scale = 0.55 + 0.45 * Math.max(0, progress(g, yHead));
      const sprite = this.sprites[n.lane];
      const size = (sprite.width / this.dpr) * scale;
      ctx.globalAlpha = dim;
      ctx.drawImage(sprite, laneX(g, n.lane, yHead) - size / 2, yHead - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Sparks and Perfect rings.
    this.sparks = this.sparks.filter((p) => (p.life -= dt * 2.4) > 0);
    for (const p of this.sparks) {
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
    }
    this.rings = this.rings.filter((r) => t - r.at < 300);
    for (const r of this.rings) {
      const k = (t - r.at) / 300;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = CREAM;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, NOTE_SIZE / 2 + 6 + k * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Judgments: 40 pt above the hit line in their lane, rising 12 pt and fading over 300 ms (latest per lane only).
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `18px ${this.font}`;
    s.judgments.forEach((j, lane) => {
      if (!j) return;
      const age = t - j.at;
      if (age > 300) return;
      const k = age / 300;
      ctx.globalAlpha = 1 - k * 0.8;
      ctx.fillStyle = JUDGE_COLORS[j.grade];
      if (j.grade === "perfect") {
        ctx.shadowColor = "#FF2E88";
        ctx.shadowBlur = 10;
      }
      ctx.fillText(JUDGE_WORDS[j.grade], laneX(g, lane, g.hitY), g.hitY - 40 - k * 12);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
  }
}
