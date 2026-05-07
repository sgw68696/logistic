"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from 'next-themes';
import { formatDate } from '@/lib/utils';
import { APP_CONFIG } from '@/config/appConfig';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  shipments: 'Shipments',
  orders: 'Orders',
  fleet: 'Fleet Management',
  drivers: 'Drivers',
  dispatch: 'Dispatch',
  warehouse: 'Warehouse',
  customers: 'Customers',
  finance: 'Finance',
  reports: 'Reports',
  notifications: 'Notifications',
  users: 'Users',
  settings: 'Settings',
};

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { theme, setTheme } = useTheme();

  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => ({
    label: pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1),
    href: '/' + pathParts.slice(0, index + 1).join('/'),
    isLast: index === pathParts.length - 1,
  }));

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 h-16 bg-background border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              {crumb.isLast ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Mock Mode Banner */}
        {APP_CONFIG.USE_MOCK && (
          <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1 bg-warning/10 border border-warning/20 rounded-full">
            <span className="text-xs font-medium text-warning">Mock Mode Active</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={`w-2 h-2 rounded-full ${notif.read ? 'bg-muted' : 'bg-primary'}`} />
                        <span className="font-medium text-sm flex-1 truncate">{notif.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{notif.message}</p>
                      <span className="text-xs text-muted-foreground pl-4">{formatDate(notif.timestamp, 'datetime')}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="w-full text-center text-sm text-primary">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.avatar || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {user?.role}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
