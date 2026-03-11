"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bookAppointment,
  getAppointments,
  getAvailableDoctorTimeSlots,
  getOpsAnalytics,
  getPatientRiskAlerts,
  getReminderStats,
  getUserAppointments,
  getUserTimeline,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import {
  cancelReminder,
  getRecentRemindersForAdmin,
  getUserCarePlans,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resumeReminder,
  retryReminder,
  toggleCareTask,
} from "@/lib/actions/engagement-actions";

export function useGetAppointments() {
  return useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });
}

export function useAvailableDoctorTimeSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ["getAvailableDoctorTimeSlots", doctorId, date],
    queryFn: () => getAvailableDoctorTimeSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["getUserTimeline"] });
      queryClient.invalidateQueries({ queryKey: ["getUserNotifications"] });
    },
    onError: (error) => console.error("Failed to book appointment:", error),
  });
}

export function useUserAppointments() {
  return useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: getUserAppointments,
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["getUserTimeline"] });
      queryClient.invalidateQueries({ queryKey: ["getUserNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["getReminderStats"] });
      queryClient.invalidateQueries({ queryKey: ["getUserCarePlans"] });
      queryClient.invalidateQueries({ queryKey: ["getPatientRiskAlerts"] });
    },
    onError: (error) =>
      console.error("Failed to update appointment status:", error),
  });
}

export function useReminderStats() {
  return useQuery({
    queryKey: ["getReminderStats"],
    queryFn: getReminderStats,
  });
}

export function useOpsAnalytics() {
  return useQuery({
    queryKey: ["getOpsAnalytics"],
    queryFn: getOpsAnalytics,
  });
}

export function usePatientRiskAlerts() {
  return useQuery({
    queryKey: ["getPatientRiskAlerts"],
    queryFn: getPatientRiskAlerts,
  });
}

export function useUserTimeline() {
  return useQuery({
    queryKey: ["getUserTimeline"],
    queryFn: getUserTimeline,
  });
}

export function useRecentRemindersForAdmin() {
  return useQuery({
    queryKey: ["getRecentRemindersForAdmin"],
    queryFn: getRecentRemindersForAdmin,
  });
}

export function useUserNotifications() {
  return useQuery({
    queryKey: ["getUserNotifications"],
    queryFn: getUserNotifications,
  });
}

export function useUserCarePlans() {
  return useQuery({
    queryKey: ["getUserCarePlans"],
    queryFn: getUserCarePlans,
  });
}

export function useRetryReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentRemindersForAdmin"],
      });
      queryClient.invalidateQueries({ queryKey: ["getReminderStats"] });
    },
  });
}

export function useCancelReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentRemindersForAdmin"],
      });
      queryClient.invalidateQueries({ queryKey: ["getReminderStats"] });
    },
  });
}

export function useResumeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentRemindersForAdmin"],
      });
      queryClient.invalidateQueries({ queryKey: ["getReminderStats"] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["getUserTimeline"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserNotifications"] });
    },
  });
}

export function useToggleCareTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleCareTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserCarePlans"] });
      queryClient.invalidateQueries({ queryKey: ["getUserTimeline"] });
    },
  });
}
