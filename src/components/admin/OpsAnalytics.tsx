"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpsAnalytics } from "@/hooks/use-appointments";

function OpsAnalytics() {
  const { data } = useOpsAnalytics();
  if (!data) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-12">
      <Card>
        <CardHeader>
          <CardTitle>Appointments Per Day (14d)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.appointmentsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#e78a53" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Status Mix</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.reminderByStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                fill="#e78a53"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpsAnalytics;
