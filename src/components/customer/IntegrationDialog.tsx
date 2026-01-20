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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Integration } from "@/lib/customer/types";
import { integrationSchema, type IntegrationFormData } from "@/lib/customer/schema";
import { INTEGRATION_TYPES } from "@/lib/customer/types";
import { Loader2 } from "lucide-react";

interface IntegrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IntegrationFormData) => void;
  integration?: Integration | null;
}

export function IntegrationDialog({
  open,
  onClose,
  onSubmit,
  integration,
}: IntegrationDialogProps) {
  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      type: "api",
      name: "",
      endpoint: "",
      credentials: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (integration && open) {
      form.reset({
        type: integration.type,
        name: integration.name,
        endpoint: integration.endpoint || "",
        credentials: integration.credentials,
        isActive: integration.isActive,
      });
    } else if (open) {
      form.reset({
        type: "api",
        name: "",
        endpoint: "",
        credentials: undefined,
        isActive: true,
      });
    }
  }, [integration, open, form]);

  const handleSubmit = (data: IntegrationFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {integration ? "Edit Integration" : "Add Integration"}
          </DialogTitle>
          <DialogDescription>
            Configure API, EDI, email, FTP, or webhook integrations for this customer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 overflow-y-auto flex-1 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Crowley API" {...field} />
                    </FormControl>
                    <FormDescription>A descriptive name for this integration</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTEGRATION_TYPES.map((type) => (
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

            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://api.example.com/v1"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch("type") === "email"
                      ? "Email address for document delivery"
                      : form.watch("type") === "ftp"
                        ? "FTP server address"
                        : "API endpoint or webhook URL"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this integration. Inactive integrations will not be used.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("type") !== "email" && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Note:</strong> Credentials and authentication details should be
                  configured separately through the secure credentials management system.
                </p>
              </div>
            )}

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
                  <>{integration ? "Update Integration" : "Add Integration"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
