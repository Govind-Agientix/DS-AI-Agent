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
import { EquipmentAlias } from "@/lib/customer/types";
import { equipmentAliasSchema, type EquipmentAliasFormData } from "@/lib/customer/schema";
import { EQUIPMENT_CATEGORIES } from "@/lib/customer/types";
import { Loader2 } from "lucide-react";

interface EquipmentAliasDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EquipmentAliasFormData) => void;
  alias?: EquipmentAlias | null;
}

export function EquipmentAliasDialog({
  open,
  onClose,
  onSubmit,
  alias,
}: EquipmentAliasDialogProps) {
  const form = useForm<EquipmentAliasFormData>({
    resolver: zodResolver(equipmentAliasSchema),
    defaultValues: {
      customerTerm: "",
      standardTerm: "",
      category: "container",
      notes: "",
    },
  });

  useEffect(() => {
    if (alias && open) {
      form.reset({
        customerTerm: alias.customerTerm,
        standardTerm: alias.standardTerm,
        category: alias.category,
        notes: alias.notes || "",
      });
    } else if (open) {
      form.reset({
        customerTerm: "",
        standardTerm: "",
        category: "container",
        notes: "",
      });
    }
  }, [alias, open, form]);

  const handleSubmit = (data: EquipmentAliasFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{alias ? "Edit Equipment Alias" : "Add Equipment Alias"}</DialogTitle>
          <DialogDescription>
            Map customer-specific terms to standard equipment names in the system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 overflow-y-auto flex-1 px-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Term *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Box" {...field} />
                    </FormControl>
                    <FormDescription>How the customer refers to this equipment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="standardTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard Term *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Container" {...field} />
                    </FormControl>
                    <FormDescription>Standard term used in the system</FormDescription>
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
                        {EQUIPMENT_CATEGORIES.map((cat) => (
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this alias..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional context or clarification about this mapping
                  </FormDescription>
                  <FormMessage />
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
                  <>{alias ? "Update Alias" : "Add Alias"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
