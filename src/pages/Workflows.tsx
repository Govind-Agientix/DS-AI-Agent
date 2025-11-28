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
  Play,
  PlayCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { WorkflowDialog } from "@/components/workflow/WorkflowDialog";
import { workflowClient } from "@/lib/workflow/clients/workflowClient";
import { Workflow, WORKFLOW_STATUSES, CUSTOMERS } from "@/lib/workflow/types";
import { type WorkflowFormData } from "@/lib/workflow/schema";
import { useToast } from "@/hooks/use-toast";

export default function Workflows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null);
  const [deleteWorkflow, setDeleteWorkflow] = useState<Workflow | null>(null);
  const [viewWorkflow, setViewWorkflow] = useState<Workflow | null>(null);
  const [runWorkflow, setRunWorkflow] = useState<Workflow | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch workflows with filters
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows", searchQuery, statusFilter, customerFilter],
    queryFn: () =>
      workflowClient.list({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        customer: customerFilter !== "all" ? customerFilter : undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: WorkflowFormData) => workflowClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Workflow created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowFormData> }) =>
      workflowClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setEditWorkflow(null);
      toast({
        title: "Success!",
        description: "Workflow updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setDeleteWorkflow(null);
      toast({
        title: "Success!",
        description: "Workflow deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workflow",
        variant: "destructive",
      });
    },
  });

  // Run mutation
  const runMutation = useMutation({
    mutationFn: (id: string) => workflowClient.run(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setRunWorkflow(null);
      toast({
        title: result.success ? "Success!" : "Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to run workflow",
        variant: "destructive",
      });
    },
  });

  const handleCreate = async (data: WorkflowFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: WorkflowFormData) => {
    if (!editWorkflow) return;
    await updateMutation.mutateAsync({ id: editWorkflow.id, data });
  };

  const handleDelete = () => {
    if (!deleteWorkflow) return;
    deleteMutation.mutate(deleteWorkflow.id);
  };

  const handleRun = () => {
    if (!runWorkflow) return;
    runMutation.mutate(runWorkflow.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "draft":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "archived":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTriggerLabel = (trigger: Workflow["trigger"]) => {
    switch (trigger.type) {
      case "document_upload":
        return `Document Upload${trigger.config.documentType ? `: ${trigger.config.documentType}` : ""}`;
      case "schedule":
        return `Scheduled${trigger.config.schedule ? `: ${trigger.config.schedule}` : ""}`;
      case "webhook":
        return "Webhook";
      case "manual":
        return "Manual";
      case "order_created":
        return "Order Created";
      case "order_updated":
        return "Order Updated";
      default:
        return trigger.type;
    }
  };

  // Calculate stats
  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.status === "active").length,
    totalRuns: workflows.reduce((sum, w) => sum + w.runCount, 0),
    successRate:
      workflows.reduce((sum, w) => sum + w.runCount, 0) > 0
        ? Math.round(
            (workflows.reduce((sum, w) => sum + w.successCount, 0) /
              workflows.reduce((sum, w) => sum + w.runCount, 0)) *
              100
          )
        : 0,
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Workflows & Automation</h1>
          <p className="text-muted-foreground">
            Build no-code automation workflows with triggers and steps
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{stats.totalRuns.toLocaleString()}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows by name or description..."
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
                {WORKFLOW_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {CUSTOMERS.map((customer) => (
                  <SelectItem key={customer.value} value={customer.value}>
                    {customer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No workflows found</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {workflow.description}
                          </div>
                        )}
                        {workflow.customer && (
                          <Badge variant="outline" className="mt-1">
                            {CUSTOMERS.find((c) => c.value === workflow.customer)?.label ||
                              workflow.customer}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge variant="secondary">{getTriggerLabel(workflow.trigger)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{workflow.runCount}</div>
                        <div className="text-xs text-muted-foreground">
                          {workflow.successCount} success, {workflow.failureCount} failed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {workflow.runCount > 0
                          ? Math.round((workflow.successCount / workflow.runCount) * 100)
                          : 0}
                        %
                      </div>
                    </TableCell>
                    <TableCell>
                      {workflow.lastRun ? (
                        <div className="text-sm text-muted-foreground">
                          {new Date(workflow.lastRun).toLocaleDateString()}
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
                          onClick={() => setViewWorkflow(workflow)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRunWorkflow(workflow)}
                          disabled={workflow.status !== "active"}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditWorkflow(workflow)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRunWorkflow(workflow)}
                              disabled={workflow.status !== "active"}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteWorkflow(workflow)}
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
      <WorkflowDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <WorkflowDialog
        open={!!editWorkflow}
        onClose={() => setEditWorkflow(null)}
        onSubmit={handleUpdate}
        workflow={editWorkflow || undefined}
      />

      {/* View Dialog */}
      <Dialog open={!!viewWorkflow} onOpenChange={() => setViewWorkflow(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewWorkflow?.name}</DialogTitle>
            <DialogDescription>{viewWorkflow?.description}</DialogDescription>
          </DialogHeader>
          {viewWorkflow && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trigger">Trigger</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Workflow Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge className={getStatusColor(viewWorkflow.status)}>
                          {viewWorkflow.status}
                        </Badge>
                      </div>
                      {viewWorkflow.customer && (
                        <div>
                          <span className="text-muted-foreground">Customer:</span>{" "}
                          {CUSTOMERS.find((c) => c.value === viewWorkflow.customer)?.label ||
                            viewWorkflow.customer}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {new Date(viewWorkflow.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>{" "}
                        {new Date(viewWorkflow.updatedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created By:</span>{" "}
                        {viewWorkflow.createdBy}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Runs:</span>{" "}
                        {viewWorkflow.runCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Successful:</span>{" "}
                        {viewWorkflow.successCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>{" "}
                        {viewWorkflow.failureCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>{" "}
                        {viewWorkflow.runCount > 0
                          ? Math.round((viewWorkflow.successCount / viewWorkflow.runCount) * 100)
                          : 0}
                        %
                      </div>
                      {viewWorkflow.lastRun && (
                        <div>
                          <span className="text-muted-foreground">Last Run:</span>{" "}
                          {new Date(viewWorkflow.lastRun).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trigger" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Trigger Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Type:</span>{" "}
                      <Badge variant="secondary">{getTriggerLabel(viewWorkflow.trigger)}</Badge>
                    </div>
                    {viewWorkflow.trigger.config.documentType && (
                      <div>
                        <span className="text-sm font-medium">Document Type:</span>{" "}
                        {viewWorkflow.trigger.config.documentType}
                      </div>
                    )}
                    {viewWorkflow.trigger.config.schedule && (
                      <div>
                        <span className="text-sm font-medium">Schedule:</span>{" "}
                        {viewWorkflow.trigger.config.schedule}
                      </div>
                    )}
                    {viewWorkflow.trigger.config.webhookUrl && (
                      <div>
                        <span className="text-sm font-medium">Webhook URL:</span>{" "}
                        <code className="text-xs bg-muted p-1 rounded">
                          {viewWorkflow.trigger.config.webhookUrl}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="steps" className="mt-4">
                <div className="space-y-3">
                  {viewWorkflow.steps.map((step, index) => (
                    <Card key={step.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Step {step.order}: {step.name}
                            </CardTitle>
                            <CardDescription>
                              <Badge variant="outline">{step.type}</Badge>
                              {!step.enabled && (
                                <Badge variant="secondary" className="ml-2">
                                  Disabled
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {step.config.agentId && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Agent ID:</span>{" "}
                            {step.config.agentId}
                          </div>
                        )}
                        {step.config.promptId && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Prompt ID:</span>{" "}
                            {step.config.promptId}
                          </div>
                        )}
                        {step.config.endpoint && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Endpoint:</span>{" "}
                            <code className="text-xs bg-muted p-1 rounded">
                              {step.config.endpoint}
                            </code>
                          </div>
                        )}
                        {step.config.recipients && step.config.recipients.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Recipients:</span>{" "}
                            {step.config.recipients.join(", ")}
                          </div>
                        )}
                        {step.config.message && (
                          <div className="text-sm mt-2">
                            <span className="text-muted-foreground">Message:</span>
                            <p className="mt-1">{step.config.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Run History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewWorkflow.runCount > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>
                            {viewWorkflow.successCount} successful run
                            {viewWorkflow.successCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>
                            {viewWorkflow.failureCount} failed run
                            {viewWorkflow.failureCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {viewWorkflow.lastRun && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                            <Clock className="h-4 w-4" />
                            <span>Last run: {new Date(viewWorkflow.lastRun).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No runs yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteWorkflow} onOpenChange={() => setDeleteWorkflow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteWorkflow?.name}"? This action cannot be undone
              and will stop all future executions of this workflow.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteWorkflow(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Confirmation Dialog */}
      <Dialog open={!!runWorkflow} onOpenChange={() => setRunWorkflow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Workflow</DialogTitle>
            <DialogDescription>
              Execute "{runWorkflow?.name}" now? This will trigger the workflow immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunWorkflow(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRun}
              disabled={runMutation.isPending}
            >
              {runMutation.isPending ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
