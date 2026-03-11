"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCancelReminder,
  useRecentRemindersForAdmin,
  useResumeReminder,
  useRetryReminder,
} from "@/hooks/use-appointments";

function ReminderControlTable() {
  const { data: reminders = [], isLoading } = useRecentRemindersForAdmin();
  const retry = useRetryReminder();
  const cancel = useCancelReminder();
  const resume = useResumeReminder();

  if (isLoading) return null;

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle>Reminder Control Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reminders.slice(0, 12).map((reminder) => (
            <div
              key={reminder.id}
              className="border rounded-lg p-3 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-sm">
                  {reminder.appointment.user.firstName || "Patient"} - Dr.{" "}
                  {reminder.appointment.doctor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reminder.reminderType.replaceAll("_", " ")} |{" "}
                  {reminder.appointment.user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{reminder.status}</Badge>
                {reminder.status === "FAILED" ? (
                  <Button size="sm" onClick={() => retry.mutate(reminder.id)}>
                    Retry
                  </Button>
                ) : null}
                {reminder.status === "PENDING" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancel.mutate(reminder.id)}
                  >
                    Pause
                  </Button>
                ) : null}
                {reminder.status === "CANCELLED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resume.mutate(reminder.id)}
                  >
                    Resume
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReminderControlTable;
