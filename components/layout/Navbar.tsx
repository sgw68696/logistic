"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronRight, Sun, Moon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm">
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
              {crumb.isLast ? (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Mock Mode Banner */}
        {APP_CONFIG.USE_MOCK && (
          <div className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 bg-warning/10 border border-warning/20 rounded-full">
            <span className="text-xs font-semibold text-warning tracking-wide">DEMO MODE</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus:border-border rounded-xl"
            />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground rounded-xl"
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-muted-foreground hover:text-foreground rounded-xl"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg shadow-primary/25">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl">
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-semibold">
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
                      className="flex flex-col items-start gap-1.5 p-4 cursor-pointer rounded-lg mx-1 my-0.5"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-muted-foreground/30' : 'bg-primary shadow-sm shadow-primary/50'}`} />
                        <span className="font-semibold text-sm flex-1 truncate">{notif.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground/70 pl-4 font-medium">
                        {formatDate(notif.timestamp, 'datetime')}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="mx-1 mb-1">
                    <Link 
                      href="/notifications" 
                      className="w-full text-center text-sm font-semibold text-primary hover:text-primary py-2 rounded-lg"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 px-2 py-1.5 h-auto rounded-xl hover:bg-muted/50"
              >
                <Avatar className="w-9 h-9 ring-2 ring-primary/10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {user?.avatar || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    {user?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
              <DropdownMenuLabel className="py-3">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer">
                <Link href="/settings" className="font-medium">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-destructive focus:text-destructive font-medium rounded-lg mx-1 mb-1 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
