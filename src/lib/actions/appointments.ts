"use server";

import type { AppointmentStatus } from "@prisma/client";
import {
  createAppointmentActionLinks,
  createNotification,
  ensureCarePlanForCompletedAppointment,
} from "../engagement";
import { featureFlags } from "../feature-flags";
import { prisma } from "../prisma";
import {
  scheduleAppointmentReminders,
  syncRemindersForAppointmentStatus,
} from "../reminders";
import { getCurrentDbUserOrThrow } from "./users";

type AppointmentForTransform = {
  id: string;
  date: Date;
  time: string;
  reason: string | null;
  status: AppointmentStatus;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  doctor: {
    name: string;
    imageUrl: string | null;
  };
};

function transformAppointment(appointment: AppointmentForTransform) {
  return {
    ...appointment,
    patientName:
      `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

function parseDateParts(date: string) {
  const dateOnly = date.includes("T") ? date.slice(0, 10) : date;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) throw new Error("Invalid date format");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return { year, month, day };
}

function getUtcDayBounds(date: string) {
  const { year, month, day } = parseDateParts(date);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
  return { start, end };
}

function getUtcDayOfWeek(date: string) {
  const { year, month, day } = parseDateParts(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay();
}

export async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.log("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getUserAppointments() {
  try {
    const user = await getCurrentDbUserOrThrow();

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

export async function getUserAppointmentStats() {
  try {
    const user = await getCurrentDbUserOrThrow();

    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({ where: { userId: user.id } }),
      prisma.appointment.count({
        where: { userId: user.id, status: "COMPLETED" },
      }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const { start, end } = getUtcDayBounds(date);
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: start,
          lt: end,
        },
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: { time: true },
    });

    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return [];
  }
}

function defaultTimeSlots() {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
}

function buildSlots(startTime: string, endTime: string, stepMinutes: number) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  const slots: string[] = [];
  for (let t = startTotal; t + stepMinutes <= endTotal; t += stepMinutes) {
    const h = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const m = (t % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }

  return slots;
}

export async function getAvailableDoctorTimeSlots(
  doctorId: string,
  date: string,
) {
  try {
    if (!doctorId || !date) return [];
    const day = getUtcDayOfWeek(date);
    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId, dayOfWeek: day, isActive: true },
    });

    const candidateSlots = availability
      ? buildSlots(
          availability.startTime,
          availability.endTime,
          availability.slotMinutes,
        )
      : defaultTimeSlots();

    const bookedSlots = await getBookedTimeSlots(doctorId, date);
    return candidateSlots.filter((slot) => !bookedSlots.includes(slot));
  } catch (error) {
    console.error("Error fetching available doctor slots:", error);
    // fail-open so booking remains usable even if schedule parsing fails
    return defaultTimeSlots();
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

export async function bookAppointment(input: BookAppointmentInput) {
  try {
    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    const user = await getCurrentDbUserOrThrow();

    const { start } = getUtcDayBounds(input.date);

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: start,
        time: input.time,
        reason: input.reason || "General consultation",
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
    });

    await createNotification({
      userId: user.id,
      title: "Appointment Booked",
      message: `Your appointment with ${appointment.doctor.name} is confirmed for ${appointment.time}.`,
      type: "APPOINTMENT",
    });

    if (featureFlags.reminderApisEnabled) {
      try {
        await scheduleAppointmentReminders({
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          includeConfirmation: true,
        });
      } catch (reminderError) {
        console.error("Failed to schedule reminders:", reminderError);
      }
    }

    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

export async function updateAppointmentStatus(input: {
  id: string;
  status: AppointmentStatus;
}) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: input.id },
      data: { status: input.status },
      include: {
        doctor: { select: { name: true } },
      },
    });

    if (featureFlags.reminderApisEnabled) {
      try {
        await syncRemindersForAppointmentStatus({
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          status: appointment.status,
        });
      } catch (reminderError) {
        console.error(
          "Failed to sync reminders after status update:",
          reminderError,
        );
      }
    }

    if (appointment.status === "COMPLETED") {
      await ensureCarePlanForCompletedAppointment({
        appointmentId: appointment.id,
        userId: appointment.userId,
        doctorName: appointment.doctor.name,
        appointmentDate: appointment.date,
      });
    }

    return appointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
}

export async function getReminderStats() {
  if (!featureFlags.reminderApisEnabled) {
    return { pending: 0, sent: 0, failed: 0, dueNow: 0 };
  }

  try {
    const now = new Date();

    const [pending, sent, failed, dueNow] = await Promise.all([
      prisma.appointmentReminder.count({ where: { status: "PENDING" } }),
      prisma.appointmentReminder.count({ where: { status: "SENT" } }),
      prisma.appointmentReminder.count({ where: { status: "FAILED" } }),
      prisma.appointmentReminder.count({
        where: { status: "PENDING", scheduledFor: { lte: now } },
      }),
    ]);

    return { pending, sent, failed, dueNow };
  } catch (error) {
    console.error("Error fetching reminder stats:", error);
    return { pending: 0, sent: 0, failed: 0, dueNow: 0 };
  }
}

export async function getOpsAnalytics() {
  if (!featureFlags.reminderApisEnabled) {
    return {
      reminderByStatus: [],
      appointmentsByStatus: [],
      appointmentsByDay: [],
    };
  }

  const [appointments, reminders] = await Promise.all([
    prisma.appointment.findMany({
      select: { status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 600,
    }),
    prisma.appointmentReminder.findMany({
      select: { status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 600,
    }),
  ]);

  const appointmentsByStatusMap = new Map<string, number>();
  for (const appointment of appointments) {
    appointmentsByStatusMap.set(
      appointment.status,
      (appointmentsByStatusMap.get(appointment.status) || 0) + 1,
    );
  }

  const reminderByStatusMap = new Map<string, number>();
  for (const reminder of reminders) {
    reminderByStatusMap.set(
      reminder.status,
      (reminderByStatusMap.get(reminder.status) || 0) + 1,
    );
  }

  const byDay = new Map<string, number>();
  for (const appointment of appointments) {
    const key = appointment.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }

  return {
    reminderByStatus: Array.from(reminderByStatusMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    ),
    appointmentsByStatus: Array.from(appointmentsByStatusMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    ),
    appointmentsByDay: Array.from(byDay.entries())
      .slice(-14)
      .map(([date, count]) => ({ date, count })),
  };
}

export async function getPatientRiskAlerts() {
  const users = await prisma.user.findMany({
    include: {
      appointments: {
        include: {
          reminderEvents: true,
        },
      },
    },
    take: 150,
  });

  return users
    .map((user) => {
      const total = user.appointments.length;
      const completed = user.appointments.filter(
        (a) => a.status === "COMPLETED",
      ).length;
      const failedReminders = user.appointments
        .flatMap((a) => a.reminderEvents)
        .filter((r) => r.status === "FAILED").length;
      const upcomingConfirmed = user.appointments.filter(
        (a) => a.status === "CONFIRMED",
      ).length;

      let risk = "LOW";
      if (
        (total >= 3 && completed / Math.max(total, 1) < 0.5) ||
        failedReminders >= 2
      )
        risk = "MEDIUM";
      if (
        (total >= 5 && completed / Math.max(total, 1) < 0.4) ||
        failedReminders >= 4 ||
        upcomingConfirmed >= 4
      )
        risk = "HIGH";

      return {
        userId: user.id,
        patientName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        totalAppointments: total,
        completedAppointments: completed,
        failedReminders,
        upcomingConfirmed,
        risk,
      };
    })
    .filter((u) => u.risk !== "LOW")
    .sort((a, b) => (a.risk < b.risk ? 1 : -1));
}

export async function getUserTimeline() {
  try {
    const user = await getCurrentDbUserOrThrow();

    return Promise.all([
      prisma.appointment.findMany({
        where: { userId: user.id },
        include: { doctor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.appointmentReminder.findMany({
        where: { appointment: { userId: user.id } },
        include: {
          appointment: { include: { doctor: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]).then(([appointments, reminders, notifications]) =>
      [
        ...appointments.map((a) => ({
          id: `apt-${a.id}`,
          type: "APPOINTMENT",
          title: `Appointment ${a.status.toLowerCase()}`,
          description: `With Dr. ${a.doctor.name} at ${a.time}`,
          createdAt: a.createdAt,
        })),
        ...reminders.map((r) => ({
          id: `rem-${r.id}`,
          type: "REMINDER",
          title: `Reminder ${r.status.toLowerCase()}`,
          description: `${r.reminderType.replaceAll("_", " ")} for Dr. ${r.appointment.doctor.name}`,
          createdAt: r.createdAt,
        })),
        ...notifications.map((n) => ({
          id: `not-${n.id}`,
          type: n.type,
          title: n.title,
          description: n.message,
          createdAt: n.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 50),
    );
  } catch (error) {
    console.error("Error fetching user timeline:", error);
    return [];
  }
}

export async function getAppointmentActionLinksForEmail(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, userId: true },
  });
  if (!appointment) return {};

  return createAppointmentActionLinks({
    appointmentId: appointment.id,
    userId: appointment.userId,
  });
}
