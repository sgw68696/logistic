"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  Gauge,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { mockAnalytics, mockShipments, mockNotifications } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { kpiSummary, shipmentTrend, statusDistribution, monthlyRevenue, revenueByRegion } = mockAnalytics;
  const recentShipments = mockShipments.slice(0, 5);
  const alerts = mockNotifications.filter(n => !n.read).slice(0, 4);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#6b7280', '#ef4444', '#dc2626'];

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <SkeletonLoader variant="card" count={6} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkeletonLoader variant="table" count={3} />
          <SkeletonLoader variant="table" count={3} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
      description={`Here&apos;s what&apos;s happening with your logistics operations today.`}
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <KPICard
          title="Total Shipments"
          value={kpiSummary.totalShipments.toLocaleString()}
          icon={<Package className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
          description="vs last month"
        />
        <KPICard
          title="Active Deliveries"
          value={kpiSummary.activeDeliveries}
          icon={<Truck className="w-6 h-6" />}
          trend={{ value: 8.2, isPositive: true }}
          description="in transit"
        />
        <KPICard
          title="Pending Pickups"
          value={kpiSummary.pendingPickups}
          icon={<Clock className="w-6 h-6" />}
          trend={{ value: 3.1, isPositive: false }}
          description="awaiting"
        />
        <KPICard
          title="Revenue (Month)"
          value={formatCurrency(kpiSummary.revenueThisMonth)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 15.3, isPositive: true }}
          description="vs last month"
        />
        <KPICard
          title="On-Time Delivery"
          value={`${kpiSummary.onTimeDeliveryRate}%`}
          icon={<CheckCircle className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: true }}
          description="performance"
        />
        <KPICard
          title="Fleet Utilization"
          value={`${kpiSummary.fleetUtilization}%`}
          icon={<Gauge className="w-6 h-6" />}
          trend={{ value: 5.4, isPositive: true }}
          description="efficiency"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Shipments Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Shipments Overview</CardTitle>
            <CardDescription>Daily shipment activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shipmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="shipments"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Shipment Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>Monthly financial overview for the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Latest shipment activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shipments">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{shipment.trackingNumber}</p>
                      <p className="text-xs text-muted-foreground">{shipment.receiverName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={shipment.status} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(shipment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(alert.timestamp, 'datetime')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
