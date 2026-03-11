"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentDbUserOrThrow } from "./users";

async function getCurrentDbUser() {
  return getCurrentDbUserOrThrow();
}

export async function getUserNotifications() {
  try {
    const user = await getCurrentDbUser();
    return await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  const user = await getCurrentDbUser();
  return prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
}

export async function markAllNotificationsRead() {
  const user = await getCurrentDbUser();
  return prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}

export async function getUserCarePlans() {
  try {
    const user = await getCurrentDbUser();
    return await prisma.carePlan.findMany({
      where: { userId: user.id },
      include: {
        tasks: true,
        appointment: { include: { doctor: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching user care plans:", error);
    return [];
  }
}

export async function toggleCareTask(taskId: string) {
  const user = await getCurrentDbUser();
  const task = await prisma.careTask.findFirst({
    where: { id: taskId, carePlan: { userId: user.id } },
  });
  if (!task) throw new Error("Task not found");
  return prisma.careTask.update({
    where: { id: task.id },
    data: { completed: !task.completed },
  });
}

export async function getRecentRemindersForAdmin() {
  return prisma.appointmentReminder.findMany({
    include: {
      appointment: {
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          doctor: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
}

export async function retryReminder(reminderId: string) {
  return prisma.appointmentReminder.update({
    where: { id: reminderId },
    data: { status: "PENDING", errorMessage: null },
  });
}

export async function cancelReminder(reminderId: string) {
  return prisma.appointmentReminder.update({
    where: { id: reminderId },
    data: { status: "CANCELLED", errorMessage: "Cancelled manually by admin" },
  });
}

export async function resumeReminder(reminderId: string) {
  return prisma.appointmentReminder.update({
    where: { id: reminderId },
    data: { status: "PENDING", errorMessage: null },
  });
}

export async function getDoctorAvailabilities(doctorId: string) {
  return prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function upsertDoctorAvailability(input: {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
}) {
  return prisma.doctorAvailability.upsert({
    where: {
      doctorId_dayOfWeek: {
        doctorId: input.doctorId,
        dayOfWeek: input.dayOfWeek,
      },
    },
    update: {
      startTime: input.startTime,
      endTime: input.endTime,
      slotMinutes: input.slotMinutes,
      isActive: input.isActive,
    },
    create: input,
  });
}
