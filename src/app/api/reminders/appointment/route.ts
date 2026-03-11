import { NextResponse } from "next/server";
import { featureFlags } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import {
  backfillMissingRemindersForConfirmedAppointments,
  dispatchDueReminders,
  scheduleAppointmentReminders,
} from "@/lib/reminders";

type ReminderPayload = {
  action?: "SCHEDULE" | "DISPATCH_DUE";
  appointmentId: string;
  includeConfirmation?: boolean;
  limit?: number;
  backfill?: boolean;
};

function isAuthorized(request: Request) {
  const secret = process.env.REMINDER_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-reminder-secret") === secret;
}

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

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.REMINDER_API_SECRET
  ) {
    return NextResponse.json(
      {
        error:
          "Reminder API misconfigured: REMINDER_API_SECRET is required in production.",
      },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized reminder request" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as Partial<ReminderPayload>;

    if (body.action === "DISPATCH_DUE") {
      const limit = Number(body.limit || 20);
      const shouldBackfill = body.backfill !== false;
      let backfill = { scanned: 0 };
      if (shouldBackfill) {
        backfill = await backfillMissingRemindersForConfirmedAppointments(200);
      }
      const result = await dispatchDueReminders(limit);
      return NextResponse.json(
        { message: "Dispatch completed", backfill, ...result },
        { status: 200 },
      );
    }

    if (!body.appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: body.appointmentId },
      select: { id: true, date: true, time: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    await scheduleAppointmentReminders({
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      includeConfirmation: Boolean(body.includeConfirmation),
    });

    return NextResponse.json(
      {
        message: "Reminders scheduled",
        appointmentId: appointment.id,
        includeConfirmation: Boolean(body.includeConfirmation),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Reminder API error:", error);
    return NextResponse.json(
      { error: "Failed to process reminder event" },
      { status: 500 },
    );
  }
}
