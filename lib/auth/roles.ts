export const roles = ["student", "teacher"] as const;

export type UserRole = (typeof roles)[number];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "student" || value === "teacher";
}

export function dashboardForRole(role: UserRole) {
  return role === "student" ? "/student/dashboard" : "/teacher/dashboard";
}
