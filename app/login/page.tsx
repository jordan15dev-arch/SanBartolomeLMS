"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";
import { RoleToggle } from "@/components/auth/role-toggle";
import { dashboardForRole, type UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "auth_not_configured") {
      setError("Supabase is not configured yet. Add your project URL and anon key to .env.local, then restart the dev server.");
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });
      const result = (await response.json()) as { error?: string; role?: UserRole };
      if (!response.ok || !result.role) {
        setError(result.error ?? "Unable to sign in. Please check your credentials.");
        return;
      }
      window.location.assign(dashboardForRole(result.role));
    } catch {
      setError("We couldn't reach the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("role", role);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (oauthError) throw oauthError;
    } catch {
      setError("Google sign-in couldn't be started. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <p className="text-[11px] font-bold tracking-[0.19em] text-[#B18432]">WELCOME BACK</p>
      <h2 className="mt-2 text-[27px] font-bold tracking-[-0.03em] text-navy sm:text-[30px]">Sign in to your account</h2>
      <p className="mt-2 text-sm text-[#738191]">Choose your role and enter your credentials.</p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-[#273B50]">I am a</span>
          <RoleToggle value={role} onChange={setRole} />
        </div>

        <label className="block text-sm font-semibold text-[#273B50]" htmlFor="identifier">
          {role === "student" ? "Learner Reference Number (LRN) or Email" : "Faculty ID / Registered Email"}
          <input
            id="identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={role === "student" ? "Enter your LRN or email" : "Enter your faculty ID or email"}
            className="mt-2 h-12 w-full rounded-xl border border-[#D8E0E7] bg-white px-4 text-sm font-normal text-navy outline-none transition placeholder:text-[#9AA6B2] focus:border-[#10437A] focus:ring-4 focus:ring-[#10437A]/10"
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[#273B50]" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-blue hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-[#D8E0E7] bg-white px-4 pr-12 text-sm text-navy outline-none transition placeholder:text-[#9AA6B2] focus:border-[#10437A] focus:ring-4 focus:ring-[#10437A]/10"
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7D8A97] hover:text-navy">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue text-sm font-bold text-white transition hover:bg-[#0B3766] disabled:cursor-not-allowed disabled:opacity-70">
          {loading && <LoaderCircle size={17} className="animate-spin" />}
          Sign In <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="my-5 flex items-center gap-4 text-xs text-[#98A3AE]">
        <span className="h-px flex-1 bg-[#E3E8ED]" /><span>or</span><span className="h-px flex-1 bg-[#E3E8ED]" />
      </div>
      <button type="button" onClick={onGoogleSignIn} disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#D8E0E7] bg-white text-sm font-semibold text-[#273B50] transition hover:bg-[#F8FAFC] disabled:opacity-70">
        <GoogleIcon /> Continue with Google
      </button>
      <p className="mt-5 text-center text-sm text-[#738191]">
        Don&apos;t have an account? <Link href="/register" className="font-bold text-blue hover:underline">Create an account</Link>
      </p>
      <p className="mt-8 text-center text-xs text-[#738191]">
        Having trouble? <a href="mailto:registrar@sanbartolomehs.edu.ph" className="font-semibold text-blue hover:underline">Contact the school registrar</a>
      </p>
      <p className="mt-5 text-center text-[11px] leading-5 text-[#9AA6B2]">
        By signing in, you agree to the school&apos;s acceptable use policy.
      </p>
    </AuthShell>
  );
}
