"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";

const emailSchema = z.string().trim().email("Enter a valid registered email address.");
const codeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code.");
const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(72);

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      if (step === 1) {
        const parsedEmail = emailSchema.safeParse(email);
        if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0]?.message);
        const { error: sendError } = await supabase.auth.resetPasswordForEmail(parsedEmail.data);
        if (sendError) throw sendError;
        setStep(2);
        setMessage("If an account exists for that email, a 6-digit recovery code has been sent.");
      } else if (step === 2) {
        const parsedCode = codeSchema.safeParse(code);
        if (!parsedCode.success) throw new Error(parsedCode.error.issues[0]?.message);
        const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: parsedCode.data, type: "recovery" });
        if (verifyError) throw verifyError;
        setStep(3);
        setMessage("");
      } else {
        const parsedPassword = passwordSchema.safeParse(password);
        if (!parsedPassword.success) throw new Error(parsedPassword.error.issues[0]?.message);
        const { error: updateError } = await supabase.auth.updateUser({ password: parsedPassword.data });
        if (updateError) throw updateError;
        setMessage("Your password has been updated. Redirecting you to sign in…");
        window.setTimeout(() => window.location.assign("/login"), 1500);
      }
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Password recovery failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <p className="text-[11px] font-bold tracking-[0.19em] text-[#B18432]">ACCOUNT RECOVERY · STEP {step} OF 3</p>
      <h2 className="mt-2 text-[29px] font-bold tracking-[-0.03em] text-navy">Reset your password</h2>
      <p className="mt-2 text-sm leading-6 text-[#738191]">
        {step === 1 && "Enter the email address registered to your school account."}
        {step === 2 && `Enter the 6-digit recovery code sent to ${email}.`}
        {step === 3 && "Choose a new password for your account."}
      </p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit}>
        {step === 1 && <label className="block text-sm font-semibold text-[#273B50]" htmlFor="recovery-email">Registered Email<input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-[#D8E0E7] px-4 text-sm font-normal outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" /></label>}
        {step === 2 && <label className="block text-sm font-semibold text-[#273B50]" htmlFor="recovery-code">Verification Code<input id="recovery-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="mt-2 h-12 w-full rounded-xl border border-[#D8E0E7] px-4 text-center text-lg tracking-[0.3em] outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" /></label>}
        {step === 3 && <label className="block text-sm font-semibold text-[#273B50]" htmlFor="recovery-password">New Password<input id="recovery-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 h-12 w-full rounded-xl border border-[#D8E0E7] px-4 text-sm font-normal outline-none focus:border-blue focus:ring-4 focus:ring-blue/10" /></label>}
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>}
        <button disabled={loading} className="h-12 w-full rounded-xl bg-blue text-sm font-bold text-white hover:bg-[#0B3766] disabled:opacity-70">
          {loading ? "Please wait…" : step === 1 ? "Send verification code" : step === 2 ? "Verify code" : "Update password"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/login" className="font-semibold text-blue hover:underline">Back to sign in</Link>
        {step === 2 && <button type="button" onClick={() => { setStep(1); setCode(""); setError(""); setMessage(""); }} className="text-[#738191] hover:text-navy">Use another email</button>}
      </div>
    </AuthShell>
  );
}
