import { GameShell } from "@/components/GameShell";
import { getCrew, requirePlayer } from "@/lib/player";
import { setMusicMuted } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { player } = await requirePlayer();
  const crew = await getCrew();
  return <GameShell player={player} crew={crew} onToggleMute={setMusicMuted} />;
}
