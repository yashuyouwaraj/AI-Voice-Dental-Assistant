"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  Clock3Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface ReminderStatsProps {
  pending: number;
  sent: number;
  failed: number;
  dueNow: number;
}

function ReminderStats({ pending, sent, failed, dueNow }: ReminderStatsProps) {
  const queryClient = useQueryClient();
  const [dispatching, setDispatching] = useState(false);

  const handleDispatchNow = async () => {
    try {
      setDispatching(true);
      const response = await fetch("/api/admin/reminders/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 50, backfill: true }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Dispatch failed");
      }

      if (!payload.processed) {
        toast.message("No due reminders right now. Backfill completed.");
      } else {
        toast.success(
          `Processed ${payload.processed}: sent ${payload.sent}, failed ${payload.failed}.`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["getReminderStats"] });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to dispatch due reminders",
      );
    } finally {
      setDispatching(false);
    }
  };

  const items = [
    {
      label: "Pending Reminders",
      value: pending,
      icon: BellIcon,
      tone: "from-primary/20 to-primary/10",
    },
    {
      label: "Sent Reminders",
      value: sent,
      icon: CheckCircle2Icon,
      tone: "from-green-200/60 to-green-100/60",
    },
    {
      label: "Failed Reminders",
      value: failed,
      icon: AlertTriangleIcon,
      tone: "from-red-200/60 to-red-100/60",
    },
    {
      label: "Due Now",
      value: dueNow,
      icon: Clock3Icon,
      tone: "from-amber-200/60 to-amber-100/60",
    },
  ];

  return (
    <Card className="mb-12">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Reminder Operations</CardTitle>
          <Button size="sm" onClick={handleDispatchNow} disabled={dispatching}>
            {dispatching ? "Dispatching..." : "Dispatch Due Reminders"}
          </Button>
        </div>
        <CardDescription>
          Email reminder health and dispatch readiness
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-lg bg-linear-to-br ${item.tone} flex items-center justify-center`}
                >
                  <item.icon className="size-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReminderStats;
