import { NextResponse } from "next/server";
import { featureFlags } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const incoming = request.headers.get("x-webhook-secret");
  return incoming === secret;
}

export async function POST(request: Request) {
  if (!featureFlags.resendWebhookEnabled) {
    return NextResponse.json(
      {
        error:
          "Resend webhook endpoint is disabled. Set ENABLE_RESEND_WEBHOOK=true to enable.",
      },
      { status: 403 },
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.RESEND_WEBHOOK_SECRET
  ) {
    return NextResponse.json(
      {
        error:
          "Webhook misconfigured: RESEND_WEBHOOK_SECRET is required in production.",
      },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized webhook request" },
      { status: 401 },
    );
  }

  try {
    const event = await request.json();
    const eventType = String(event?.type || "unknown");
    const providerMessageId = String(
      event?.data?.email_id ||
        event?.data?.emailId ||
        event?.email_id ||
        event?.emailId ||
        "",
    );
    const recipient = event?.data?.to || event?.data?.recipient || null;

    await prisma.reminderDeliveryEvent.create({
      data: {
        provider: "resend",
        providerMessageId: providerMessageId || "unknown",
        eventType,
        recipient: recipient ? String(recipient) : null,
        payload: event,
      },
    });

    if (providerMessageId) {
      if (
        ["email.bounced", "email.complained", "email.failed"].includes(
          eventType,
        )
      ) {
        await prisma.appointmentReminder.updateMany({
          where: { providerMessageId },
          data: {
            status: "FAILED",
            errorMessage: `Provider event: ${eventType}`,
          },
        });
      }

      if (["email.delivered", "email.sent"].includes(eventType)) {
        await prisma.appointmentReminder.updateMany({
          where: { providerMessageId },
          data: {
            status: "SENT",
            errorMessage: null,
          },
        });
      }
    }

    console.log("Resend webhook event stored:", eventType);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Resend webhook parse error:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 },
    );
  }
}
