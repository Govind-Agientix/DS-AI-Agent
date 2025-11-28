import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Workflow,
  WorkflowStep,
  WORKFLOW_STATUSES,
  TRIGGER_TYPES,
  STEP_TYPES,
  DOCUMENT_TYPES,
  CUSTOMERS,
} from "@/lib/workflow/types";
import { workflowSchema, type WorkflowFormData } from "@/lib/workflow/schema";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => Promise<void>;
  workflow?: Workflow;
}

export function WorkflowDialog({ open, onClose, onSubmit, workflow }: WorkflowDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      customer: undefined,
      trigger: {
        type: "document_upload",
        config: {},
      },
      steps: [],
    },
  });

  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description || "",
        status: workflow.status,
        customer: workflow.customer || undefined,
        trigger: workflow.trigger,
        steps: workflow.steps,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        status: "draft",
        customer: undefined,
        trigger: {
          type: "document_upload",
          config: {},
        },
        steps: [],
      });
    }
  }, [workflow, open, form]);

  const handleSubmit = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerType = form.watch("trigger.type");
  const steps = form.watch("steps") || [];

  const addStep = () => {
    const currentSteps = form.getValues("steps") || [];
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: "extract_data",
      name: `Step ${currentSteps.length + 1}`,
      config: {},
      order: currentSteps.length + 1,
      enabled: true,
    };
    form.setValue("steps", [...currentSteps, newStep], { shouldValidate: true });
  };

  const removeStep = (index: number) => {
    const currentSteps = form.getValues("steps") || [];
    const newSteps = currentSteps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    form.setValue("steps", newSteps, { shouldValidate: true });
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const currentSteps = form.getValues("steps") || [];
    const newSteps = [...currentSteps];
    newSteps[index] = { ...newSteps[index], ...updates };
    form.setValue("steps", newSteps, { shouldValidate: true });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const currentSteps = form.getValues("steps") || [];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === currentSteps.length - 1)
    ) {
      return;
    }
    const newSteps = [...currentSteps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    form.setValue("steps", newSteps, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workflow ? "Edit Workflow" : "Create Workflow"}</DialogTitle>
          <DialogDescription>
            {workflow
              ? "Update workflow configuration and steps"
              : "Build a new automation workflow with triggers and steps"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="trigger">Trigger</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Auto Process Trip Sheets" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for this workflow</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this workflow does..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WORKFLOW_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {CUSTOMERS.map((customer) => (
                              <SelectItem key={customer.value} value={customer.value}>
                                {customer.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="trigger" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="trigger.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRIGGER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>When should this workflow run?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {triggerType === "document_upload" && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="trigger.config.documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOCUMENT_TYPES.map((type) => (
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
                  </div>
                )}

                {triggerType === "schedule" && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="trigger.config.schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cron Expression</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0 8 * * * (Daily at 8 AM)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Cron expression for scheduling (e.g., "0 8 * * *" for daily at 8 AM)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {triggerType === "webhook" && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="trigger.config.webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://api.example.com/webhooks/orders"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {(triggerType === "order_created" || triggerType === "order_updated") && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This workflow will trigger automatically when an order is{" "}
                      {triggerType === "order_created" ? "created" : "updated"}.
                    </p>
                  </div>
                )}

                {triggerType === "manual" && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This workflow can only be triggered manually from the workflows page.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="steps" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">Workflow Steps</h4>
                    <p className="text-xs text-muted-foreground">
                      Define the sequence of actions for this workflow
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {steps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <p>No steps added yet. Click "Add Step" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="p-4 border rounded-lg space-y-3 bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">Step {step.order}</Badge>
                            <div className="flex-1">
                              <Input
                                value={step.name}
                                onChange={(e) =>
                                  updateStep(index, { name: e.target.value })
                                }
                                placeholder="Step name"
                                className="max-w-xs"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={step.enabled}
                              onCheckedChange={(checked) =>
                                updateStep(index, { enabled: checked })
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            value={step.type}
                            onValueChange={(value) =>
                              updateStep(index, { type: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STEP_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveStep(index, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveStep(index, "down")}
                              disabled={index === steps.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>

                        {step.type === "ai_process" && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Agent ID (optional)"
                              value={step.config.agentId || ""}
                              onChange={(e) =>
                                updateStep(index, {
                                  config: { ...step.config, agentId: e.target.value },
                                })
                              }
                            />
                            <Input
                              placeholder="Prompt ID (optional)"
                              value={step.config.promptId || ""}
                              onChange={(e) =>
                                updateStep(index, {
                                  config: { ...step.config, promptId: e.target.value },
                                })
                              }
                            />
                          </div>
                        )}

                        {step.type === "notify" && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Recipients (comma-separated emails)"
                              value={step.config.recipients?.join(", ") || ""}
                              onChange={(e) =>
                                updateStep(index, {
                                  config: {
                                    ...step.config,
                                    recipients: e.target.value
                                      .split(",")
                                      .map((r) => r.trim())
                                      .filter(Boolean),
                                  },
                                })
                              }
                            />
                            <Textarea
                              placeholder="Notification message"
                              value={step.config.message || ""}
                              onChange={(e) =>
                                updateStep(index, {
                                  config: { ...step.config, message: e.target.value },
                                })
                              }
                            />
                          </div>
                        )}

                        {step.type === "submit" && (
                          <Input
                            type="url"
                            placeholder="Endpoint URL"
                            value={step.config.endpoint || ""}
                            onChange={(e) =>
                              updateStep(index, {
                                config: { ...step.config, endpoint: e.target.value },
                              })
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : workflow ? "Update Workflow" : "Create Workflow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

