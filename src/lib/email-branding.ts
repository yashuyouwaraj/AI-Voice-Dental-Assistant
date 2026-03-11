function normalizeAppUrl(url?: string) {
  return url?.trim().replace(/\/$/, "");
}

function normalizeLogoUrl(url?: string) {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  // imgbb page links (https://ibb.co/<id>) are not direct image URLs.
  // Convert to a likely direct-host pattern to avoid broken email images.
  if (raw.includes("://ibb.co/")) {
    const id = raw.split("/").filter(Boolean).pop();
    if (id) return `https://i.ibb.co/${id}/logo.png`;
  }

  return raw;
}

export function getEmailLogoUrl() {
  const customLogoUrl = normalizeLogoUrl(process.env.EMAIL_LOGO_URL);
  if (customLogoUrl) return customLogoUrl;

  const appUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (!appUrl) return null;
  return `${appUrl}/logo.png`;
}

export function getAppointmentsUrl() {
  const appUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (!appUrl) return null;
  return `${appUrl}/appointments`;
}
