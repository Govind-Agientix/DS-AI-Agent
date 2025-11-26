import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Search,
  Plus,
  Edit,
  MoreVertical,
  X,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Settings,
} from "lucide-react";
import { CustomerConfigDialog } from "@/components/customer/CustomerConfigDialog";
import { customerClient } from "@/lib/customer/clients/customerClient";
import { Customer, type CustomerFormData } from "@/lib/customer/types";
import { CUSTOMER_STATUSES } from "@/lib/customer/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CustomerConfig() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch customers with filters
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", searchQuery, statusFilter],
    queryFn: () =>
      customerClient.list({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => customerClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Customer created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) =>
      customerClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditCustomer(null);
      toast({
        title: "Success!",
        description: "Customer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteCustomer(null);
      toast({
        title: "Success!",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleCreate = async (data: CustomerFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: CustomerFormData) => {
    if (!editCustomer) return;
    await updateMutation.mutateAsync({ id: editCustomer.id, data });
  };

  const handleDelete = () => {
    if (!deleteCustomer) return;
    deleteMutation.mutate(deleteCustomer.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "suspended":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calculate stats
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    totalOrders: customers.reduce((sum, c) => sum + (c.usageStats?.totalOrders || 0), 0),
    activeAgents: customers.reduce((sum, c) => sum + (c.usageStats?.activeAgents || 0), 0),
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Configuration</h1>
          <p className="text-muted-foreground">
            Manage customer-specific rules, billing policies, equipment aliases, and SOPs
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{stats.activeAgents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, code, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {CUSTOMER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No customers found</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Customer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing Policies</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {customer.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.billingPolicies?.length || 0} policies
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.rules?.filter((r) => r.isActive).length || 0} active
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.contacts?.length || 0} contacts
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {customer.usageStats?.totalOrders?.toLocaleString() || 0} orders
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.usageStats?.activeAgents || 0} agents
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewCustomer(customer)}
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditCustomer(customer)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/agents?customer=${customer.code}`)}>
                              <Settings className="h-4 w-4 mr-2" />
                              View Agents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteCustomer(customer)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
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
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CustomerConfigDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <CustomerConfigDialog
        open={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        onSubmit={handleUpdate}
        customer={editCustomer}
      />

      {/* View Dialog */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewCustomer?.name}</DialogTitle>
            <DialogDescription>{viewCustomer?.description}</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="billing">Billing Policies</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Customer Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Code:</span>{" "}
                        <Badge variant="outline">{viewCustomer.code}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge className={getStatusColor(viewCustomer.status)}>
                          {viewCustomer.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Default Office:</span>{" "}
                        {viewCustomer.defaultOffice || "None"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Service Type:</span>{" "}
                        {viewCustomer.defaultServiceType || "None"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Orders:</span>{" "}
                        {viewCustomer.usageStats?.totalOrders?.toLocaleString() || 0}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Successful:</span>{" "}
                        {viewCustomer.usageStats?.successfulOrders?.toLocaleString() || 0}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Active Agents:</span>{" "}
                        {viewCustomer.usageStats?.activeAgents || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-4">
                <div className="space-y-4">
                  {viewCustomer.billingPolicies?.length > 0 ? (
                    viewCustomer.billingPolicies.map((policy) => (
                      <Card key={policy.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{policy.name}</CardTitle>
                          <CardDescription>
                            <Badge variant="outline">{policy.category}</Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{policy.rules}</p>
                          {policy.rate && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Rate: ${policy.rate.amount} {policy.rate.unit}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No billing policies configured</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rules" className="mt-4">
                <div className="space-y-4">
                  {viewCustomer.rules?.filter((r) => r.isActive).length > 0 ? (
                    viewCustomer.rules
                      .filter((r) => r.isActive)
                      .map((rule) => (
                        <Card key={rule.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{rule.title}</CardTitle>
                                <CardDescription>
                                  <Badge variant="outline">{rule.category}</Badge>{" "}
                                  <Badge variant="secondary">{rule.priority} priority</Badge>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{rule.rule}</p>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No active rules configured</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="mt-4">
                <div className="space-y-4">
                  {viewCustomer.contacts?.length > 0 ? (
                    viewCustomer.contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                              {contact.phone && (
                                <p className="text-sm text-muted-foreground">{contact.phone}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{contact.role}</Badge>
                              {contact.isPrimary && (
                                <Badge className="ml-2 bg-primary/10 text-primary">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No contacts configured</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteCustomer?.name}"? This action cannot be undone
              and will affect all associated agents and configurations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCustomer(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}