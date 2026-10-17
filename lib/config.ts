// Tunable numbers for the browser. Economy numbers live in the database (game_settings) once v0.2
// turns the economy on.

export const GAME_CONFIG = {
  profile: {
    nameMinLength: 3,
    nameMaxLength: 20,
  },

  /** Invite links: /i/<code>. The code is kept in this cookie through sign-up. */
  invite: {
    cookieName: "cch_invite",
    cookieMaxAgeDays: 30,
  },

  /** The crew: "2 of 5 joined" (Clout City Clarifications 7). Rewards unlock when the town opens. */
  crew: { size: 5 },

  /** Set for an hour when someone confirms 18+ and then signs in with Google. */
  ageCookieName: "cch_age_ok",

  /**
   * The performance game (Clarifications 4). Only Open Mic is playable in v0.1 (practice); the other
   * difficulties are here so charts can be checked against them.
   */
  show: {
    /** Timing windows either side of the note, in ms, and what each grade is worth (4.5). */
    windows: { perfect: 45, great: 90, good: 135 },
    points: { perfect: 100, great: 70, good: 40 },
    /** Accuracy weight per grade, for the results card. */
    accuracy: { perfect: 1, great: 0.7, good: 0.4 },
    /** Points per beat a hold is held, before the multiplier. */
    holdPointsPerBeat: 10,
    /** Streak multiplier: ×2 at 10 notes, ×3 at 20, ×4 at 30. */
    multiplierSteps: [10, 20, 30],
    /** Crowd meter: starts at 60 out of 100; Open Mic halves drains and can't boo you off (4.8). */
    crowd: { start: 60, perfect: 1.5, great: 1.5, good: 0.5, miss: -4, losingIt: 80, intoIt: 50, restless: 25 },
    /** Stars from the score as a share of the chart's base maximum: 2 from 40%, ... 5 from 90% (4.9). */
    starShares: [0.4, 0.6, 0.75, 0.9],
    /** Callouts (4.5): the first 25 notes clean, then every 50-note streak. */
    hotStartNotes: 25,
    streakCallout: 50,
    /** A missed note mutes the lead part for this long, so the mistake is heard. */
    leadDropMs: 600,
    difficulties: {
      open_mic: { label: "Open Mic", lanes: 3, maxNotesPerSecond: 2, visibleMs: 2000, crowdDrain: 0.5, canBoo: false },
      bar: { label: "Bar", lanes: 4, maxNotesPerSecond: 3.5, visibleMs: 1800, crowdDrain: 1, canBoo: true },
      club: { label: "Club", lanes: 4, maxNotesPerSecond: 5, visibleMs: 1600, crowdDrain: 1, canBoo: true },
      theater: { label: "Theater", lanes: 4, maxNotesPerSecond: 6.5, visibleMs: 1400, crowdDrain: 1, canBoo: true },
    },
    /** Chart validation (4.12). */
    minSameLaneGapMs: 120,
    minHoldMs: 400,
    /** Practice (4.10): full speed or 75%, and a looped section plays this many times. */
    practiceSpeeds: [1, 0.75],
    loopPasses: 3,
    /** Calibration (C64): taps along to this many beats; the offset is saved on the device. */
    calibrationBeats: 8,
    calibrationKey: "cch_audio_offset_ms",
    bestKey: "cch_practice_best",
  },
} as const;
