"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";
import { RoleToggle } from "@/components/auth/role-toggle";
import type { UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  identifier: z.string().trim().min(1, "Enter your school ID.").max(64),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
});

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const parsed = registrationSchema.safeParse({ fullName, identifier, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            lrn_or_employee_id: parsed.data.identifier,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;
      setMessage("Your account is ready. Check your email if verification is required, then sign in.");
      window.setTimeout(() => window.location.assign("/login"), 1800);
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <p className="text-[11px] font-bold tracking-[0.19em] text-[#B18432]">JOIN OUR COMMUNITY</p>
      <h2 className="mt-2 text-[29px] font-bold tracking-[-0.03em] text-navy">Create your account</h2>
      <p className="mt-2 text-sm text-[#738191]">Enter your school details to get started.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-[#273B50]">I am a</span>
          <RoleToggle value={role} onChange={(nextRole) => { setRole(nextRole); setIdentifier(""); }} />
        </div>
        <label className="block text-sm font-semibold text-[#273B50]" htmlFor="full-name">
          Full Name
          <input id="full-name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" className="mt-2 h-11 w-full rounded-xl border border-[#D8E0E7] px-4 text-sm font-normal outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" />
        </label>
        <label className="block text-sm font-semibold text-[#273B50]" htmlFor="school-id">
          {role === "student" ? "Learner Reference Number (LRN)" : "Faculty ID"}
          <input id="school-id" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={role === "student" ? "Enter your LRN" : "Enter your faculty ID"} className="mt-2 h-11 w-full rounded-xl border border-[#D8E0E7] px-4 text-sm font-normal outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" />
        </label>
        <label className="block text-sm font-semibold text-[#273B50]" htmlFor="email">
          Email
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-xl border border-[#D8E0E7] px-4 text-sm font-normal outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" />
        </label>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#273B50]" htmlFor="new-password">Password</label>
          <div className="relative">
            <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="h-11 w-full rounded-xl border border-[#D8E0E7] px-4 pr-12 text-sm outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7D8A97]"><Eye size={18} className={showPassword ? "hidden" : ""} /><EyeOff size={18} className={showPassword ? "" : "hidden"} /></button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>}
        <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue text-sm font-bold text-white hover:bg-[#0B3766] disabled:opacity-70">
          {loading && <LoaderCircle size={17} className="animate-spin" />} Create Account
        </button>
      </form>
      <div className="my-4 flex items-center gap-4 text-xs text-[#98A3AE]">
        <span className="h-px flex-1 bg-[#E3E8ED]" /><span>or</span><span className="h-px flex-1 bg-[#E3E8ED]" />
      </div>
      <button type="button" disabled={loading} onClick={async () => {
        setError("");
        setLoading(true);
        try {
          const supabase = createClient();
          const callback = new URL("/auth/callback", window.location.origin);
          callback.searchParams.set("role", role);
          const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback.toString() } });
          if (oauthError) throw oauthError;
        } catch (oauthError) {
          setError(oauthError instanceof Error ? oauthError.message : "Google sign-in couldn't be started.");
          setLoading(false);
        }
      }} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#D8E0E7] text-sm font-semibold text-[#273B50] hover:bg-[#F8FAFC] disabled:opacity-70">
        <GoogleIcon /> Continue with Google
      </button>
      <p className="mt-5 text-center text-sm text-[#738191]">Already have an account? <Link href="/login" className="font-bold text-blue hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
