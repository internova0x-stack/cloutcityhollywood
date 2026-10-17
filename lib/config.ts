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
} as const;
