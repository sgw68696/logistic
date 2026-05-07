"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/context/NotificationContext";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Truck,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Filter,
} from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState<string>("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "shipment":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "delivery":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageWrapper
      title="Notifications"
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>All Notifications</CardTitle>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                    <Bell className="mb-2 h-8 w-8" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                          notification.read
                            ? "bg-background"
                            : "border-primary/20 bg-primary/5"
                        }`}
                      >
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <p
                              className={`font-medium ${
                                notification.read ? "" : "text-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.timestamp, "datetime")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unread</span>
                <Badge variant="default">{unreadCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Today</span>
                <Badge variant="outline">
                  {
                    notifications.filter((n) => {
                      const today = new Date().toDateString();
                      return new Date(n.timestamp).toDateString() === today;
                    }).length
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Filter by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filter by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("all")}
              >
                <Bell className="mr-2 h-4 w-4" />
                All Notifications
              </Button>
              <Button
                variant={filter === "shipment" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("shipment")}
              >
                <Package className="mr-2 h-4 w-4" />
                Shipments
              </Button>
              <Button
                variant={filter === "delivery" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("delivery")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Deliveries
              </Button>
              <Button
                variant={filter === "warning" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("warning")}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Warnings
              </Button>
              <Button
                variant={filter === "success" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("success")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Success
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/settings">Manage Preferences</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
