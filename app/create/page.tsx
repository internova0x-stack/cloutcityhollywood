import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClaimName } from "@/components/ClaimName";
import { GAME_CONFIG } from "@/lib/config";
import { getSession } from "@/lib/player";
import { checkName, claimName } from "./actions";

// After sign-in: claim a name, then home. Finished players skip straight to the game.
export default async function Create() {
  const { user, player } = await getSession();
  if (!user) redirect("/");
  if (player) redirect("/home");
  const cookieStore = await cookies();
  // Email sign-ups confirmed 18+ before the email went out; Google sign-ins confirm it here unless the cookie says so.
  const askAge = user.user_metadata?.age_confirmed !== true && cookieStore.get(GAME_CONFIG.ageCookieName)?.value !== "1";
  return <ClaimName claim={claimName} check={checkName} askAge={askAge} />;
}
