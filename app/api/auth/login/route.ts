import { NextResponse } from "next/server";
import { z } from "zod";
import { isUserRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(256),
  role: z.enum(["student", "teacher"]),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid ID or email and password." }, { status: 400 });
  }

  const { identifier, password, role } = parsed.data;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase is not configured. Add its URL and anon key to .env.local." }, { status: 503 });
  }
  if (!identifier.includes("@") && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "LRN/Faculty ID sign-in requires the server-only Supabase service role key." }, { status: 503 });
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    const admin = createAdminClient();
    const { data: profile, error: lookupError } = await admin
      .from("profiles")
      .select("email")
      .eq("lrn_or_employee_id", identifier)
      .eq("role", role)
      .maybeSingle();

    if (lookupError) {
      console.error("Could not look up the sign-in identifier.", lookupError);
      return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
    }
    if (!profile?.email) {
      return NextResponse.json({ error: "Invalid ID/email or password for the selected role." }, { status: 401 });
    }
    email = profile.email;
  }

  const supabase = await createClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !data.user) {
    return NextResponse.json({ error: "Invalid ID/email or password for the selected role." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile || !isUserRole(profile.role)) {
    await supabase.auth.signOut();
    console.error("Could not verify the signed-in user's profile.", profileError);
    return NextResponse.json({ error: "Your account profile could not be verified. Contact the school registrar." }, { status: 403 });
  }
  if (profile.role !== role) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "The selected role does not match your account." }, { status: 403 });
  }

  return NextResponse.json({ role: profile.role });
}
