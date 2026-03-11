import type { AppointmentStatus } from "@prisma/client";
import { getAppointmentsUrl, getEmailLogoUrl } from "@/lib/email-branding";
import { createNotification } from "@/lib/engagement";
import { prisma } from "@/lib/prisma";
import resend from "@/lib/resend";

type ReminderType =
  | "BOOKING_CONFIRMATION"
  | "PRE_VISIT_24H"
  | "PRE_VISIT_2H"
  | "FOLLOW_UP_24H";
type ReminderChannel = "EMAIL" | "SMS";

function parseAppointmentDateTime(date: Date, time: string) {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

function reminderOffsetMs(type: ReminderType) {
  switch (type) {
    case "BOOKING_CONFIRMATION":
      return 0;
    case "PRE_VISIT_24H":
      return -24 * 60 * 60 * 1000;
    case "PRE_VISIT_2H":
      return -2 * 60 * 60 * 1000;
    case "FOLLOW_UP_24H":
      return 24 * 60 * 60 * 1000;
  }
}

export async function scheduleAppointmentReminders(input: {
  appointmentId: string;
  appointmentDate: Date;
  appointmentTime: string;
  includeConfirmation?: boolean;
}) {
  const appointmentDateTime = parseAppointmentDateTime(
    input.appointmentDate,
    input.appointmentTime,
  );

  const reminderTypes: ReminderType[] = input.includeConfirmation
    ? ["BOOKING_CONFIRMATION", "PRE_VISIT_24H", "PRE_VISIT_2H", "FOLLOW_UP_24H"]
    : ["PRE_VISIT_24H", "PRE_VISIT_2H", "FOLLOW_UP_24H"];

  const entries = reminderTypes.map((type) => {
    const scheduledFor =
      type === "BOOKING_CONFIRMATION"
        ? new Date()
        : new Date(appointmentDateTime.getTime() + reminderOffsetMs(type));

    return {
      appointmentId: input.appointmentId,
      channel: "EMAIL" as ReminderChannel,
      reminderType: type,
      scheduledFor,
    };
  });

  for (const entry of entries) {
    await prisma.appointmentReminder.upsert({
      where: {
        appointmentId_reminderType_channel: {
          appointmentId: entry.appointmentId,
          reminderType: entry.reminderType,
          channel: entry.channel,
        },
      },
      update: {
        scheduledFor: entry.scheduledFor,
        status: "PENDING",
        errorMessage: null,
      },
      create: entry,
    });
  }
}

export async function backfillMissingRemindersForConfirmedAppointments(
  limit = 200,
) {
  const appointments = await prisma.appointment.findMany({
    where: { status: "CONFIRMED" },
    select: { id: true, date: true, time: true },
    orderBy: { date: "asc" },
    take: limit,
  });

  for (const appointment of appointments) {
    // For historical appointments, skip booking confirmation to avoid retroactive spam.
    await scheduleAppointmentReminders({
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      includeConfirmation: false,
    });
  }

  return { scanned: appointments.length };
}

function formatReminderSubject(type: ReminderType) {
  switch (type) {
    case "BOOKING_CONFIRMATION":
      return "Appointment booked successfully - DentWise";
    case "PRE_VISIT_24H":
      return "Reminder: Your dental appointment is tomorrow";
    case "PRE_VISIT_2H":
      return "Reminder: Your dental appointment is in 2 hours";
    case "FOLLOW_UP_24H":
      return "How are you feeling after your dental visit?";
  }
}

function formatReminderHtml(input: {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  reminderType: ReminderType;
  appUrl?: string;
}) {
  const dateLabel = input.appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const cta =
    getAppointmentsUrl() ||
    (input.appUrl ? `${input.appUrl.replace(/\/$/, "")}/appointments` : "");
  const logoSrc = getEmailLogoUrl();

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111827">
      ${
        logoSrc
          ? `<div style="margin-bottom:12px"><img src="${logoSrc}" alt="DentWise" width="44" height="44" style="border-radius:8px;vertical-align:middle;" /><span style="margin-left:8px;font-weight:700;font-size:20px;color:#2563eb;vertical-align:middle;">DentWise</span></div>`
          : ""
      }
      <h2 style="margin-bottom:8px">DentWise Reminder</h2>
      <p>Hi ${input.patientName || "there"},</p>
      <p>This is a ${input.reminderType.toLowerCase().replaceAll("_", " ")} for your appointment.</p>
      <ul>
        <li><strong>Doctor:</strong> ${input.doctorName}</li>
        <li><strong>Date:</strong> ${dateLabel}</li>
        <li><strong>Time:</strong> ${input.appointmentTime}</li>
      </ul>
      ${
        cta
          ? `<p><a href="${cta}" style="color:#2563eb;text-decoration:none">View appointments in DentWise</a></p>`
          : ""
      }
      <p>Thank you,<br/>DentWise Team</p>
    </div>
  `;
}

export async function syncRemindersForAppointmentStatus(input: {
  appointmentId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
}) {
  if (input.status === "COMPLETED") {
    // Keep follow-up reminders, cancel pre-visit and confirmation reminders.
    await prisma.appointmentReminder.updateMany({
      where: {
        appointmentId: input.appointmentId,
        status: "PENDING",
        reminderType: {
          in: ["BOOKING_CONFIRMATION", "PRE_VISIT_24H", "PRE_VISIT_2H"],
        },
      },
      data: {
        status: "CANCELLED",
        errorMessage: "Cancelled after appointment marked completed",
      },
    });
    return;
  }

  if (input.status === "CONFIRMED") {
    // Ensure future reminders exist and are reset after a status rollback.
    await scheduleAppointmentReminders({
      appointmentId: input.appointmentId,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      includeConfirmation: false,
    });
  }
}

export async function dispatchDueReminders(limit = 20) {
  const dueReminders = await prisma.appointmentReminder.findMany({
    where: {
      status: "PENDING",
      channel: "EMAIL",
      scheduledFor: { lte: new Date() },
    },
    include: {
      appointment: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          doctor: { select: { name: true } },
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  const results: Array<{
    id: string;
    status: "SENT" | "FAILED";
    error?: string;
  }> = [];

  for (const reminder of dueReminders) {
    try {
      const patientName =
        `${reminder.appointment.user.firstName || ""} ${reminder.appointment.user.lastName || ""}`.trim();

      const { data, error } = await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          (process.env.NODE_ENV === "production"
            ? "DentWise <no-reply@dentwise.com>"
            : "DentWise <no-reply@resend.dev>"),
        to: [reminder.appointment.user.email],
        subject: formatReminderSubject(reminder.reminderType as ReminderType),
        html: formatReminderHtml({
          patientName,
          doctorName: reminder.appointment.doctor.name,
          appointmentDate: reminder.appointment.date,
          appointmentTime: reminder.appointment.time,
          reminderType: reminder.reminderType as ReminderType,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        }),
      });

      if (error) {
        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: "FAILED",
            attempts: { increment: 1 },
            errorMessage: error.message || "Unknown provider error",
          },
        });
        results.push({
          id: reminder.id,
          status: "FAILED",
          error: error.message,
        });
        continue;
      }

      await prisma.appointmentReminder.update({
        where: { id: reminder.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          attempts: { increment: 1 },
          providerMessageId: data?.id || null,
          errorMessage: null,
        },
      });

      await createNotification({
        userId: reminder.appointment.userId,
        title: "Email Reminder Sent",
        message: `Reminder sent for your appointment at ${reminder.appointment.time}.`,
        type: "REMINDER",
      });

      results.push({ id: reminder.id, status: "SENT" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Dispatch failed";
      await prisma.appointmentReminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          errorMessage,
        },
      });

      results.push({
        id: reminder.id,
        status: "FAILED",
        error: errorMessage,
      });
    }
  }

  return {
    processed: results.length,
    sent: results.filter((r) => r.status === "SENT").length,
    failed: results.filter((r) => r.status === "FAILED").length,
    results,
  };
}
