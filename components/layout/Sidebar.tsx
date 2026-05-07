"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  MapPin,
  Warehouse,
  UserCircle,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'shipments', label: 'Shipments', icon: Package, href: '/shipments' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { id: 'fleet', label: 'Fleet', icon: Truck, href: '/fleet' },
  { id: 'drivers', label: 'Drivers', icon: Users, href: '/drivers' },
  { id: 'dispatch', label: 'Dispatch', icon: MapPin, href: '/dispatch' },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, href: '/warehouse' },
  { id: 'customers', label: 'Customers', icon: UserCircle, href: '/customers' },
  { id: 'finance', label: 'Finance', icon: DollarSign, href: '/finance' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
  { id: 'users', label: 'Users', icon: Users, href: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { allowedMenuItems, logout, user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => allowedMenuItems.includes(item.id));

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-sidebar-border/50",
          collapsed ? "px-3 justify-center" : "px-5"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
              LP
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display font-semibold text-lg tracking-tight">LogisticsPro</span>
                <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Enterprise</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl transition-all duration-200",
                    collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="bg-popover text-popover-foreground font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.id}>{linkContent}</div>;
            })}
          </nav>
        </ScrollArea>

        {/* User info and logout */}
        <div className={cn(
          "border-t border-sidebar-border/50",
          collapsed ? "p-2" : "p-4"
        )}>
          {!collapsed && user && (
            <div className="mb-3 px-2 py-2 rounded-lg bg-sidebar-accent/30">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.role}</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl",
                  collapsed ? "justify-center" : "justify-start gap-3 px-4"
                )}
                onClick={logout}
              >
                <LogOut className="w-[18px] h-[18px]" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={12} className="bg-popover text-popover-foreground font-medium">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-[72px] -right-3 w-6 h-6 rounded-full bg-background border-border shadow-md hover:bg-accent hover:scale-110 transition-transform duration-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  );
}
