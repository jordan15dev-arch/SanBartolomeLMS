import { NextResponse, type NextRequest } from "next/server";
import { dashboardForRole, isUserRole } from "@/lib/auth/roles";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const publicPath = ["/login", "/register", "/forgot-password"].includes(path);

  if (!url || !key) {
    if (publicPath || path === "/" || path.startsWith("/auth/") || path.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    if (path.startsWith("/student/") || path.startsWith("/teacher/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "?error=auth_not_configured";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (publicPath || path.startsWith("/auth/") || path.startsWith("/api/auth/")) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return redirectWithCookies(loginUrl, response);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !isUserRole(profile.role)) {
    console.error("Unable to resolve the authenticated user's role.", error);
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=profile_setup_failed";
    return redirectWithCookies(loginUrl, response);
  }

  const dashboard = dashboardForRole(profile.role);
  if (publicPath || path === "/") {
    const destination = request.nextUrl.clone();
    destination.pathname = dashboard;
    destination.search = "";
    return redirectWithCookies(destination, response);
  }
  if (path.startsWith("/student/") && profile.role !== "student") {
    const destination = request.nextUrl.clone();
    destination.pathname = dashboard;
    destination.search = "";
    return redirectWithCookies(destination, response);
  }
  if (path.startsWith("/teacher/") && profile.role !== "teacher") {
    const destination = request.nextUrl.clone();
    destination.pathname = dashboard;
    destination.search = "";
    return redirectWithCookies(destination, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
