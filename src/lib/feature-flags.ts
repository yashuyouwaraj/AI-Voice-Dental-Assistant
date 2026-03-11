function isEnabled(value?: string) {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function isDisabled(value?: string) {
  if (!value) return false;
  return ["0", "false", "no", "off"].includes(value.toLowerCase());
}

export const featureFlags = {
  triageEnabled: !isDisabled(process.env.NEXT_PUBLIC_ENABLE_TRIAGE),
  reminderApisEnabled: isEnabled(process.env.ENABLE_REMINDER_APIS),
  resendWebhookEnabled: isEnabled(process.env.ENABLE_RESEND_WEBHOOK),
};
