import { redirect } from "next/navigation";
import { GuestMap } from "@/components/GuestMap";
import { getSession } from "@/lib/player";

// The front door: the guest map of Echo Flats (any tap opens sign-up). Signed-in players go straight to the game.
export default async function Front({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user, player } = await getSession();
  if (user) redirect(player ? "/home" : "/create");
  const params = await searchParams;
  return <GuestMap invited={params.invited === "1"} authError={params.auth_error === "link"} />;
}
