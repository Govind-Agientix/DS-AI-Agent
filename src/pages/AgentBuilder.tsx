import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { agentConfigSchema, type AgentConfigFormData } from "@/lib/agent/schema";
import {
  AGENT_DOCUMENT_TYPES,
  AGENT_EVANS_OFFICES,
  AGENT_SERVICE_TYPES,
  CUSTOMERS,
  LOAD_TYPES,
} from "@/lib/agent/types";
import {
  createAgent,
  deleteAgent,
  getAgent,
  getAgentCategories,
  getAgentMemory,
  listAgents,
  toCreateAgentBody,
  type AgentDetailResponse,
} from "@/lib/agent/clients/agentClient";
import type { AgentCategory } from "@/lib/agent/categoryTypes";
import { normalizeAgentsList } from "@/lib/agent/listUtils";
import { getApiErrorMessage } from "@/auth/authApi";
import { AgentConnectDialog } from "@/components/agent/AgentConnectDialog";
import { AgentDetailDialog } from "@/components/agent/AgentDetailDialog";
import { AgentMemoryDialog } from "@/components/agent/AgentMemoryDialog";
import { Save, Loader2, RefreshCw, Plug, Brain, Trash2, Eye } from "lucide-react";

const STORAGE_KEY = "agent-builder-data";

const defaultForm: AgentConfigFormData = {
  name: "",
  customer: "",
  documentType: "",
  office: "",
  serviceType: "",
  loadType: "",
  instructions: "",
};

interface AgentActionTarget {
  id: string;
  name?: string;
}

