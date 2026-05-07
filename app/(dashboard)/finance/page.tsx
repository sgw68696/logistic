"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { financeService, type Invoice, type Expense } from "@/services/financeService";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerId: "",
    orderId: "",
    amount: 0,
    tax: 0,
    dueDate: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: 0,
    vendor: "",
    date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [invoicesData, expensesData] = await Promise.all([
      financeService.getInvoices(),
      financeService.getExpenses(),
    ]);
    setInvoices(invoicesData);
    setExpenses(expensesData);
    setLoading(false);
  };

  const handleAddInvoice = async () => {
    await financeService.createInvoice({
      ...invoiceForm,
      invoiceNumber: `INV-${Date.now()}`,
      total: invoiceForm.amount + invoiceForm.tax,
      status: "Unpaid",
      issueDate: new Date().toISOString().split("T")[0],
    });
    setIsAddInvoiceOpen(false);
    setInvoiceForm({
      customerName: "",
      customerId: "",
      orderId: "",
      amount: 0,
      tax: 0,
      dueDate: "",
    });
    loadData();
  };

  const handleAddExpense = async () => {
    await financeService.createExpense({
      ...expenseForm,
      status: "Pending",
    });
    setIsAddExpenseOpen(false);
    setExpenseForm({
      category: "",
      description: "",
      amount: 0,
      vendor: "",
      date: "",
    });
    loadData();
  };

  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingRevenue = invoices
    .filter((i) => i.status === "Unpaid" || i.status === "Partial")
    .reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const invoiceColumns = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.orderId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "issueDate",
      label: "Issue Date",
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (value: string) => {
        const isOverdue =
          new Date(value) < new Date() &&
          invoices.find((i) => i.dueDate === value)?.status !== "Paid";
        return (
          <span className={isOverdue ? "font-medium text-red-600" : ""}>
            {formatDate(value)}
          </span>
        );
      },
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: Invoice) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => financeService.deleteInvoice(row.id).then(loadData)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const expenseColumns = [
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (value: string, row: Expense) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <Receipt className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-red-600">-{formatCurrency(value)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: Expense) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => financeService.deleteExpense(row.id).then(loadData)}
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
      <PageWrapper title="Finance" subtitle="Manage invoices and expenses">
        <SkeletonLoader type="table" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Finance"
      subtitle="Manage invoices, payments, and expenses"
      actions={
        <div className="flex gap-2">
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Receipt className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new expense.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) =>
                      setExpenseForm({ ...expenseForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fuel">Fuel</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Expense description"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={expenseForm.amount || ""}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="Vendor name"
                    value={expenseForm.vendor}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, vendor: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddExpenseOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a customer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={invoiceForm.customerName}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={invoiceForm.amount || ""}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tax">Tax</Label>
                    <Input
                      id="tax"
                      type="number"
                      placeholder="0"
                      value={invoiceForm.tax || ""}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          tax: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceForm.amount + invoiceForm.tax)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddInvoiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddInvoice}>Create Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(paidRevenue)}
                </p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(pendingRevenue)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="invoices">
              Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="expenses">
              Expenses ({expenses.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="w-[250px] pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {activeTab === "invoices" ? (
                  <>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="invoices">
          <DataTable
            data={filteredInvoices}
            columns={invoiceColumns}
            searchable={false}
            pageSize={10}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <DataTable
            data={filteredExpenses}
            columns={expenseColumns}
            searchable={false}
            pageSize={10}
          />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
