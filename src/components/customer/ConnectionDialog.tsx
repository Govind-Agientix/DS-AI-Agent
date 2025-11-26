import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Connection } from "@/lib/customer/types";
import { connectionSchema, type ConnectionFormData } from "@/lib/customer/schema";
import { CONNECTION_TYPES } from "@/lib/customer/types";
import { Loader2 } from "lucide-react";

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ConnectionFormData) => void;
  connection?: Connection | null;
}

export function ConnectionDialog({
  open,
  onClose,
  onSubmit,
  connection,
}: ConnectionDialogProps) {
  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      type: "database",
      host: "",
      port: undefined,
      database: "",
      username: "",
      description: "",
      isActive: true,
      sslEnabled: false,
      timeout: undefined,
      retryAttempts: undefined,
    },
  });

  useEffect(() => {
    if (connection && open) {
      form.reset({
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database || "",
        username: connection.username || "",
        description: connection.description || "",
        isActive: connection.isActive,
        sslEnabled: connection.sslEnabled ?? false,
        timeout: connection.timeout,
        retryAttempts: connection.retryAttempts,
      });
    } else if (open) {
      form.reset({
        name: "",
        type: "database",
        host: "",
        port: undefined,
        database: "",
        username: "",
        description: "",
        isActive: true,
        sslEnabled: false,
        timeout: undefined,
        retryAttempts: undefined,
      });
    }
  }, [connection, open, form]);

  const handleSubmit = (data: ConnectionFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isSubmitting = form.formState.isSubmitting;
  const connectionType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {connection ? "Edit Connection" : "Add Connection"}
          </DialogTitle>
          <DialogDescription>
            Configure database, API, FTP, or other connection settings for this customer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production Database" {...field} />
                    </FormControl>
                    <FormDescription>A descriptive name for this connection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONNECTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host / Server *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          connectionType === "database"
                            ? "db.example.com"
                            : connectionType === "api"
                              ? "api.example.com"
                              : "ftp.example.com"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Hostname or IP address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          connectionType === "database"
                            ? "5432"
                            : connectionType === "ftp" || connectionType === "sftp"
                              ? "21"
                              : "80"
                        }
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Port number (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(connectionType === "database" || connectionType === "ftp" || connectionType === "sftp") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectionType === "database" && (
                  <FormField
                    control={form.control}
                    name="database"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Database Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., customer_db" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Database name (for database connections)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Connection username" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        {connectionType === "database"
                          ? "Database username"
                          : "FTP/SFTP username"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or description about this connection..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Connection timeout in seconds</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retryAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retry Attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Number of retry attempts on failure</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this connection. Inactive connections will not be used.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {(connectionType === "database" || connectionType === "ftp" || connectionType === "sftp") && (
                <FormField
                  control={form.control}
                  name="sslEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>SSL/TLS Enabled</FormLabel>
                        <FormDescription>
                          Enable secure connection using SSL/TLS encryption
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Password and sensitive credentials should be configured
                separately through the secure credentials management system.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{connection ? "Update Connection" : "Add Connection"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

