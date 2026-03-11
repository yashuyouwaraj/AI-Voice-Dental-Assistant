"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useDoctorAvailabilities,
  useGetDoctors,
  useUpsertDoctorAvailability,
} from "@/hooks/use-doctors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayDraft = {
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
};

function draftsEqual(
  left: Record<number, DayDraft>,
  right: Record<number, DayDraft>,
) {
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const a = left[dayIndex];
    const b = right[dayIndex];
    if (!a && !b) continue;
    if (!a || !b) return false;
    if (
      a.startTime !== b.startTime ||
      a.endTime !== b.endTime ||
      a.slotMinutes !== b.slotMinutes ||
      a.isActive !== b.isActive
    ) {
      return false;
    }
  }
  return true;
}

function DoctorAvailabilityManager() {
  const { data: doctors = [] } = useGetDoctors();
  const [doctorId, setDoctorId] = useState<string>("");
  const { data: availabilities = [] } = useDoctorAvailabilities(doctorId);
  const [dayDrafts, setDayDrafts] = useState<Record<number, DayDraft>>({});
  const upsert = useUpsertDoctorAvailability();

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  useEffect(() => {
    if (!doctorId) {
      setDayDrafts((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const nextDrafts: Record<number, DayDraft> = {};
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const value = availabilities.find((a) => a.dayOfWeek === dayIndex);
      nextDrafts[dayIndex] = {
        startTime: value?.startTime || "09:00",
        endTime: value?.endTime || "17:00",
        slotMinutes: value?.slotMinutes || 30,
        isActive: value?.isActive ?? dayIndex !== 0,
      };
    }
    setDayDrafts((prev) => (draftsEqual(prev, nextDrafts) ? prev : nextDrafts));
  }, [doctorId, availabilities]);

  const updateDraft = (dayIndex: number, patch: Partial<DayDraft>) => {
    setDayDrafts((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        ...patch,
      },
    }));
  };

  const saveDay = (dayIndex: number, dayLabel: string) => {
    const draft = dayDrafts[dayIndex];
    if (!doctorId || !draft) return;
    if (draft.endTime <= draft.startTime) {
      toast.error(`${dayLabel}: end time must be after start time`);
      return;
    }

    upsert.mutate(
      {
        doctorId,
        dayOfWeek: dayIndex,
        startTime: draft.startTime,
        endTime: draft.endTime,
        slotMinutes: draft.slotMinutes,
        isActive: draft.isActive,
      },
      {
        onSuccess: () => toast.success(`${dayLabel} availability updated`),
        onError: () => toast.error("Failed to update availability"),
      },
    );
  };

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle>Doctor Availability Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Doctor</Label>
          <select
            className="w-full border rounded-md h-10 px-3 bg-background"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Choose doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDoctor
          ? DAYS.map((day, dayIndex) => {
              const draft = dayDrafts[dayIndex];
              if (!draft) return null;

              return (
                <div
                  key={`${doctorId}-${day}`}
                  className="grid md:grid-cols-6 gap-3 border rounded-lg p-3 items-end"
                >
                  <div>
                    <Label>{day}</Label>
                    <div className="h-10 flex items-center text-sm">{day}</div>
                  </div>
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="time"
                      value={draft.startTime}
                      onChange={(e) =>
                        updateDraft(dayIndex, { startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="time"
                      value={draft.endTime}
                      onChange={(e) =>
                        updateDraft(dayIndex, { endTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Slot (min)</Label>
                    <Input
                      type="number"
                      min={10}
                      step={5}
                      value={draft.slotMinutes}
                      onChange={(e) =>
                        updateDraft(dayIndex, {
                          slotMinutes: Number(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={draft.isActive}
                      onCheckedChange={(checked) =>
                        updateDraft(dayIndex, { isActive: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <Button
                    onClick={() => saveDay(dayIndex, day)}
                    size="sm"
                    variant="outline"
                    disabled={upsert.isPending}
                  >
                    Save
                  </Button>
                </div>
              );
            })
          : null}
      </CardContent>
    </Card>
  );
}

export default DoctorAvailabilityManager;
