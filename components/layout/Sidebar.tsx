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
          "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
              LP
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">LogisticsPro</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
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
        <div className="border-t border-sidebar-border p-4">
          {!collapsed && user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed ? "w-full justify-center" : "flex-1"
                  )}
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  Logout
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-background border border-border shadow-sm hover:bg-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  );
}
