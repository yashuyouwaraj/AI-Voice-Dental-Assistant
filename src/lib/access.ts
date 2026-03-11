type AppUser = {
  emailAddresses?: Array<{
    emailAddress?: string | null;
  }>;
} | null;

export type AppRole = "ADMIN" | "PATIENT";

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase();
}

export function getPrimaryEmail(user: AppUser) {
  return user?.emailAddresses?.[0]?.emailAddress;
}

export function isAdminUser(user: AppUser) {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const userEmail = normalizeEmail(getPrimaryEmail(user));
  return Boolean(adminEmail && userEmail && adminEmail === userEmail);
}

export function getAppRole(user: AppUser): AppRole {
  return isAdminUser(user) ? "ADMIN" : "PATIENT";
}
