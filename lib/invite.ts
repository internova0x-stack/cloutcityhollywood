// Invite codes: 6 characters from an alphabet without look-alikes (no 0/O, 1/I/L).
// The database generates codes with the same alphabet (supabase/migrations/0002).

export const INVITE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_CODE_LENGTH = 6;

/** Normalizes user-typed or URL codes. Returns null when the code can't be valid. */
export function normalizeInviteCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (code.length !== INVITE_CODE_LENGTH) return null;
  for (const ch of code) {
    if (!INVITE_ALPHABET.includes(ch)) return null;
  }
  return code;
}

/** The personal invite link. */
export function inviteUrl(origin: string, code: string): string {
  return `${origin.replace(/\/+$/, "")}/i/${code}`;
}

/** "2 of 5" progress toward a full crew, capped at the crew size. */
export function crewProgress(count: number, size: number) {
  const joined = Math.max(0, Math.floor(count));
  return {
    joined,
    shown: Math.min(joined, size),
    ratio: Math.min(1, joined / size),
    complete: joined >= size,
  };
}
