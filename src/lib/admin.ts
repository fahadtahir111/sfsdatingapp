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

export async function getAdminRole(): Promise<AdminRole | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  const email = user.email.toLowerCase();
  const superadmins = parseRoleEmails("ADMIN_SUPERADMINS");
  const moderators = parseRoleEmails("ADMIN_MODERATORS");
  const supports = parseRoleEmails("ADMIN_SUPPORT");
  const admins = parseAdminEmails();

  if (superadmins.includes(email)) return "superadmin";
  if (moderators.includes(email)) return "moderator";
  if (supports.includes(email)) return "support";
  if (admins.includes(email)) return "superadmin";
  return null;
}

export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  const role = await getAdminRole();
  if (!role) return null;
  return { ...user, adminRole: role };
}

