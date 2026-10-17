import { NextResponse, type NextRequest } from "next/server";
import { AFTER_SIGNIN } from "@/lib/authNext";
import { getServerSupabase } from "@/lib/supabase/server";

// PKCE callback: Google sign-in, and Supabase's default email template (same browser only).
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");
  const supabase = await getServerSupabase();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(AFTER_SIGNIN, request.url));
  }
  return NextResponse.redirect(new URL("/?auth_error=link", request.url));
}
