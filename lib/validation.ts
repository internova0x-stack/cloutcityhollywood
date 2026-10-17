// Shared input rules for claiming a name. Mirrors the database constraint (migration 0002).

import { GAME_CONFIG } from "./config.ts";

// Usernames are @handles: letters, numbers, _ and . only.
const USERNAME = /^[A-Za-z0-9_.]+$/;

/** What the player typed, minus spaces at the ends and a leading @. */
export function cleanName(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

/** Returns an error message for the player, or null when the username is fine. */
export function nameError(raw: string): string | null {
  const name = cleanName(raw);
  const { nameMinLength, nameMaxLength } = GAME_CONFIG.profile;
  if (name.length === 0) return "Every legend needs a name. Even the one-name ones.";
  if (/\s/.test(name)) return "No spaces in a username. Try riff_queen or riffqueen.";
  if (!USERNAME.test(name)) return "Letters, numbers, _ and . only.";
  if (name.length < nameMinLength) return `At least ${nameMinLength} characters. Even Sia has three.`;
  if (name.length > nameMaxLength) return `${nameMaxLength} characters max. Save the rest for the liner notes.`;
  return null;
}

/** How a player's name is shown: @riffqueen. */
export function handle(name: string | null | undefined): string {
  return name ? `@${name}` : "";
}
