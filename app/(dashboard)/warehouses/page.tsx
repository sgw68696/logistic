"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { warehouseService, type Warehouse } from "@/services/warehouseService";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Users,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    capacity: 0,
    manager: "",
    contact: "",
    status: "Active" as Warehouse["status"],
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    const data = await warehouseService.getWarehouses();
    setWarehouses(data);
    setLoading(false);
  };

  const handleAddWarehouse = async () => {
    await warehouseService.createWarehouse({
      ...formData,
      currentOccupancy: 0,
      employees: 0,
      zones: [],
    });
    setIsAddDialogOpen(false);
    resetForm();
    loadWarehouses();
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (confirm("Are you sure you want to delete this warehouse?")) {
      await warehouseService.deleteWarehouse(id);
      loadWarehouses();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      capacity: 0,
      manager: "",
      contact: "",
      status: "Active",
    });
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || warehouse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalOccupancy = warehouses.reduce((sum, w) => sum + w.currentOccupancy, 0);
  const utilizationRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;
  const activeWarehouses = warehouses.filter((w) => w.status === "Active").length;

  const columns = [
    {
      key: "name",
      label: "Warehouse",
      sortable: true,
      render: (value: string, row: Warehouse) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <WarehouseIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      label: "Location",
      sortable: true,
      render: (value: string, row: Warehouse) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {value}, {row.state}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "currentOccupancy",
      label: "Utilization",
      render: (value: number, row: Warehouse) => {
        const percentage = (value / row.capacity) * 100;
        return (
          <div className="w-32">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>{percentage.toFixed(0)}%</span>
              <span className="text-muted-foreground">
                {value.toLocaleString()}/{row.capacity.toLocaleString()}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                percentage > 90
                  ? "[&>div]:bg-red-500"
                  : percentage > 70
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-green-500"
              }`}
            />
          </div>
        );
      },
    },
    {
      key: "employees",
      label: "Staff",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "manager",
      label: "Manager",
      sortable: true,
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: Warehouse) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedWarehouse(row);
                setIsDetailOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteWarehouse(row.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Warehouse Management" subtitle="Manage your warehouses">
        <SkeletonLoader type="table" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Warehouse Management"
      subtitle="Manage your warehouses and inventory locations"
      actions={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
              <DialogDescription>
                Enter the details for the new warehouse.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Warehouse name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., WH-DEL-01"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity (sq ft)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Warehouse["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    placeholder="Manager name"
                    value={formData.manager}
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    placeholder="Phone number"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWarehouse}>Add Warehouse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Warehouses</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <WarehouseIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeWarehouses}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{(totalCapacity / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">sq ft</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  utilizationRate > 80 ? "bg-amber-100" : "bg-green-100"
                }`}
              >
                <TrendingUp
                  className={`h-6 w-6 ${
                    utilizationRate > 80 ? "text-amber-600" : "text-green-600"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredWarehouses}
        columns={columns}
        searchable={false}
        pageSize={10}
      />

      {/* Warehouse Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Warehouse Details</DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <WarehouseIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedWarehouse.name}</h3>
                  <p className="text-muted-foreground">{selectedWarehouse.code}</p>
                </div>
                <StatusBadge status={selectedWarehouse.status} className="ml-auto" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{selectedWarehouse.address}</p>
                    <p>
                      {selectedWarehouse.city}, {selectedWarehouse.state} -{" "}
                      {selectedWarehouse.pincode}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Capacity & Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Capacity</span>
                      <span className="font-medium">
                        {selectedWarehouse.capacity.toLocaleString()} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Occupancy</span>
                      <span className="font-medium">
                        {selectedWarehouse.currentOccupancy.toLocaleString()} sq ft
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedWarehouse.currentOccupancy /
                          selectedWarehouse.capacity) *
                        100
                      }
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager</span>
                      <span className="font-medium">{selectedWarehouse.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span className="font-medium">{selectedWarehouse.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff</span>
                      <span className="font-medium">
                        {selectedWarehouse.employees} employees
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Zones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedWarehouse.zones.map((zone, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
