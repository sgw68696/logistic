"use client";

import { useEffect, useState } from 'react';
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
import { Plus, Download, X, ShoppingCart, Eye } from 'lucide-react';
import { getOrders, createOrder, updateOrder } from '@/services/orderService';
import { type Order, type OrderStatus, type PaymentStatus, mockCustomers } from '@/data/mockData';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const orderStatusOptions: OrderStatus[] = ['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Returned'];
const paymentStatusOptions: PaymentStatus[] = ['Pending', 'Paid', 'Partial', 'Refunded'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('orders', 'create');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter as OrderStatus } : undefined;
      const data = await getOrders(filters);
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(o =>
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-primary">{item.orderId}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'items',
      header: 'Items',
      render: (item) => (
        <span className="text-sm">{item.items.length} item(s)</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      sortable: true,
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (item) => <StatusBadge status={item.paymentStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedOrder(item); }}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment Status', 'Created At'];
    const rows = filteredOrders.map(o => [
      o.orderId,
      o.customerName,
      o.items.length,
      formatCurrency(o.totalAmount),
      o.status,
      o.paymentStatus,
      formatDate(o.createdAt),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported successfully');
  };

  return (
    <PageWrapper
      title="Orders"
      description="Manage customer orders"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
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
                placeholder="Search by order ID or customer..."
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
                  {orderStatusOptions.map(status => (
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

      {/* Orders Table */}
      {loading ? (
        <SkeletonLoader variant="table" count={10} />
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          emptyMessage="No orders found"
        />
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadOrders();
        }}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
      />
    </PageWrapper>
  );
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateOrderModal({ open, onClose, onSuccess }: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    items: [{ name: '', quantity: 1, price: 0 }],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customer = mockCustomers.find(c => c.id === formData.customerId);
      await createOrder({
        customerId: formData.customerId,
        customerName: customer?.name || formData.customerName,
        items: formData.items.filter(item => item.name),
        totalAmount,
      });
      toast.success('Order created successfully');
      onSuccess();
    } catch {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new customer order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={(v) => {
                const customer = mockCustomers.find(c => c.id === v);
                setFormData({ ...formData, customerId: v, customerName: customer?.name || '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-28"
                />
                {formData.items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span className="font-medium">Total Amount</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.customerId}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdate: () => void;
}

function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order?.status || 'Draft');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'Pending');
  const { hasPermission } = useAuth();

  const canEdit = hasPermission('orders', 'edit');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;
    setLoading(true);

    try {
      await updateOrder(order.id, { status, paymentStatus });
      toast.success('Order updated successfully');
      onUpdate();
    } catch {
      toast.error('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {order.orderId}
          </DialogTitle>
          <DialogDescription>
            Order details for {order.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Items</Label>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span>{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>

          {canEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Created on {formatDate(order.createdAt, 'datetime')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canEdit && (
            <Button
              onClick={handleUpdate}
              disabled={loading || (status === order.status && paymentStatus === order.paymentStatus)}
            >
              {loading ? 'Updating...' : 'Update Order'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
