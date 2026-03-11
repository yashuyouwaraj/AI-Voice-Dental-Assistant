"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUserNotifications,
} from "@/hooks/use-appointments";

function NotificationsPage() {
  const { data: notifications = [], isLoading, error } = useUserNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Notification Inbox</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              Mark all read
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading notifications...
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">
                Could not load notifications. Please refresh.
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notifications yet. You will see appointment updates and
                reminders here.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${notification.read ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read ? (
                        <Button
                          size="sm"
                          onClick={() => markRead.mutate(notification.id)}
                          disabled={markRead.isPending}
                        >
                          Mark Read
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
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

export default NotificationsPage;
