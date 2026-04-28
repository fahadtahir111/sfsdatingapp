import { getCurrentUser } from "./auth";

const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const parseRoleEmails = (key: string) =>
  (process.env[key] || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export type AdminRole = "support" | "moderator" | "superadmin";

export function getAdminRoleFromEmail(email?: string | null): AdminRole | null {
  if (!email) return null;
  const normalized = email.toLowerCase();
  const superadmins = parseRoleEmails("ADMIN_SUPERADMINS");
  const moderators = parseRoleEmails("ADMIN_MODERATORS");
  const supports = parseRoleEmails("ADMIN_SUPPORT");
  const admins = parseAdminEmails();

  if (superadmins.includes(normalized)) return "superadmin";
  if (moderators.includes(normalized)) return "moderator";
  if (supports.includes(normalized)) return "support";
  if (admins.includes(normalized)) return "superadmin";
  return null;
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  return getAdminRoleFromEmail(user.email);
}

export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  const role = getAdminRoleFromEmail(user.email);
  if (!role) return null;
  return { ...user, adminRole: role };
}

