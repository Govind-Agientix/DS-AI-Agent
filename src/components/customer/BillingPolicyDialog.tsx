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
import { BillingPolicy } from "@/lib/customer/types";
import { billingPolicySchema, type BillingPolicyFormData } from "@/lib/customer/schema";
import { BILLING_CATEGORIES } from "@/lib/customer/types";
import { Loader2 } from "lucide-react";

interface BillingPolicyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BillingPolicyFormData) => void;
  policy?: BillingPolicy | null;
}

export function BillingPolicyDialog({
  open,
  onClose,
  onSubmit,
  policy,
}: BillingPolicyDialogProps) {
  const form = useForm<BillingPolicyFormData>({
    resolver: zodResolver(billingPolicySchema),
    defaultValues: {
      name: "",
      category: "detention",
      rules: "",
      rate: undefined,
      freeTime: undefined,
      effectiveDate: undefined,
      expirationDate: undefined,
    },
  });

  useEffect(() => {
    if (policy && open) {
      form.reset({
        name: policy.name,
        category: policy.category,
        rules: policy.rules,
        rate: policy.rate,
        freeTime: policy.freeTime,
        effectiveDate: policy.effectiveDate,
        expirationDate: policy.expirationDate,
      });
    } else if (open) {
      form.reset({
        name: "",
        category: "detention",
        rules: "",
        rate: undefined,
        freeTime: undefined,
        effectiveDate: undefined,
        expirationDate: undefined,
      });
    }
  }, [policy, open, form]);

  const handleSubmit = (data: BillingPolicyFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Billing Policy" : "Add Billing Policy"}</DialogTitle>
          <DialogDescription>
            Configure billing rules, rates, and free time allowances
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
                    <FormLabel>Policy Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Detention Policy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {BILLING_CATEGORIES.map((cat) => (
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
            </div>

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rules *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the billing rules in detail..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain how this billing policy should be applied
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-semibold">Rate Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rate.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hour">Per Hour</SelectItem>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="flat">Flat Rate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" {...field} defaultValue="USD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-semibold">Free Time</h4>
              <FormField
                control={form.control}
                name="freeTime.hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Time (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of free hours before charges apply
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>When this policy becomes active</FormDescription>
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
                    <FormDescription>When this policy expires (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  <>{policy ? "Update Policy" : "Add Policy"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
