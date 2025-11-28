import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  Play,
  MoreVertical,
  X,
  FileText,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Order type definition
interface Order {
  id: string;
  orderId: string;
  customer: string;
  documentType: string;
  status: "pending" | "processing" | "completed" | "failed" | "draft";
  agent: string;
  createdAt: string;
  updatedAt: string;
  documentUrl?: string;
  extractedData?: Record<string, any>;
  error?: string;
  progress?: number;
}

// Validation schemas
const uploadDocumentSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "Please select a file")
    .refine((file) => file instanceof File && file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) =>
        file instanceof File &&
        [".pdf", ".doc", ".docx", ".txt"].some((ext) => file.name.toLowerCase().endsWith(ext)),
      "Only PDF, DOC, DOCX, and TXT files are allowed"
    ),
  customer: z.string().min(1, "Customer is required"),
  documentType: z.string().min(1, "Document type is required"),
});

const createOrderSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  documentType: z.string().min(1, "Document type is required"),
  agent: z.string().min(1, "Agent is required").min(2, "Agent name must be at least 2 characters"),
  notes: z.string().optional(),
});

const editOrderSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  documentType: z.string().min(1, "Document type is required"),
  agent: z.string().min(1, "Agent is required").min(2, "Agent name must be at least 2 characters"),
});

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;
type CreateOrderFormData = z.infer<typeof createOrderSchema>;
type EditOrderFormData = z.infer<typeof editOrderSchema>;

