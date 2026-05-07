"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  Calendar,
  Weight,
  Ruler,
  Edit,
  CheckCircle,
} from 'lucide-react';
import { getShipmentById, updateShipmentStatus } from '@/services/shipmentService';
import { type Shipment, type ShipmentStatus } from '@/data/mockData';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const statusOptions: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { hasPermission } = useAuth();

  const canEdit = hasPermission('shipments', 'edit');

  useEffect(() => {
    loadShipment();
  }, [params.id]);

  const loadShipment = async () => {
    setLoading(true);
    try {
      const data = await getShipmentById(params.id as string);
      setShipment(data);
    } catch {
      toast.error('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Shipment Details">
        <SkeletonLoader variant="card" count={3} />
      </PageWrapper>
    );
  }

  if (!shipment) {
    return (
      <PageWrapper title="Shipment Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">The shipment you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push('/shipments')}>
            Back to Shipments
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={shipment.trackingNumber}
      description="Shipment details and tracking history"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/shipments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {canEdit && (
            <Button onClick={() => setShowStatusModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{shipment.trackingNumber}</h2>
                    <p className="text-muted-foreground">{shipment.serviceType} Delivery</p>
                  </div>
                </div>
                <StatusBadge status={shipment.status} className="text-sm px-4 py-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Sender & Receiver */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sender Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.senderName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.senderPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.senderEmail}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{shipment.pickupAddress}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receiver Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.receiverName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.receiverPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{shipment.receiverEmail}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{shipment.deliveryAddress}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Weight className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{shipment.packageWeight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="font-medium">{shipment.packageDimensions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{shipment.packageType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{shipment.serviceType}</p>
                  </div>
                </div>
              </div>
              {shipment.notes && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{shipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking Timeline</CardTitle>
              <CardDescription>Shipment progress history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {shipment.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      {index < shipment.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp, 'datetime')}
                      </p>
                      {event.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created</span>
                </div>
                <span className="text-sm font-medium">{formatDate(shipment.createdAt, 'datetime')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Est. Delivery</span>
                </div>
                <span className="text-sm font-medium">{formatDate(shipment.estimatedDelivery)}</span>
              </div>
              {shipment.actualDelivery && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Delivered</span>
                  </div>
                  <span className="text-sm font-medium">{formatDate(shipment.actualDelivery, 'datetime')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        shipment={shipment}
        onSuccess={() => {
          setShowStatusModal(false);
          loadShipment();
        }}
      />
    </PageWrapper>
  );
}

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment;
  onSuccess: () => void;
}

function UpdateStatusModal({ open, onClose, shipment, onSuccess }: UpdateStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(shipment.status);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateShipmentStatus(shipment.id, status, notes);
      toast.success('Status updated successfully');
      onSuccess();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
          <DialogDescription>
            Change the status of shipment {shipment.trackingNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <StatusBadge status={shipment.status} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStatus">New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || status === shipment.status}>
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
