// The two clocks (Clarifications §10, unchanged from Clout City NYC): the city clock (one day every 2 real
// hours) for day, night, venue hours and show-slot times; the story calendar (real New York days) for
// beats, resets, bills and anything that pays out. The server is authoritative (migration 0001); these
// mirror it for display. Safe to import anywhere.

const CITY_DAY_MS = 2 * 60 * 60 * 1000;

/** Minutes since city-clock midnight (0 to 1439) at an instant (ms). */
export function cityMinutes(nowMs: number): number {
  return Math.floor(((((nowMs % CITY_DAY_MS) + CITY_DAY_MS) % CITY_DAY_MS) / CITY_DAY_MS) * 1440);
}

/** The New York calendar date (YYYY-MM-DD) at an instant (ms). */
export function nyDate(nowMs: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(nowMs));
}
