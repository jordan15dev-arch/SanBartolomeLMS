import { NextResponse } from "next/server";
import { dashboardForRole, isUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedRole = requestUrl.searchParams.get("role");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", origin));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("OAuth code exchange failed.", exchangeError);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", origin));
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Could not load the OAuth user.", userError);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", origin));
  }

  if (user.app_metadata.provider !== "google") {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Could not clear the email confirmation session.", signOutError);
      return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
    }
    return NextResponse.redirect(new URL("/login?registered=1", origin));
  }

  if (user.app_metadata.provider === "google" && isUserRole(requestedRole)) {
    const { error: roleError } = await supabase.rpc("complete_google_profile", { requested_role: requestedRole });
    if (roleError) {
      console.error("Could not apply the selected role to the new Google account.", roleError);
      return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isUserRole(profile.role)) {
    console.error("OAuth account has no valid profile.", profileError);
    return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
  }

  return NextResponse.redirect(new URL(dashboardForRole(profile.role), origin));
}
