"use server";

import { getServerSupabase } from "@/lib/supabase/server";

/** Remembers the speaker button on the account. */
export async function setMusicMuted(muted: boolean): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { error } = await supabase.rpc("set_music_muted", { p_muted: muted });
  return !error;
}
