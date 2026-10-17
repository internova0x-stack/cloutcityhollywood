import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerSupabase } from "./supabase/server";

export type OnboardingStep = "name_done" | "look_done" | "sound_done" | "lottery_done" | "home_done";

export interface Player {
  id: string;
  display_name: string;
  look: Record<string, unknown>;
  scene: string | null;
  instrument: string | null;
  band_name: string | null;
  invite_code: string;
  onboarding_step: OnboardingStep;
  fame: number;
  music_muted: boolean;
  created_at: string;
}

export interface CrewMember {
  display_name: string;
  scene: string | null;
  joined_at: string;
}

export interface Session {
  user: User | null;
  player: Player | null;
}

const PLAYER_COLUMNS =
  "id, display_name, look, scene, instrument, band_name, invite_code, onboarding_step, fame, music_muted, created_at";

/** The signed-in user and their player row, if any. Never throws. */
export async function getSession(): Promise<Session> {
  const supabase = await getServerSupabase();
  if (!supabase) return { user: null, player: null };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { user: null, player: null };
  const { data: player } = await supabase.from("players").select(PLAYER_COLUMNS).eq("id", user.id).maybeSingle<Player>();
  return { user, player: player ?? null };
}

export async function getCrew(): Promise<CrewMember[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("my_crew");
  if (error || !data) return [];
  return data as CrewMember[];
}

/** For pages that need a player: sends everyone else where they belong. */
export async function requirePlayer(): Promise<{ user: User; player: Player }> {
  const { user, player } = await getSession();
  if (!user) redirect("/");
  if (!player) redirect("/create");
  return { user, player };
}
