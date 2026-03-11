import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/access";
import { featureFlags } from "@/lib/feature-flags";
import {
  backfillMissingRemindersForConfirmedAppointments,
  dispatchDueReminders,
} from "@/lib/reminders";

export async function POST(request: Request) {
  if (!featureFlags.reminderApisEnabled) {
    return NextResponse.json(
      {
        error:
          "Reminder API is disabled. Set ENABLE_REMINDER_APIS=true to enable.",
      },
      { status: 403 },
    );
  }

  const user = await currentUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json(
      { error: "Unauthorized admin request" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      limit?: number;
      backfill?: boolean;
    };
    const limit = Number(body.limit || 20);
    const shouldBackfill = body.backfill !== false;

    let backfill = { scanned: 0 };
    if (shouldBackfill) {
      backfill = await backfillMissingRemindersForConfirmedAppointments(200);
    }

    const result = await dispatchDueReminders(limit);

    return NextResponse.json(
      { message: "Manual dispatch completed", backfill, ...result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin reminder dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch reminders" },
      { status: 500 },
    );
  }
}
