// Show audio on the Web Audio clock (Clarifications 4.13: the audio clock is the master). Until real stems
// arrive, the backing and the lead are synthesized from the song's score; the lead plays on its own bus so a
// missed note can drop it out for a moment (4.5).

import { GAME_CONFIG } from "../config.ts";
import { COUNT_IN_BEATS, type Performance } from "./songs.ts";

let shared: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

/**
 * The page's one audio context. Call it from a tap (Take the stage, Tap to start) the first time: phones
 * only start audio from a user gesture.
 */
export function audioContext(): AudioContext {
  if (!shared) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    shared = new Ctx({ latencyHint: "interactive" });
    const comp = shared.createDynamicsCompressor();
    master = shared.createGain();
    master.gain.value = 0.8;
    master.connect(comp).connect(shared.destination);
    noiseBuf = shared.createBuffer(1, shared.sampleRate * 2, shared.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (shared.state === "suspended") void shared.resume();
  return shared;
}

/** How long (ms) a sound takes from being scheduled to leaving the speaker. */
export function outputLatencyMs(ctx: AudioContext): number {
  return Math.min(250, ((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * 1000);
}

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

function env(ctx: AudioContext, t: number, peak: number, attack: number, decay: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function noise(ctx: AudioContext, t: number, dur: number): AudioBufferSourceNode {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  s.start(t, Math.random() * Math.max(0, 1.9 - dur));
  s.stop(t + dur);
  return s;
}

function filter(ctx: AudioContext, type: BiquadFilterType, freq: number, q = 1): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function osc(ctx: AudioContext, type: OscillatorType, freq: number, t: number, dur: number, to: AudioNode) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.connect(to);
  o.start(t);
  o.stop(t + dur);
  return o;
}

const kick = (ctx: AudioContext, t: number, out: AudioNode) => {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  o.connect(env(ctx, t, 0.85, 0.003, 0.28)).connect(out);
  o.start(t);
  o.stop(t + 0.32);
};

const snare = (ctx: AudioContext, t: number, out: AudioNode) => {
  noise(ctx, t, 0.18).connect(filter(ctx, "highpass", 1400)).connect(env(ctx, t, 0.3, 0.002, 0.14)).connect(out);
  const body = env(ctx, t, 0.2, 0.002, 0.07);
  body.connect(out);
  osc(ctx, "triangle", 185, t, 0.1, body);
};

const hat = (ctx: AudioContext, t: number, out: AudioNode, vol: number) => {
  noise(ctx, t, 0.05).connect(filter(ctx, "highpass", 7500)).connect(env(ctx, t, vol, 0.001, 0.04)).connect(out);
};

const crash = (ctx: AudioContext, t: number, out: AudioNode) => {
  noise(ctx, t, 1.2).connect(filter(ctx, "highpass", 5000)).connect(env(ctx, t, 0.12, 0.004, 1.1)).connect(out);
};

const bass = (ctx: AudioContext, midi: number, t: number, dur: number, out: AudioNode) => {
  const lp = filter(ctx, "lowpass", 380, 2);
  lp.connect(env(ctx, t, 0.3, 0.008, Math.max(0.08, dur))).connect(out);
  osc(ctx, "sawtooth", mtof(midi), t, dur + 0.05, lp);
};

const pad = (ctx: AudioContext, root: number, minor: boolean, t: number, dur: number, out: AudioNode) => {
  const e = env(ctx, t, 0.07, 0.04, dur);
  const lp = filter(ctx, "lowpass", 1800);
  lp.connect(e).connect(out);
  for (const step of [0, minor ? 3 : 4, 7]) osc(ctx, "triangle", mtof(root + 12 + step), t, dur + 0.1, lp);
};

const pluck = (ctx: AudioContext, midi: number, t: number, dur: number, out: AudioNode) => {
  const f = mtof(midi);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 2;
  lp.frequency.setValueAtTime(Math.min(f * 9, 10000), t);
  lp.frequency.exponentialRampToValueAtTime(f * 2, t + 0.35);
  const len = Math.max(0.25, Math.min(dur, 2.4));
  lp.connect(env(ctx, t, 0.16, 0.006, len)).connect(out);
  osc(ctx, "sawtooth", f, t, len + 0.05, lp);
  osc(ctx, "square", f * 1.004, t, len + 0.05, lp);
};

/** The "you missed" sound: a soft muted-string thunk. */
const mutedString = (ctx: AudioContext, t: number, out: AudioNode) => {
  noise(ctx, t, 0.09).connect(filter(ctx, "bandpass", 420, 2)).connect(env(ctx, t, 0.25, 0.002, 0.07)).connect(out);
};

/** A count-in or calibration click. */
export function click(ctx: AudioContext, t: number, accent = false) {
  if (!master) return;
  const hp = filter(ctx, "highpass", 600);
  hp.connect(env(ctx, t, 0.25, 0.001, 0.04)).connect(master);
  osc(ctx, "square", accent ? 1800 : 1200, t, 0.05, hp);
}

/** One run of a song: schedules its parts a moment ahead on the audio clock as it plays. */
export class SongPlayer {
  private readonly ctx: AudioContext;
  private readonly bus: GainNode;
  private readonly leadBus: GainNode;
  private readonly events: { t: number; play: (t: number) => void }[] = [];
  private next = 0;
  private stopped = false;

  /** `startAt` is the audio-clock time (s) of the song's first downbeat; the count-in plays before it. */
  constructor(ctx: AudioContext, perf: Performance, readonly startAt: number) {
    this.ctx = ctx;
    this.bus = ctx.createGain();
    this.bus.connect(master!);
    this.leadBus = ctx.createGain();
    this.leadBus.connect(this.bus);
    const b = perf.beatMs / 1000;
    const at = (ms: number) => startAt + ms / 1000;
    const add = (t: number, play: (t: number) => void) => this.events.push({ t, play });
    const out = this.bus;

    for (let i = 0; i < COUNT_IN_BEATS; i++) add(startAt - (COUNT_IN_BEATS - i) * b, (t) => click(ctx, t, i === 0));
    for (const bar of perf.bars) {
      const t0 = at(bar.startMs);
      const [root, quality] = bar.chord;
      if (bar.first) add(t0, (t) => crash(ctx, t, out));
      for (const beat of bar.big ? [0, 2, 2.5] : [0, 2]) add(t0 + beat * b, (t) => kick(ctx, t, out));
      for (const beat of [1, 3]) add(t0 + beat * b, (t) => snare(ctx, t, out));
      for (let e = 0; e < 8; e++) add(t0 + (e * b) / 2, (t) => hat(ctx, t, out, e % 2 ? 0.04 : 0.07));
      const step = bar.big ? 0.5 : 1;
      for (let x = 0; x < 4; x += step) add(t0 + x * b, (t) => bass(ctx, root - 12 + (bar.big && x % 1 ? 12 : 0), t, step * b * 0.85, out));
      for (const beat of [0, 2]) add(t0 + beat * b, (t) => pad(ctx, root, quality === "min", t, b * 1.8, out));
    }
    for (const n of perf.lead) add(at(n.t), (t) => pluck(ctx, n.midi, t, (n.durMs / 1000) * 0.95, this.leadBus));
    add(at(perf.lengthMs), (t) => {
      kick(ctx, t, out);
      crash(ctx, t, out);
    });
    this.events.sort((x, y) => x.t - y.t);
  }

  /** Schedules everything due in the next quarter second. Call it every frame (and from a timer). */
  pump() {
    if (this.stopped) return;
    const until = this.ctx.currentTime + 0.25;
    while (this.next < this.events.length && this.events[this.next].t < until) {
      const e = this.events[this.next++];
      e.play(Math.max(e.t, this.ctx.currentTime));
    }
  }

  /** A missed note: the lead drops out briefly and a muted string plays. */
  dropLead() {
    const t = this.ctx.currentTime;
    const g = this.leadBus.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0, t, 0.015);
    g.setTargetAtTime(1, t + GAME_CONFIG.show.leadDropMs / 1000, 0.05);
    mutedString(this.ctx, t, this.bus);
  }

  /** Fades this run out and frees it. */
  stop() {
    this.stopped = true;
    const t = this.ctx.currentTime;
    this.bus.gain.setTargetAtTime(0, t, 0.05);
    setTimeout(() => this.bus.disconnect(), 400);
  }
}
