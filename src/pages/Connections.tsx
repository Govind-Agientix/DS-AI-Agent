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
  Search,
  Plus,
  Edit,
  MoreVertical,
  X,
  Database,
  Globe,
  Server,
  Activity,
  TestTube,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Plug,
  PlugZap,
} from "lucide-react";
import { ConnectionDialog } from "@/components/customer/ConnectionDialog";
import { connectionsClient } from "@/lib/connections/clients/connectionsClient";
import { Connection, CONNECTION_TYPES, CONNECTION_STATUSES } from "@/lib/customer/types";
import { type ConnectionFormData } from "@/lib/customer/schema";
import { useToast } from "@/hooks/use-toast";

export default function Connections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [deleteConnection, setDeleteConnection] = useState<Connection | null>(null);
  const [testConnection, setTestConnection] = useState<Connection | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch connections with filters
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["connections", searchQuery, typeFilter, statusFilter, activeFilter],
    queryFn: () =>
      connectionsClient.list({
        search: searchQuery || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        isActive: activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ConnectionFormData) => connectionsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      setCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Connection created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create connection",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConnectionFormData> }) =>
      connectionsClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      setEditConnection(null);
      toast({
        title: "Success!",
        description: "Connection updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update connection",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectionsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      setDeleteConnection(null);
      toast({
        title: "Success!",
        description: "Connection deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete connection",
        variant: "destructive",
      });
    },
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: (id: string) => connectionsClient.test(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      setTestResult(result);
      toast({
        title: result.success ? "Connection Test Successful" : "Connection Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test Error",
        description: error.message || "Failed to test connection",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTesting(false);
    },
  });

  const handleCreate = async (data: ConnectionFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: ConnectionFormData) => {
    if (!editConnection) return;
    await updateMutation.mutateAsync({ id: editConnection.id, data });
  };

  const handleDelete = () => {
    if (!deleteConnection) return;
    deleteMutation.mutate(deleteConnection.id);
  };

  const handleTest = () => {
    if (!testConnection) return;
    setIsTesting(true);
    setTestResult(null);
    testMutation.mutate(testConnection.id);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400">
            <XCircle className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <HelpCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />;
      case "api":
        return <Globe className="h-4 w-4" />;
      case "ftp":
      case "sftp":
        return <Server className="h-4 w-4" />;
      case "websocket":
        return <PlugZap className="h-4 w-4" />;
      case "message_queue":
        return <Activity className="h-4 w-4" />;
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const stats = {
    total: connections.length,
    active: connections.filter((c) => c.isActive).length,
    connected: connections.filter((c) => c.connectionStatus === "connected").length,
    databases: connections.filter((c) => c.type === "database").length,
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Connections</h1>
          <p className="text-muted-foreground">
            Manage database connections, API endpoints, FTP servers, and other external integrations
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Connection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Plug className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{stats.connected}</p>
              </div>
              <PlugZap className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Databases</p>
                <p className="text-2xl font-bold">{stats.databases}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connections Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections by name, host, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CONNECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {CONNECTION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading connections...</div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No connections found</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Connection
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connection</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Last Tested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        {connection.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {connection.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(connection.type)}
                        <Badge variant="outline">
                          {CONNECTION_TYPES.find((t) => t.value === connection.type)?.label || connection.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{connection.host}</div>
                        {connection.port && (
                          <div className="text-xs text-muted-foreground">Port: {connection.port}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(connection.connectionStatus)}</TableCell>
                    <TableCell>
                      {connection.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {connection.lastTested ? (
                        <div className="text-sm text-muted-foreground">
                          {new Date(connection.lastTested).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTestConnection(connection);
                            setTestResult(null);
                          }}
                          title="Test Connection"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditConnection(connection)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setTestConnection(connection);
                                setTestResult(null);
                              }}
                            >
                              <TestTube className="h-4 w-4 mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConnection(connection)}
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
      <ConnectionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <ConnectionDialog
        open={!!editConnection}
        onClose={() => setEditConnection(null)}
        onSubmit={handleUpdate}
        connection={editConnection}
      />

      {/* Test Connection Dialog */}
      <Dialog open={!!testConnection} onOpenChange={() => {
        setTestConnection(null);
        setTestResult(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Connection</DialogTitle>
            <DialogDescription>
              Test the connection to "{testConnection?.name}" to verify connectivity and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {testResult ? (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {testResult.success ? "Test Successful" : "Test Failed"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{testResult.message}</p>
                {testResult.latency && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Response time: {testResult.latency}ms
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isTesting ? (
                  <div className="space-y-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p>Testing connection...</p>
                  </div>
                ) : (
                  <p>Click "Test Connection" to verify connectivity</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTestConnection(null);
              setTestResult(null);
            }}>
              Close
            </Button>
            <Button 
              onClick={handleTest} 
              disabled={isTesting}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConnection} onOpenChange={() => setDeleteConnection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConnection?.name}"? This action cannot be undone
              and will affect all systems using this connection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConnection(null)}>
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
