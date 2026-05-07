import { APP_CONFIG } from "@/config/appConfig";
import { mockAnalytics, mockShipments, mockDrivers, mockVehicles, mockCustomers } from "@/data/mockData";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
}

export const getShipmentReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const statusCounts = mockShipments.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalShipments: mockShipments.length,
      statusBreakdown: statusCounts,
      averageDeliveryTime: '2.5 days',
      onTimeDeliveryRate: 94.5,
      trend: mockAnalytics.shipmentTrend,
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/shipments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getDriverReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalDrivers: mockDrivers.length,
      activeDrivers: mockDrivers.filter(d => d.status === 'Active' || d.status === 'On Duty').length,
      averageRating: (mockDrivers.reduce((sum, d) => sum + d.rating, 0) / mockDrivers.length).toFixed(1),
      totalTrips: mockDrivers.reduce((sum, d) => sum + d.totalTrips, 0),
      performanceData: mockAnalytics.driverPerformance,
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/drivers?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getFleetReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalVehicles: mockVehicles.length,
      activeVehicles: mockVehicles.filter(v => v.status === 'Available' || v.status === 'On Route').length,
      maintenanceCount: mockVehicles.filter(v => v.status === 'Maintenance').length,
      utilizationRate: 78.3,
      utilizationData: mockAnalytics.fleetUtilization,
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/fleet?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getRevenueReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalRevenue = mockAnalytics.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = mockAnalytics.monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      profitMargin: ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1),
      monthlyData: mockAnalytics.monthlyRevenue,
      regionData: mockAnalytics.revenueByRegion,
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/revenue?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getCustomerReport = async (filters?: ReportFilters) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalCustomers: mockCustomers.length,
      businessCustomers: mockCustomers.filter(c => c.type === 'Business').length,
      individualCustomers: mockCustomers.filter(c => c.type === 'Individual').length,
      totalOutstanding: mockCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0),
      topCustomers: mockCustomers
        .sort((a, b) => b.totalShipments - a.totalShipments)
        .slice(0, 10)
        .map(c => ({ name: c.name, shipments: c.totalShipments, type: c.type })),
    };
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/reports/customers?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};
