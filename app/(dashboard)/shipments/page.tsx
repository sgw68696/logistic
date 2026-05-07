"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Download, Filter, X } from 'lucide-react';
import { getShipments, createShipment } from '@/services/shipmentService';
import { type Shipment, type ShipmentStatus } from '@/data/mockData';
import { formatDate, formatCurrency, generateTrackingId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const statusOptions: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('shipments', 'create');

  useEffect(() => {
    loadShipments();
  }, [statusFilter]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter as ShipmentStatus } : undefined;
      const data = await getShipments(filters);
      setShipments(data);
    } catch {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = searchQuery
    ? shipments.filter(s =>
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shipments;

  const columns: Column<Shipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking Number',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-primary">{item.trackingNumber}</span>
      ),
    },
    {
      key: 'senderName',
      header: 'Sender',
      sortable: true,
    },
    {
      key: 'receiverName',
      header: 'Receiver',
      sortable: true,
    },
    {
      key: 'deliveryAddress',
      header: 'Destination',
      render: (item) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {item.deliveryAddress}
        </span>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (item) => (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          item.serviceType === 'Express' ? 'bg-primary/10 text-primary' :
          item.serviceType === 'Freight' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-muted text-muted-foreground'
        }`}>
          {item.serviceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => formatDate(item.createdAt),
    },
  ];

  const handleRowClick = (shipment: Shipment) => {
    router.push(`/shipments/${shipment.id}`);
  };

  const handleExportCSV = () => {
    const headers = ['Tracking Number', 'Sender', 'Receiver', 'Status', 'Service Type', 'Created At'];
    const rows = filteredShipments.map(s => [
      s.trackingNumber,
      s.senderName,
      s.receiverName,
      s.status,
      s.serviceType,
      formatDate(s.createdAt),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Shipments exported successfully');
  };

  return (
    <PageWrapper
      title="Shipments"
      description="Manage and track all shipments"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          )}
        </div>
      }
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by tracking number, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusFilter !== 'all' && (
                <Button variant="ghost" size="icon" onClick={() => setStatusFilter('all')}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      {loading ? (
        <SkeletonLoader variant="table" count={10} />
      ) : (
        <DataTable
          data={filteredShipments}
          columns={columns}
          onRowClick={handleRowClick}
          emptyMessage="No shipments found"
        />
      )}

      {/* Create Shipment Modal */}
      <CreateShipmentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadShipments();
        }}
      />
    </PageWrapper>
  );
}

interface CreateShipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateShipmentModal({ open, onClose, onSuccess }: CreateShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    pickupAddress: '',
    deliveryAddress: '',
    packageWeight: '',
    packageDimensions: '',
    packageType: 'Box',
    serviceType: 'Standard' as 'Express' | 'Standard' | 'Freight',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createShipment({
        ...formData,
        packageWeight: parseFloat(formData.packageWeight) || 0,
        trackingNumber: generateTrackingId(),
      });
      toast.success('Shipment created successfully');
      onSuccess();
    } catch {
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new shipment order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Sender Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Name</Label>
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Phone</Label>
                <Input
                  id="senderPhone"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Textarea
                id="pickupAddress"
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Receiver Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Receiver Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Name</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Phone</Label>
                <Input
                  id="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Package Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Package Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageWeight">Weight (kg)</Label>
                <Input
                  id="packageWeight"
                  type="number"
                  value={formData.packageWeight}
                  onChange={(e) => setFormData({ ...formData, packageWeight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packageDimensions">Dimensions (LxWxH cm)</Label>
                <Input
                  id="packageDimensions"
                  placeholder="30x20x15"
                  value={formData.packageDimensions}
                  onChange={(e) => setFormData({ ...formData, packageDimensions: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(v) => setFormData({ ...formData, serviceType: v as typeof formData.serviceType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Freight">Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Shipment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
