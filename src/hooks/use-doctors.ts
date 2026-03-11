"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDoctor,
  getAvailableDoctors,
  getDoctors,
  updateDoctor,
} from "@/lib/actions/doctors";
import {
  getDoctorAvailabilities,
  upsertDoctorAvailability,
} from "@/lib/actions/engagement-actions";

export function useGetDoctors() {
  const result = useQuery({
    queryKey: ["getDoctors"],
    queryFn: getDoctors,
  });

  return result;
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      // invalidate related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
    },
    onError: (_error) => console.log("Error while  creating a doctor"),
  });

  return result;
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
      queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
    },
    onError: (error) => console.error("Failed to update doctor:", error),
  });
}

// get available doctors for appointments
export function useAvailableDoctors() {
  const result = useQuery({
    queryKey: ["getAvailableDoctors"],
    queryFn: getAvailableDoctors,
  });

  return result;
}

export function useDoctorAvailabilities(doctorId: string) {
  return useQuery({
    queryKey: ["getDoctorAvailabilities", doctorId],
    queryFn: () => getDoctorAvailabilities(doctorId),
    enabled: !!doctorId,
  });
}

export function useUpsertDoctorAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertDoctorAvailability,
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ["getDoctorAvailabilities", input.doctorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["getAvailableDoctorTimeSlots"],
      });
    },
  });
}
