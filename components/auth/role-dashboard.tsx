"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/roles";

export function RoleDashboard({ role }: { role: UserRole }) {
  const [error, setError] = useState("");

  async function signOut() {
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) {
      setError("Unable to sign out. Please try again.");
      return;
    }
    window.location.assign("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF2F6] px-4 py-8">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl sm:p-12">
        <p className="text-xs font-bold tracking-[0.18em] text-[#B18432]">SAN BARTOLOME HIGH SCHOOL · LMS</p>
        <h1 className="mt-4 text-3xl font-bold text-navy">Welcome to your {role} dashboard.</h1>
        <p className="mt-3 text-sm leading-6 text-[#738191]">Your account is signed in. Your learning workspace will appear here.</p>
        {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
        <button type="button" onClick={signOut} className="mt-8 rounded-xl bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3766]">Sign out</button>
      </section>
    </main>
  );
}
