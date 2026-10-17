import { redirect } from "next/navigation";
import { FrontCard } from "@/components/FrontCard";
import { getSession } from "@/lib/player";

// The front door: the holding card with Sign up and Log in. The guest map replaces the card in
// v0.1 step 3. Signed-in players go straight to the game.
export default async function Front({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user, player } = await getSession();
  if (user) redirect(player ? "/home" : "/create");
  const params = await searchParams;
  return <FrontCard invited={params.invited === "1"} authError={params.auth_error === "link"} />;
}
