"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientRiskAlerts } from "@/hooks/use-appointments";

function PatientRiskAlerts() {
  const { data = [] } = usePatientRiskAlerts();

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle>Patient Risk Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medium/high risk patients detected.
          </p>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 10).map((risk) => (
              <div
                key={risk.userId}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{risk.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Failed reminders: {risk.failedReminders} | Upcoming:{" "}
                    {risk.upcomingConfirmed}
                  </p>
                </div>
                <Badge
                  variant={risk.risk === "HIGH" ? "destructive" : "secondary"}
                >
                  {risk.risk}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientRiskAlerts;
