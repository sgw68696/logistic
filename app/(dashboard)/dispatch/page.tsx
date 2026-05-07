"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getShipments, updateShipment } from "@/services/shipmentService";
import { getVehicles } from "@/services/fleetService";
import { getDrivers } from "@/services/driverService";
import { type Shipment, type Vehicle, type Driver } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Truck,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  LayoutGrid,
  List,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function DispatchPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shipmentsData, vehiclesData, driversData] = await Promise.all([
        getShipments(),
        getVehicles(),
        getDrivers(),
      ]);
      setShipments(shipmentsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const pendingShipments = shipments.filter(
    (s) => s.status === "Pending" || s.status === "Picked Up"
  );
  const inTransitShipments = shipments.filter((s) => s.status === "In Transit");
  const outForDeliveryShipments = shipments.filter(
    (s) => s.status === "Out for Delivery"
  );

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter(
    (d) => d.status === "Active" || d.status === "Off Duty"
  );

  const handleAssign = async () => {
    if (!selectedShipment || !selectedVehicle || !selectedDriver) return;

    try {
      await updateShipment(selectedShipment.id, {
        status: "In Transit",
        assignedDriver: selectedDriver,
        assignedVehicle: selectedVehicle,
      });
      toast.success("Shipment assigned successfully");
      setSelectedShipment(null);
      setSelectedVehicle("");
      setSelectedDriver("");
      loadData();
    } catch {
      toast.error("Failed to assign shipment");
    }
  };

  const filteredPending = pendingShipments.filter(
    (s) =>
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageWrapper title="Dispatch Management" description="Assign shipments to vehicles">
        <SkeletonLoader variant="card" count={4} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Dispatch Management"
      description="Assign shipments to vehicles and drivers"
      actions={
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Assignment</p>
                <p className="text-2xl font-bold">{pendingShipments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{inTransitShipments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out for Delivery</p>
                <p className="text-2xl font-bold">{outForDeliveryShipments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Resources</p>
                <p className="text-2xl font-bold">
                  {availableVehicles.length}V / {availableDrivers.length}D
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Shipments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Pending Shipments</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="w-[200px] pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex rounded-lg border">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {filteredPending.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No pending shipments found
                </div>
              ) : view === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPending.map((shipment) => (
                    <Card
                      key={shipment.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedShipment?.id === shipment.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-mono text-sm font-medium">
                            {shipment.trackingNumber}
                          </span>
                          <StatusBadge status={shipment.status} />
                        </div>
                        <div className="mb-3 flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-green-500" />
                            <span className="truncate">{shipment.pickupAddress.split(",")[0]}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-red-500" />
                            <span className="truncate">{shipment.deliveryAddress.split(",")[0]}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{shipment.packageWeight} kg</span>
                          <span>
                            Est: {formatDate(shipment.estimatedDelivery)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPending.map((shipment) => (
                    <div
                      key={shipment.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent ${
                        selectedShipment?.id === shipment.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{shipment.trackingNumber}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {shipment.receiverName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>{shipment.packageWeight} kg</p>
                          <p className="text-muted-foreground">
                            {formatDate(shipment.estimatedDelivery)}
                          </p>
                        </div>
                        <StatusBadge status={shipment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Assignment Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Assign Resources</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedShipment ? (
              <div className="space-y-6">
                {/* Selected Shipment Info */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">
                      {selectedShipment.trackingNumber}
                    </span>
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="truncate">{selectedShipment.pickupAddress.split(",")[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="truncate">{selectedShipment.deliveryAddress.split(",")[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedShipment.packageWeight} kg, {selectedShipment.packageDimensions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Deliver by {formatDate(selectedShipment.estimatedDelivery)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Vehicle</label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>
                              {vehicle.vehicleId} - {vehicle.type}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {vehicle.capacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableVehicles.length === 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      No vehicles available
                    </p>
                  )}
                </div>

                {/* Driver Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Driver</label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {driver.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{driver.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {driver.rating.toFixed(1)} ★
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDrivers.length === 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      No drivers available
                    </p>
                  )}
                </div>

                {/* Assign Button */}
                <Button
                  className="w-full"
                  disabled={!selectedVehicle || !selectedDriver}
                  onClick={handleAssign}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Assign &amp; Dispatch
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedShipment(null);
                    setSelectedVehicle("");
                    setSelectedDriver("");
                  }}
                >
                  Cancel Selection
                </Button>
              </div>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center text-center text-muted-foreground">
                <Package className="mb-4 h-12 w-12" />
                <p className="font-medium">No Shipment Selected</p>
                <p className="text-sm">
                  Click on a pending shipment to assign resources
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Routes Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inTransit">
            <TabsList>
              <TabsTrigger value="inTransit">
                In Transit ({inTransitShipments.length})
              </TabsTrigger>
              <TabsTrigger value="outForDelivery">
                Out for Delivery ({outForDeliveryShipments.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inTransit" className="mt-4">
              {inTransitShipments.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No shipments in transit
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inTransitShipments.slice(0, 6).map((shipment) => (
                    <Card key={shipment.id}>
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-mono text-sm font-medium">
                            {shipment.trackingNumber}
                          </span>
                          <StatusBadge status={shipment.status} />
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="truncate">{shipment.pickupAddress.split(",")[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="truncate">{shipment.deliveryAddress.split(",")[0]}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="outForDelivery" className="mt-4">
              {outForDeliveryShipments.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No shipments out for delivery
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {outForDeliveryShipments.slice(0, 6).map((shipment) => (
                    <Card key={shipment.id}>
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-mono text-sm font-medium">
                            {shipment.trackingNumber}
                          </span>
                          <StatusBadge status={shipment.status} />
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="truncate">{shipment.deliveryAddress.split(",")[0]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est: {formatDate(shipment.estimatedDelivery)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
