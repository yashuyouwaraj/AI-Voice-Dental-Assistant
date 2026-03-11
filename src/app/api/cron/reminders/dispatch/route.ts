import { NextResponse } from "next/server";
import { featureFlags } from "@/lib/feature-flags";
import { dispatchDueReminders } from "@/lib/reminders";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return process.env.NODE_ENV !== "production"
      ? request.headers.get("x-vercel-cron") === "1"
      : false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!featureFlags.reminderApisEnabled) {
    return NextResponse.json(
      {
        error:
          "Reminder API is disabled. Set ENABLE_REMINDER_APIS=true to enable.",
      },
      { status: 403 },
    );
  }

  if (process.env.NODE_ENV === "production" && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Cron misconfigured: CRON_SECRET is required in production." },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized cron request" },
      { status: 401 },
    );
  }

  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 20);
    const result = await dispatchDueReminders(limit);

    return NextResponse.json(
      { message: "Cron dispatch completed", ...result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cron reminder dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch reminders from cron" },
      { status: 500 },
    );
  }
}
