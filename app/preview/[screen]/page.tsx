import { notFound } from "next/navigation";
import { ClaimName } from "@/components/ClaimName";
import { GuestMap } from "@/components/GuestMap";
import { GameShell } from "@/components/GameShell";
import { PracticePreview } from "@/components/show/PracticePreview";
import type { CrewMember, Player } from "@/lib/player";
import { previewCheckName, previewClaim } from "../previewActions";

// Development-only previews with sample data, so screens can be checked without a Supabase
// project. Nothing is saved. Never served in production.
//   /preview/guest              the guest map (?time=day|night, ?invited=1)
//   /preview/create             claim your name (?age=1 adds the Google 18+ box)
//   /preview/home               the home screen (?crew=0-6)
//   /preview/practice           a practice run (?where=home|grind, ?speed=75, ?loop=verse|chorus, ?auto=1 plays itself)

const SAMPLE: Player = {
  id: "00000000-0000-0000-0000-000000000000",
  display_name: "riffqueen",
  look: {},
  scene: null,
  instrument: null,
  band_name: null,
  invite_code: "K7M4QX",
  onboarding_step: "name_done",
  fame: 0,
  music_muted: true,
  created_at: new Date(0).toISOString(),
};

const FRIENDS: CrewMember[] = [
  { display_name: "keyskid", scene: "synthwave_kid", joined_at: "2026-10-16T18:00:00Z" },
  { display_name: "lofi.lou", scene: "bedroom_pop", joined_at: "2026-10-16T19:10:00Z" },
  { display_name: "dez_drums", scene: "garage_rocker", joined_at: "2026-10-17T09:30:00Z" },
  { display_name: "porchlight", scene: "country_crossover", joined_at: "2026-10-17T10:00:00Z" },
  { display_name: "safety.pin", scene: "mall_punk", joined_at: "2026-10-17T11:00:00Z" },
  { display_name: "lagos2la", scene: "afrobeats_dreamer", joined_at: "2026-10-17T12:00:00Z" },
];

export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { screen } = await params;
  const q = await searchParams;
  if (screen === "guest") return <GuestMap invited={q.invited === "1"} forceTime={q.time === "day" || q.time === "night" ? q.time : undefined} />;
  if (screen === "create") return <ClaimName claim={previewClaim} check={previewCheckName} askAge={q.age === "1"} />;
  if (screen === "home") {
    const n = Math.max(0, Math.min(FRIENDS.length, Number(q.crew ?? 2) || 0));
    return <GameShell player={SAMPLE} crew={FRIENDS.slice(0, n)} preview />;
  }
  if (screen === "practice") {
    const options = {
      where: q.where === "grind" ? ("grind" as const) : ("home" as const),
      speed: q.speed === "75" ? 0.75 : 1,
      loop: q.loop === "verse" || q.loop === "chorus" ? q.loop : null,
    };
    return <PracticePreview options={options} auto={q.auto === "1"} />;
  }
  notFound();
}
