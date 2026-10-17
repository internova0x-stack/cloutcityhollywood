"use server";

import { cookies } from "next/headers";
import { GAME_CONFIG } from "@/lib/config";
import { normalizeInviteCode } from "@/lib/invite";
import { getServerSupabase } from "@/lib/supabase/server";
import { cleanName, nameError } from "@/lib/validation";

export type ClaimResult = { ok: true } | { ok: false; error: string; field?: "name" | "age" };

/** Claims the username: creates the player and credits the friend whose invite brought them. */
export async function claimName(input: { name: string; ageConfirmed?: boolean }): Promise<ClaimResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Accounts aren't switched on yet." };

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { ok: false, error: "Your sign-in expired. Sign in again from the front page." };

  const problem = nameError(input.name);
  if (problem) return { ok: false, error: problem, field: "name" };

  const meta = user.user_metadata ?? {};
  const cookieStore = await cookies();
  const ageConfirmed =
    meta.age_confirmed === true || input.ageConfirmed === true || cookieStore.get(GAME_CONFIG.ageCookieName)?.value === "1";
  if (!ageConfirmed) return { ok: false, error: "Clout City is 18+. Confirm your age to continue.", field: "age" };

  const invite =
    normalizeInviteCode(typeof meta.invite_code === "string" ? meta.invite_code : null) ??
    normalizeInviteCode(cookieStore.get(GAME_CONFIG.invite.cookieName)?.value);

  const { error } = await supabase.rpc("create_player", {
    p_display_name: cleanName(input.name),
    p_invite_code: invite,
    p_age_confirmed: true,
  });

  if (error) {
    if (error.message.includes("name_format")) {
      return { ok: false, error: "Letters, numbers, _ and . only, 3 to 20 of them.", field: "name" };
    }
    if (error.message.includes("name_taken") || error.code === "23505") {
      return { ok: false, error: "That name's taken. Somebody's already printing it on T-shirts.", field: "name" };
    }
    console.error("create_player failed", error);
    return { ok: false, error: "The amp blew a fuse. Try again in a second." };
  }

  cookieStore.delete(GAME_CONFIG.invite.cookieName);
  cookieStore.delete(GAME_CONFIG.ageCookieName);
  return { ok: true };
}

/** Live check while typing. True when nobody has the name yet. */
export async function checkName(name: string): Promise<boolean | null> {
  if (nameError(name)) return null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("is_name_available", { p_display_name: cleanName(name) });
  return error ? null : Boolean(data);
}
