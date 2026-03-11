"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserTimeline } from "@/hooks/use-appointments";

function TimelinePage() {
  const { data: items = [], isLoading, error } = useUserTimeline();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <Card>
          <CardHeader>
            <CardTitle>Patient Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading timeline...
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">
                Could not load timeline. Please refresh.
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timeline activity yet. Book or complete an appointment to
                start tracking events.
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TimelinePage;
