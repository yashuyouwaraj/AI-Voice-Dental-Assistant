"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToggleCareTask, useUserCarePlans } from "@/hooks/use-appointments";

function CarePlanPage() {
  const { data: plans = [], isLoading, error } = useUserCarePlans();
  const toggle = useToggleCareTask();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8 pt-24">
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <Image
              src="/Brushing.png"
              alt="Brushing reminder"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
            />
            <p className="text-sm font-medium">
              Keep brushing routines on track
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <Image
              src="/MouthWash.png"
              alt="Mouthwash reminder"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
            />
            <p className="text-sm font-medium">
              Follow rinse and hygiene tasks
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <Image
              src="/Sleeping.png"
              alt="Night care reminder"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
            />
            <p className="text-sm font-medium">
              Complete your night care checklist
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Care Plan Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading care plan...
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">
                Could not load care plan. Please refresh.
              </p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Care plans appear after your appointments are marked completed.
              </p>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {plan.appointment.doctor.name} -{" "}
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                  <div className="space-y-2">
                    {plan.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between border rounded p-2"
                      >
                        <div>
                          <p
                            className={
                              task.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }
                          >
                            {task.title}
                          </p>
                          {task.description ? (
                            <p className="text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggle.mutate(task.id)}
                        >
                          {task.completed ? "Undo" : "Complete"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CarePlanPage;
