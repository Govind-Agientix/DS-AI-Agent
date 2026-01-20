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
import { CustomerRule } from "@/lib/customer/types";
import { customerRuleSchema, type CustomerRuleFormData } from "@/lib/customer/schema";
import { RULE_CATEGORIES, RULE_PRIORITIES } from "@/lib/customer/types";
import { Loader2 } from "lucide-react";

interface CustomerRuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerRuleFormData) => void;
  rule?: CustomerRule | null;
}

export function CustomerRuleDialog({
  open,
  onClose,
  onSubmit,
  rule,
}: CustomerRuleDialogProps) {
  const form = useForm<CustomerRuleFormData>({
    resolver: zodResolver(customerRuleSchema),
    defaultValues: {
      title: "",
      category: "operations",
      rule: "",
      priority: "medium",
      effectiveDate: undefined,
      expirationDate: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (rule && open) {
      form.reset({
        title: rule.title,
        category: rule.category,
        rule: rule.rule,
        priority: rule.priority,
        effectiveDate: rule.effectiveDate,
        expirationDate: rule.expirationDate,
        isActive: rule.isActive,
      });
    } else if (open) {
      form.reset({
        title: "",
        category: "operations",
        rule: "",
        priority: "medium",
        effectiveDate: undefined,
        expirationDate: undefined,
        isActive: true,
      });
    }
  }, [rule, open, form]);

  const handleSubmit = (data: CustomerRuleFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Customer Rule" : "Add Customer Rule"}</DialogTitle>
          <DialogDescription>
            Define business rules and standard operating procedures for this customer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 overflow-y-auto flex-1 px-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., No Subcontracting" {...field} />
                  </FormControl>
                  <FormDescription>A brief, descriptive title for this rule</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RULE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RULE_PRIORITIES.map((pri) => (
                          <SelectItem key={pri.value} value={pri.value}>
                            {pri.label}
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
              name="rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the rule in detail. This will be injected into agent prompts..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of the rule. This content will be used by agents when
                    processing documents for this customer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>When this rule becomes active</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>When this rule expires (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable or disable this rule. Inactive rules will not be applied.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
                  <>{rule ? "Update Rule" : "Add Rule"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