// Dummy data
const generateDummyOrders = (): Order[] => {
  const statuses: Order["status"][] = ["pending", "processing", "completed", "failed", "draft"];
  const customers = ["Traffix", "IMC", "ARC Logistics", "MSC", "Evans", "Crowley"];
  const documentTypes = ["Booking Confirmation", "Work Order", "Delivery Order", "Trip Sheet", "Customs Release"];
  const agents = ["Traffix Processor", "Port Monitor", "Global Terminal", "Customs Handler", "Document Processor"];

  return Array.from({ length: 25 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    return {
      id: `order-${i + 1}`,
      orderId: `ORD-2024-${String(i + 1).padStart(3, "0")}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      documentType: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      status,
      agent: agents[Math.floor(Math.random() * agents.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      documentUrl: `https://example.com/documents/${i + 1}.pdf`,
      extractedData: status === "completed" ? {
        orderNumber: `ORD-${i + 1}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        date: createdAt.toLocaleDateString(),
        amount: `$${(Math.random() * 10000).toFixed(2)}`,
      } : undefined,
      error: status === "failed" ? "Failed to extract data from document" : undefined,
      progress: status === "processing" ? Math.floor(Math.random() * 100) : undefined,
    };
  });
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [orders] = useState<Order[]>(generateDummyOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { toast } = useToast();

  // Upload form
  const uploadForm = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      customer: "",
      documentType: "",
    },
  });

  // Create form
  const createForm = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customer: "",
      documentType: "",
      agent: "",
      notes: "",
    },
  });

  // Edit form
  const editForm = useForm<EditOrderFormData>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      customer: "",
      documentType: "",
      agent: "",
    },
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || order.customer === customerFilter;
    const matchesDocumentType = documentTypeFilter === "all" || order.documentType === documentTypeFilter;
    return matchesSearch && matchesStatus && matchesCustomer && matchesDocumentType;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  // Get unique values for filters
  const uniqueCustomers = Array.from(new Set(orders.map((o) => o.customer))).sort();
  const uniqueDocumentTypes = Array.from(new Set(orders.map((o) => o.documentType))).sort();

  // Reset forms when dialogs open/close
  useEffect(() => {
    if (!uploadDialogOpen) {
      uploadForm.reset();
      setUploadedFile(null);
    }
  }, [uploadDialogOpen, uploadForm]);

  useEffect(() => {
    if (!createDialogOpen) {
      createForm.reset();
    }
  }, [createDialogOpen, createForm]);

  useEffect(() => {
    if (editOrder) {
      editForm.reset({
        customer: editOrder.customer,
        documentType: editOrder.documentType,
        agent: editOrder.agent,
      });
    } else {
      editForm.reset();
    }
  }, [editOrder, editForm]);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Processing</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Failed</Badge>;
      case "draft":
        return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleView = (order: Order) => {
    setViewOrder(order);
  };

  const handleEdit = (order: Order) => {
    setEditOrder(order);
  };

  const handleSaveEdit = (data: EditOrderFormData) => {
    if (!editOrder) return;
    toast({
      title: "Success!",
      description: `Order ${editOrder.orderId} updated successfully`,
    });
    setEditOrder(null);
    editForm.reset();
  };

  const handleDelete = () => {
    if (!deleteOrder) return;
    toast({
      title: "Success!",
      description: `Order ${deleteOrder.orderId} deleted successfully`,
    });
    setDeleteOrder(null);
  };

  const handleProcess = (order: Order) => {
    toast({
      title: "Processing started",
      description: `Order ${order.orderId} is being processed`,
    });
  };

  const handleUpload = (data: UploadDocumentFormData) => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Upload successful",
      description: "Document uploaded and order created",
    });
    setUploadDialogOpen(false);
    uploadForm.reset();
    setUploadedFile(null);
  };

  const handleCreate = (data: CreateOrderFormData) => {
    toast({
      title: "Order created",
      description: "New order has been created successfully",
    });
    setCreateDialogOpen(false);
    createForm.reset();
  };

  const handleDownload = (order: Order) => {
    toast({
      title: "Download started",
      description: `Downloading document for ${order.orderId}`,
    });
  };

  const handleRetry = (order: Order) => {
    toast({
      title: "Retry initiated",
      description: `Retrying processing for ${order.orderId}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Process, validate, and submit logistics orders
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          <Button
            className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or document type..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {uniqueCustomers.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueDocumentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No orders found</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {order.documentType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {order.progress !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {order.progress}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.agent}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(order)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcess(order)}
                              className="h-8"
                            >
                              <Play className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {order.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetry(order)}
                              className="h-8"
                            >
                              <RefreshCw className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(order)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </DropdownMenuItem>
                              {order.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleProcess(order)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Process Order
                                </DropdownMenuItem>
                              )}
                              {order.status === "failed" && (
                                <DropdownMenuItem onClick={() => handleRetry(order)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Retry Processing
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteOrder(order)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewOrder?.orderId}</DialogTitle>
            <DialogDescription>
              Order details and extracted data
            </DialogDescription>
          </DialogHeader>
          {viewOrder && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                <TabsTrigger value="document">Document</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Order ID:</span>{" "}
                        <span className="font-medium">{viewOrder.orderId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Customer:</span>{" "}
                        <span className="font-medium">{viewOrder.customer}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Document Type:</span>{" "}
                        <span className="font-medium">{viewOrder.documentType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {getStatusBadge(viewOrder.status)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Agent:</span>{" "}
                        <span className="font-medium">{viewOrder.agent}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Timestamps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {formatDate(viewOrder.createdAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>{" "}
                        {formatDate(viewOrder.updatedAt)}
                      </div>
                      {viewOrder.progress !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Progress:</span>{" "}
                          <span className="font-medium">{viewOrder.progress}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {viewOrder.error && (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-sm text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-destructive">{viewOrder.error}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="extracted" className="mt-4">
                {viewOrder.extractedData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Extracted Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(viewOrder.extractedData).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b last:border-0">
                            <span className="text-sm font-medium text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-sm">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No extracted data available
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="document" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Document URL</Label>
                        <p className="text-sm text-muted-foreground mt-1 break-all">
                          {viewOrder.documentUrl || "No document URL available"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(viewOrder)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOrder(null)}>
              Close
            </Button>
            {viewOrder && (
              <>
                <Button variant="outline" onClick={() => handleEdit(viewOrder)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {viewOrder.status === "pending" && (
                  <Button onClick={() => handleProcess(viewOrder)}>
                    <Play className="h-4 w-4 mr-2" />
                    Process
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update order information for {editOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueCustomers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueDocumentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agent name" {...field} />
                    </FormControl>
                    <FormDescription>Agent name must be at least 2 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOrder(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to create a new order. Maximum file size: 10MB
            </DialogDescription>
          </DialogHeader>
          <Form {...uploadForm}>
            <form onSubmit={uploadForm.handleSubmit(handleUpload)} className="space-y-4">
              <FormField
                control={uploadForm.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Select Document *</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            onChange(file);
                            // Trigger validation
                            uploadForm.trigger("file");
                          } else {
                            onChange(undefined);
                            setUploadedFile(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={uploadForm.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueCustomers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={uploadForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueDocumentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    uploadForm.reset();
                    setUploadedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Create a new order manually
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueCustomers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueDocumentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agent name" {...field} />
                    </FormControl>
                    <FormDescription>Agent name must be at least 2 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteOrder?.orderId}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrder(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
