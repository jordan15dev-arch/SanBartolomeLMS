"use client";

import type { UserRole } from "@/lib/auth/roles";

export function RoleToggle({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-[#F0F3F6] p-1" role="group" aria-label="Choose your role">
      {(["student", "teacher"] as const).map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          aria-pressed={value === role}
          className={`rounded-[9px] px-4 py-2.5 text-sm font-semibold capitalize transition ${
            value === role
              ? "bg-white text-navy shadow-sm"
              : "text-[#748292] hover:text-navy"
          }`}
        >
          {role === "student" ? "Student" : "Teacher"}
        </button>
      ))}
    </div>
  );
}
