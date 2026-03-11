import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

type NotificationDelegate = {
  create: typeof prisma.notification.create;
};

type CarePlanDelegate = {
  findFirst: typeof prisma.carePlan.findFirst;
  create: typeof prisma.carePlan.create;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
}

export async function createAppointmentActionLinks(input: {
  appointmentId: string;
  userId: string;
}) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

  const confirmToken =
    randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
  const rescheduleToken =
    randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

  await prisma.appointmentActionToken.createMany({
    data: [
      {
        token: confirmToken,
        type: "CONFIRM",
        appointmentId: input.appointmentId,
        userId: input.userId,
        expiresAt,
      },
      {
        token: rescheduleToken,
        type: "RESCHEDULE",
        appointmentId: input.appointmentId,
        userId: input.userId,
        expiresAt,
      },
    ],
  });

  const base = appUrl();
  if (!base) return { confirmUrl: undefined, rescheduleUrl: undefined };

  return {
    confirmUrl: `${base}/api/appointments/respond?token=${confirmToken}`,
    rescheduleUrl: `${base}/api/appointments/respond?token=${rescheduleToken}`,
  };
}

export async function consumeAppointmentActionToken(token: string) {
  const record = await prisma.appointmentActionToken.findUnique({
    where: { token },
    include: {
      appointment: {
        include: {
          doctor: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!record) return { ok: false as const, reason: "Token not found" };
  if (record.usedAt)
    return { ok: false as const, reason: "Token already used" };
  if (record.expiresAt < new Date())
    return { ok: false as const, reason: "Token expired" };

  await prisma.appointmentActionToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true as const, record };
}

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: "REMINDER" | "APPOINTMENT" | "CARE_PLAN" | "SYSTEM";
}) {
  const notificationModel = (
    prisma as unknown as { notification?: NotificationDelegate }
  ).notification;
  if (!notificationModel?.create) {
    console.warn(
      "Notification model is unavailable on Prisma client. Skipping notification create.",
    );
    return null;
  }

  try {
    return await notificationModel.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type ?? "SYSTEM",
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function ensureCarePlanForCompletedAppointment(input: {
  appointmentId: string;
  userId: string;
  doctorName: string;
  appointmentDate: Date;
}) {
  const carePlanModel = (prisma as unknown as { carePlan?: CarePlanDelegate })
    .carePlan;
  if (!carePlanModel?.findFirst || !carePlanModel?.create) {
    console.warn(
      "CarePlan model is unavailable on Prisma client. Skipping care plan creation.",
    );
    return null;
  }

  const existing = await carePlanModel.findFirst({
    where: { appointmentId: input.appointmentId },
    select: { id: true },
  });
  if (existing) return existing;

  const carePlan = await carePlanModel.create({
    data: {
      appointmentId: input.appointmentId,
      userId: input.userId,
      title: `Post-visit plan with Dr. ${input.doctorName}`,
      notes: "Personalized recovery and oral care tasks.",
      tasks: {
        create: [
          {
            title: "Brush twice daily with soft brush",
            description: "Use gentle circular motion for 2 minutes.",
          },
          {
            title: "Floss once daily",
            description: "Avoid aggressive flossing around sensitive gums.",
          },
          {
            title: "Use prescribed rinse",
            description: "Follow the dosage advised by your dentist.",
          },
          {
            title: "Schedule follow-up check",
            dueDate: new Date(
              input.appointmentDate.getTime() + 1000 * 60 * 60 * 24 * 14,
            ),
          },
        ],
      },
    },
    select: { id: true },
  });

  await createNotification({
    userId: input.userId,
    title: "Care Plan Ready",
    message:
      "A personalized care plan has been created after your completed appointment.",
    type: "CARE_PLAN",
  });

  return carePlan;
}
