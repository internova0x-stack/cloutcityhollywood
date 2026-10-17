// Songs for the performance game. Until the real tracks arrive (owner, Oct 17), each song is a placeholder
// made in code: a short score that becomes both the chart and the synth parts (a backing and a lead), at
// the song's BPM. Swapping in real stems later changes only what plays, never this file's shape.

import { GAME_CONFIG } from "../config.ts";
import type { Chart, ChartNote, ChartSection, Difficulty } from "./chart.ts";

/** One lead note: [beat within the bar, MIDI note, length in beats]. */
type LeadNote = [number, number, number];
/** One bar's chord: [root MIDI note, quality]. */
type Chord = [number, "maj" | "min"];

interface SongSection {
  id: string;
  label: string;
  chords: Chord[];
  /** Lead notes per bar; the same length as `chords`. */
  lead: LeadNote[][];
  /** Whether the drums play the busier chorus pattern. */
  big?: boolean;
}

export interface Song {
  id: string;
  title: string;
  feel: string;
  bpm: number;
  sections: Record<string, SongSection>;
  /** The order sections play in. */
  form: string[];
  /** Sections a player can loop in practice, in the order shown. */
  loopable: string[];
}

const C: Chord = [48, "maj"], G: Chord = [43, "maj"], Am: Chord = [45, "min"], F: Chord = [41, "maj"];

/** "Warm-Up Loop": the practice placeholder, an easy indie-pop tune in C at 92 BPM. */
export const WARM_UP_LOOP: Song = {
  id: "warm-up-loop",
  title: "Warm-Up Loop",
  feel: "Indie pop",
  bpm: 92,
  sections: {
    intro: {
      id: "intro", label: "Intro", chords: [C, G],
      lead: [[[0, 60, 2], [2, 64, 2]], [[0, 67, 4]]],
    },
    verse: {
      id: "verse", label: "Verse", chords: [C, G, Am, F, C, G, F, C],
      lead: [
        [[0, 64, 1], [1, 67, 1], [2, 69, 1], [3, 67, 1]],
        [[0, 67, 2], [2, 62, 1], [3, 64, 1]],
        [[0, 64, 1], [1, 67, 1], [2, 72, 1], [3, 71, 1]],
        [[0, 69, 3]],
        [[0, 64, 1], [1, 67, 1], [2, 69, 1], [3, 72, 1]],
        [[0, 71, 2], [2, 69, 1], [3, 67, 1]],
        [[0, 65, 1], [1, 67, 1], [2, 69, 1], [3, 67, 1]],
        [[0, 64, 3]],
      ],
    },
    chorus: {
      id: "chorus", label: "Chorus", big: true, chords: [F, G, C, Am, F, G, C, C],
      lead: [
        [[0, 72, 1], [1, 72, 1], [2, 71, 1], [3, 69, 1]],
        [[0, 71, 2], [2, 67, 2]],
        [[0, 72, 1], [1, 74, 1], [2, 76, 1], [3, 72, 1]],
        [[0, 64, 3]],
        [[0, 72, 1], [1, 72, 1], [2, 71, 1], [3, 69, 1]],
        [[0, 71, 1], [1, 72, 1], [2, 74, 2]],
        [[0, 76, 1], [1, 74, 1], [2, 72, 1], [3, 71, 1]],
        [[0, 72, 4]],
      ],
    },
    outro: {
      id: "outro", label: "Outro", chords: [F, C],
      lead: [[[0, 72, 2], [2, 67, 2]], [[0, 60, 4]]],
    },
  },
  form: ["intro", "verse", "chorus", "verse", "chorus", "outro"],
  loopable: ["verse", "chorus"],
};

export const SONGS: Song[] = [WARM_UP_LOOP];

export const COUNT_IN_BEATS = 4;

/** A bar as it will be played. */
export interface PlayedBar {
  startMs: number;
  chord: Chord;
  big: boolean;
  /** The first bar of a section or of a loop pass (for a crash). */
  first: boolean;
}

/** A lead note as it will be played. */
export interface PlayedNote {
  t: number;
  midi: number;
  durMs: number;
}

/** Everything one run of a song needs: the chart, the synth parts and the timing, at the chosen speed. */
export interface Performance {
  song: Song;
  chart: Chart;
  beatMs: number;
  bars: PlayedBar[];
  lead: PlayedNote[];
  /** The last bar's end, in ms. */
  lengthMs: number;
  /** The looped section, or null for the whole song. */
  loop: string | null;
}

/** Which lane a pitch goes in: low notes left, high notes right, split evenly over the lead's range. */
function laneFor(midi: number, lo: number, hi: number, lanes: number): number {
  return Math.max(0, Math.min(lanes - 1, Math.floor(((midi - lo) / (hi - lo + 1)) * lanes)));
}

/**
 * Builds a run of the song: the whole song, or one section played `loopPasses` times. Speed below 1 slows
 * the tempo (the placeholder synth keeps its pitch). Notes of a beat or more become holds that end half a
 * beat early, so the next note always has room.
 */
export function buildPerformance(song: Song, opts: { difficulty: Difficulty; speed: number; loop: string | null }): Performance {
  const cfg = GAME_CONFIG.show;
  const lanes = cfg.difficulties[opts.difficulty].lanes;
  const beatMs = 60000 / (song.bpm * opts.speed);
  const barMs = beatMs * 4;
  const order = opts.loop ? Array.from({ length: cfg.loopPasses }, () => opts.loop as string) : song.form;

  const pitches = Object.values(song.sections).flatMap((s) => s.lead.flat().map((n) => n[1]));
  const lo = Math.min(...pitches), hi = Math.max(...pitches);

  const bars: PlayedBar[] = [];
  const lead: PlayedNote[] = [];
  const notes: ChartNote[] = [];
  const sections: ChartSection[] = [];
  let barIndex = 0;
  order.forEach((id, pass) => {
    const sec = song.sections[id];
    const start = barIndex * barMs;
    sec.chords.forEach((chord, b) => {
      const barStart = barIndex * barMs;
      bars.push({ startMs: barStart, chord, big: !!sec.big, first: b === 0 });
      for (const [beat, midi, dur] of sec.lead[b]) {
        const t = barStart + beat * beatMs;
        lead.push({ t, midi, durMs: dur * beatMs });
        const lane = laneFor(midi, lo, hi, lanes);
        notes.push(dur >= 2 ? { t, lane, type: "hold", len: (dur - 0.5) * beatMs } : { t, lane, type: "tap" });
      }
      barIndex++;
    });
    sections.push({ id: opts.loop ? `${id}-${pass + 1}` : id, label: opts.loop ? `${sec.label} ${pass + 1}` : sec.label, start, end: barIndex * barMs });
  });

  return {
    song,
    beatMs,
    bars,
    lead,
    lengthMs: barIndex * barMs,
    loop: opts.loop,
    chart: { songId: song.id, difficulty: opts.difficulty, bpm: song.bpm * opts.speed, offsetMs: 0, sections, notes },
  };
}