export default function AgentBuilder() {
  const { toast } = useToast();
  const [agentsPayload, setAgentsPayload] = useState<unknown>(null);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [connectTarget, setConnectTarget] = useState<AgentActionTarget | null>(null);
  const [memoryTarget, setMemoryTarget] = useState<AgentActionTarget | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [memoryPayload, setMemoryPayload] = useState<unknown>(null);

  const [detailTarget, setDetailTarget] = useState<AgentActionTarget | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailPayload, setDetailPayload] = useState<AgentDetailResponse | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AgentActionTarget | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const refreshAgents = useCallback(async () => {
    setAgentsLoading(true);
    setAgentsError(null);
    try {
      const data = await listAgents();
      setAgentsPayload(data);
    } catch (err) {
      setAgentsError(getApiErrorMessage(err, "Could not load agents."));
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await getAgentCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategoriesError(getApiErrorMessage(err, "Could not load agent categories."));
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const form = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: defaultForm,
    mode: "onChange",
  });

  useEffect(() => {
    void refreshAgents();
    void refreshCategories();
  }, [refreshAgents, refreshCategories]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as Partial<AgentConfigFormData>;
      const merged = { ...defaultForm, ...data };
      if ("documentTypes" in data || "outputSchema" in data) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      form.reset(merged);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const openDetail = useCallback(async (target: AgentActionTarget) => {
    setDetailTarget(target);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailPayload(null);
    try {
      const data = await getAgent(target.id);
      setDetailPayload(data);
    } catch (e) {
      setDetailError(getApiErrorMessage(e, "Could not load agent details."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openMemory = useCallback(
    async (target: AgentActionTarget) => {
      setMemoryTarget(target);
      setMemoryOpen(true);
      setMemoryLoading(true);
      setMemoryError(null);
      setMemoryPayload(null);
      try {
        const data = await getAgentMemory(target.id);
        setMemoryPayload(data);
      } catch (e) {
        setMemoryError(getApiErrorMessage(e, "Could not load memory."));
      } finally {
        setMemoryLoading(false);
      }
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await deleteAgent(deleteTarget.id);
      toast({
        title: "Agent deleted",
        description: deleteTarget.name
          ? `"${deleteTarget.name}" was removed.`
          : "The agent was removed.",
      });
      setDeleteTarget(null);
      await refreshAgents();
    } catch (e) {
      toast({
        title: "Delete failed",
        description: getApiErrorMessage(e, "Could not delete agent."),
        variant: "destructive",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  }, [deleteTarget, refreshAgents, toast]);

  const onSubmit = async (data: AgentConfigFormData) => {
    try {
      const body = toCreateAgentBody(data);
      await createAgent(body);
      localStorage.removeItem(STORAGE_KEY);
      form.reset(defaultForm);
      toast({
        title: "Success!",
        description: `Agent "${data.name}" was created.`,
      });
      await refreshAgents();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to create agent."),
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const agentRows = agentsPayload != null ? normalizeAgentsList(agentsPayload) : [];

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Agent Builder</h1>
        <p className="text-muted-foreground">
          Create agents, browse categories (schema explorer), connect with a typed{" "}
          <code className="text-xs">config</code>, inspect memory, or delete an agent. API base:{" "}
          <code className="text-xs">GET/POST/DELETE /api/v1/agents/…</code>
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Schema explorer</CardTitle>
            <CardDescription>
              GET /api/v1/agents/categories — drives the Connect dialog fields.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshCategories()}
            disabled={categoriesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${categoriesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {categoriesLoading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories…
            </p>
          )}
          {!categoriesLoading && categoriesError && (
            <p className="text-sm text-destructive">{categoriesError}</p>
          )}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories returned.</p>
          )}
          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              {categories.map((c) => (
                <li key={c.type}>
                  <span className="font-medium text-foreground">{c.title}</span>{" "}
                  <code className="text-xs">({c.type})</code>
                  {c.required?.length ? (
                    <span className="text-xs"> — required: {c.required.join(", ")}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Your agents</CardTitle>
            <CardDescription>GET /api/v1/agents — delete, connect, or view memory per row.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshAgents()}
            disabled={agentsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${agentsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {agentsLoading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading agents…
            </p>
          )}
          {!agentsLoading && agentsError && <p className="text-sm text-destructive">{agentsError}</p>}
          {!agentsLoading && !agentsError && agentRows.length === 0 && (
            <p className="text-sm text-muted-foreground">No agents found (empty list or unrecognized shape).</p>
          )}
          {!agentsLoading && !agentsError && agentRows.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Id</TableHead>
                    <TableHead className="text-right min-w-[280px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void openDetail({ id: row.id, name: row.name })}
                          >
                            <Eye className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={categories.length === 0}
                            onClick={() => setConnectTarget({ id: row.id, name: row.name })}
                            title={categories.length === 0 ? "Load categories first" : "Connect"}
                          >
                            <Plug className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Connect</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void openMemory({ id: row.id, name: row.name })}
                          >
                            <Brain className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Memory</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
                          >
                            <Trash2 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!agentsLoading && !agentsError && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Raw list response
              </summary>
              <pre className="mt-2 bg-muted/50 rounded-md p-4 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                {JSON.stringify(agentsPayload, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      <AgentConnectDialog
        open={connectTarget != null}
        onOpenChange={(o) => {
          if (!o) setConnectTarget(null);
        }}
        agentId={connectTarget?.id ?? ""}
        agentLabel={connectTarget?.name}
        categories={categories}
        onConnected={() => {
          toast({ title: "Connected", description: "Connect request completed." });
          void refreshAgents();
        }}
      />

      <AgentDetailDialog
        open={detailOpen}
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) {
            setDetailTarget(null);
            setDetailPayload(null);
            setDetailError(null);
          }
        }}
        agentId={detailTarget?.id ?? ""}
        agentLabel={detailTarget?.name}
        loading={detailLoading}
        error={detailError}
        detail={detailPayload}
      />

      <AgentMemoryDialog
        open={memoryOpen}
        onOpenChange={(o) => {
          setMemoryOpen(o);
          if (!o) {
            setMemoryTarget(null);
            setMemoryPayload(null);
            setMemoryError(null);
          }
        }}
        agentId={memoryTarget?.id ?? ""}
        agentLabel={memoryTarget?.name}
        loading={memoryLoading}
        error={memoryError}
        payload={memoryPayload}
      />

      <AlertDialog open={deleteTarget != null} onOpenChange={(o) => !o && !deleteSubmitting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This calls <code className="text-xs">DELETE /api/v1/agents/…</code> with no body. This cannot be undone
              on the server.
              {deleteTarget?.name ? (
                <>
                  <br />
                  <span className="font-medium text-foreground">{deleteTarget.name}</span>
                </>
              ) : null}
              <br />
              <span className="font-mono text-xs break-all">{deleteTarget?.id}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSubmitting}
              onClick={() => void confirmDelete()}
            >
              {deleteSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-card max-w-3xl">
            <CardHeader>
              <CardTitle>New agent</CardTitle>
              <CardDescription>
                agent_name, customer, document_type, evans_office_location, service_type, load_type,
                instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Email Reader" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUSTOMERS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
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
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGENT_DOCUMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="office"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evans office location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select office" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGENT_EVANS_OFFICES.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
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
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGENT_SERVICE_TYPES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
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
                  name="loadType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Load type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select load" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOAD_TYPES.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Check unread emails every 10 min."
                        className="min-h-[140px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sent as <code className="text-xs">instructions</code> in the request body.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2 max-w-3xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(defaultForm)}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create agent
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
