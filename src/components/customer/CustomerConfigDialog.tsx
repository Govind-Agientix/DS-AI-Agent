import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer, BillingPolicy, EquipmentAlias, CustomerRule, Contact, Integration, Connection } from "@/lib/customer/types";
import {
  customerSchema,
  type CustomerFormData,
  type BillingPolicyFormData,
  type EquipmentAliasFormData,
  type CustomerRuleFormData,
  type ContactFormData,
  type IntegrationFormData,
  type ConnectionFormData,
} from "@/lib/customer/schema";
import { CUSTOMER_STATUSES, CONNECTION_STATUSES } from "@/lib/customer/types";
import { OFFICES, SERVICE_TYPES } from "@/lib/agent/types";
import { Plus, Trash2, Edit, Loader2, MoreVertical, Network, Link2 } from "lucide-react";
import { BillingPolicyDialog } from "./BillingPolicyDialog";
import { EquipmentAliasDialog } from "./EquipmentAliasDialog";
import { CustomerRuleDialog } from "./CustomerRuleDialog";
import { ContactDialog } from "./ContactDialog";
import { IntegrationDialog } from "./IntegrationDialog";
import { ConnectionDialog } from "./ConnectionDialog";

interface CustomerConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  customer?: Customer | null;
}

export function CustomerConfigDialog({
  open,
  onClose,
  onSubmit,
  customer,
}: CustomerConfigDialogProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      status: "active",
      defaultOffice: "",
      defaultServiceType: "",
      billingPolicies: [],
      equipmentAliases: [],
      rules: [],
      contacts: [],
      integrations: [],
      connections: [],
    },
  });

  const {
    fields: billingFields,
    append: appendBilling,
    remove: removeBilling,
    update: updateBilling,
  } = useFieldArray({
    control: form.control,
    name: "billingPolicies",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
    update: updateEquipment,
  } = useFieldArray({
    control: form.control,
    name: "equipmentAliases",
  });

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
    update: updateRule,
  } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
    update: updateContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const {
    fields: integrationFields,
    append: appendIntegration,
    remove: removeIntegration,
    update: updateIntegration,
  } = useFieldArray({
    control: form.control,
    name: "integrations",
  });

  const {
    fields: connectionFields,
    append: appendConnection,
    remove: removeConnection,
    update: updateConnection,
  } = useFieldArray({
    control: form.control,
    name: "connections",
  });

  // Individual dialog states
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [editingBillingIndex, setEditingBillingIndex] = useState<number | null>(null);

  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [editingEquipmentIndex, setEditingEquipmentIndex] = useState<number | null>(null);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);

  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [editingIntegrationIndex, setEditingIntegrationIndex] = useState<number | null>(null);

  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [editingConnectionIndex, setEditingConnectionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (customer && open) {
      form.reset({
        name: customer.name,
        code: customer.code,
        description: customer.description || "",
        status: customer.status,
        defaultOffice: customer.defaultOffice || "",
        defaultServiceType: customer.defaultServiceType || "",
        billingPolicies: customer.billingPolicies || [],
        equipmentAliases: customer.equipmentAliases || [],
        rules: customer.rules || [],
        contacts: customer.contacts || [],
        integrations: customer.integrations || [],
        connections: customer.connections || [],
      });
    } else if (open) {
      form.reset({
        name: "",
        code: "",
        description: "",
        status: "active",
        defaultOffice: "",
        defaultServiceType: "",
        billingPolicies: [],
        equipmentAliases: [],
        rules: [],
        contacts: [],
        integrations: [],
        connections: [],
      });
    }
    
    // Reset all individual dialog states when main dialog closes
    if (!open) {
      setBillingDialogOpen(false);
      setEditingBillingIndex(null);
      setEquipmentDialogOpen(false);
      setEditingEquipmentIndex(null);
      setRuleDialogOpen(false);
      setEditingRuleIndex(null);
      setContactDialogOpen(false);
      setEditingContactIndex(null);
      setIntegrationDialogOpen(false);
      setEditingIntegrationIndex(null);
      setConnectionDialogOpen(false);
      setEditingConnectionIndex(null);
    }
  }, [customer, open, form]);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data);
      // Don't close here - let the parent handle closing after success
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error submitting customer:", error);
    }
  };

  const handleBillingSubmit = (data: BillingPolicyFormData) => {
    if (editingBillingIndex !== null) {
      updateBilling(editingBillingIndex, data);
    } else {
      appendBilling(data);
    }
    setEditingBillingIndex(null);
  };

  const handleEquipmentSubmit = (data: EquipmentAliasFormData) => {
    if (editingEquipmentIndex !== null) {
      updateEquipment(editingEquipmentIndex, data);
    } else {
      appendEquipment(data);
    }
    setEditingEquipmentIndex(null);
  };

  const handleRuleSubmit = (data: CustomerRuleFormData) => {
    if (editingRuleIndex !== null) {
      updateRule(editingRuleIndex, data);
    } else {
      appendRule(data);
    }
    setEditingRuleIndex(null);
  };

  const handleContactSubmit = (data: ContactFormData) => {
    if (editingContactIndex !== null) {
      updateContact(editingContactIndex, data);
    } else {
      appendContact(data);
    }
    setEditingContactIndex(null);
  };

  const handleIntegrationSubmit = (data: IntegrationFormData) => {
    if (editingIntegrationIndex !== null) {
      updateIntegration(editingIntegrationIndex, data);
    } else {
      appendIntegration(data);
    }
    setEditingIntegrationIndex(null);
  };

  const handleConnectionSubmit = (data: ConnectionFormData) => {
    if (editingConnectionIndex !== null) {
      updateConnection(editingConnectionIndex, data);
    } else {
      appendConnection(data);
    }
    setEditingConnectionIndex(null);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{customer ? "Edit Customer" : "Create New Customer"}</DialogTitle>
            <DialogDescription>
              {customer
                ? "Update customer configuration and settings"
                : "Configure a new customer with billing policies, rules, and contacts"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Crowley Logistics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CROW" {...field} maxLength={10} />
                          </FormControl>
                          <FormDescription>Short code (max 10 characters)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of the customer..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              {CUSTOMER_STATUSES.map((status) => (
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
                      name="defaultOffice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Office</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} 
                            value={field.value || "__none__"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select office" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {OFFICES.map((office) => (
                                <SelectItem key={office.value} value={office.value}>
                                  {office.label}
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
                      name="defaultServiceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Service Type</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} 
                            value={field.value || "__none__"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {SERVICE_TYPES.map((service) => (
                                <SelectItem key={service.value} value={service.value}>
                                  {service.label}
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

                {/* Billing Policies Tab */}
                <TabsContent value="billing" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Billing Policies</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure detention, chassis, fuel, and other billing rules
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBillingIndex(null);
                        setBillingDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Button>
                  </div>

                  {billingFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Policy Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Free Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingFields.map((field, index) => {
                            const policy = billingFields[index] as any;
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{policy.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{policy.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  {policy.rate?.amount
                                    ? `$${policy.rate.amount}/${policy.rate.unit}`
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {policy.freeTime?.hours ? `${policy.freeTime.hours}h free` : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingBillingIndex(index);
                                          setBillingDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeBilling(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          No billing policies configured
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingBillingIndex(null);
                            setBillingDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Policy
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Equipment Aliases Tab */}
                <TabsContent value="equipment" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Equipment Aliases</h3>
                      <p className="text-sm text-muted-foreground">
                        Map customer-specific terms to standard equipment names
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEquipmentIndex(null);
                        setEquipmentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Alias
                    </Button>
                  </div>

                  {equipmentFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer Term</TableHead>
                            <TableHead>Standard Term</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentFields.map((field, index) => {
                            const alias = equipmentFields[index] as any;
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{alias.customerTerm}</TableCell>
                                <TableCell>{alias.standardTerm}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{alias.category}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingEquipmentIndex(index);
                                          setEquipmentDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeEquipment(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          No equipment aliases configured
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingEquipmentIndex(null);
                            setEquipmentDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Alias
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Rules Tab */}
                <TabsContent value="rules" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Customer Rules</h3>
                      <p className="text-sm text-muted-foreground">
                        Define business rules and SOPs for this customer
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRuleIndex(null);
                        setRuleDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  {ruleFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ruleFields.map((field, index) => {
                            const rule = ruleFields[index] as any;
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{rule.title}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{rule.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{rule.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={rule.isActive ? "default" : "secondary"}
                                  >
                                    {rule.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingRuleIndex(index);
                                          setRuleDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeRule(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">No rules configured</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingRuleIndex(null);
                            setRuleDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Rule
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Contacts Tab */}
                <TabsContent value="contacts" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage customer contact information
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingContactIndex(null);
                        setContactDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {contactFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contactFields.map((field, index) => {
                            const contact = contactFields[index] as any;
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.phone || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{contact.role}</Badge>
                                </TableCell>
                                <TableCell>
                                  {contact.isPrimary && (
                                    <Badge variant="default">Primary</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingContactIndex(index);
                                          setContactDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeContact(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          No contacts configured
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingContactIndex(null);
                            setContactDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Contact
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Integrations</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure API, EDI, and other integration endpoints
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingIntegrationIndex(null);
                        setIntegrationDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>

                  {integrationFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {integrationFields.map((field, index) => {
                            const integration = integrationFields[index] as any;
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{integration.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{integration.type}</Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {integration.endpoint || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={integration.isActive ? "default" : "secondary"}>
                                    {integration.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingIntegrationIndex(index);
                                          setIntegrationDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeIntegration(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          No integrations configured
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingIntegrationIndex(null);
                            setIntegrationDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Integration
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Connections Tab */}
                <TabsContent value="connections" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Connections</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage database, API, FTP, and other connection configurations
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingConnectionIndex(null);
                        setConnectionDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Connection
                    </Button>
                  </div>

                  {connectionFields.length > 0 ? (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Host</TableHead>
                            <TableHead>Port</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {connectionFields.map((field, index) => {
                            const connection = connectionFields[index] as any;
                            const statusInfo = CONNECTION_STATUSES.find(
                              (s) => s.value === connection.connectionStatus
                            ) || CONNECTION_STATUSES[3]; // default to "unknown"
                            return (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Network className="h-4 w-4 text-muted-foreground" />
                                    {connection.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{connection.type}</Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {connection.host || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {connection.port ? (
                                    <span className="text-sm text-muted-foreground">
                                      {connection.port}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Default</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        connection.isActive
                                          ? connection.connectionStatus === "connected"
                                            ? "default"
                                            : connection.connectionStatus === "error"
                                              ? "destructive"
                                              : "secondary"
                                          : "outline"
                                      }
                                    >
                                      {connection.isActive
                                        ? statusInfo.label
                                        : "Inactive"}
                                    </Badge>
                                    {connection.sslEnabled && (
                                      <Badge variant="outline" className="text-xs">
                                        SSL
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingConnectionIndex(index);
                                          setConnectionDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => removeConnection(index)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-full bg-muted p-4">
                            <Link2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1">No connections configured</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Add database, API, or FTP connections to enable data integration
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingConnectionIndex(null);
                              setConnectionDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Connection
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {customer ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{customer ? "Update Customer" : "Create Customer"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Individual Dialogs */}
      <BillingPolicyDialog
        key={`billing-${editingBillingIndex ?? 'new'}-${billingDialogOpen}`}
        open={billingDialogOpen}
        onClose={() => {
          setBillingDialogOpen(false);
          setEditingBillingIndex(null);
        }}
        onSubmit={handleBillingSubmit}
        policy={
          editingBillingIndex !== null && billingFields[editingBillingIndex]
            ? {
                id: billingFields[editingBillingIndex].id || "",
                name: (billingFields[editingBillingIndex] as any).name || "",
                category: (billingFields[editingBillingIndex] as any).category || "detention",
                rules: (billingFields[editingBillingIndex] as any).rules || "",
                rate: (billingFields[editingBillingIndex] as any).rate,
                freeTime: (billingFields[editingBillingIndex] as any).freeTime,
                effectiveDate: (billingFields[editingBillingIndex] as any).effectiveDate,
                expirationDate: (billingFields[editingBillingIndex] as any).expirationDate,
              }
            : null
        }
      />

      <EquipmentAliasDialog
        key={`equipment-${editingEquipmentIndex ?? 'new'}-${equipmentDialogOpen}`}
        open={equipmentDialogOpen}
        onClose={() => {
          setEquipmentDialogOpen(false);
          setEditingEquipmentIndex(null);
        }}
        onSubmit={handleEquipmentSubmit}
        alias={
          editingEquipmentIndex !== null && equipmentFields[editingEquipmentIndex]
            ? {
                id: equipmentFields[editingEquipmentIndex].id || "",
                customerTerm: (equipmentFields[editingEquipmentIndex] as any).customerTerm || "",
                standardTerm: (equipmentFields[editingEquipmentIndex] as any).standardTerm || "",
                category: (equipmentFields[editingEquipmentIndex] as any).category || "container",
                notes: (equipmentFields[editingEquipmentIndex] as any).notes,
              }
            : null
        }
      />

      <CustomerRuleDialog
        key={`rule-${editingRuleIndex ?? 'new'}-${ruleDialogOpen}`}
        open={ruleDialogOpen}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRuleIndex(null);
        }}
        onSubmit={handleRuleSubmit}
        rule={
          editingRuleIndex !== null && ruleFields[editingRuleIndex]
            ? {
                id: ruleFields[editingRuleIndex].id || "",
                title: (ruleFields[editingRuleIndex] as any).title || "",
                category: (ruleFields[editingRuleIndex] as any).category || "operations",
                rule: (ruleFields[editingRuleIndex] as any).rule || "",
                priority: (ruleFields[editingRuleIndex] as any).priority || "medium",
                effectiveDate: (ruleFields[editingRuleIndex] as any).effectiveDate,
                expirationDate: (ruleFields[editingRuleIndex] as any).expirationDate,
                isActive: (ruleFields[editingRuleIndex] as any).isActive ?? true,
              }
            : null
        }
      />

      <ContactDialog
        key={`contact-${editingContactIndex ?? 'new'}-${contactDialogOpen}`}
        open={contactDialogOpen}
        onClose={() => {
          setContactDialogOpen(false);
          setEditingContactIndex(null);
        }}
        onSubmit={handleContactSubmit}
        contact={
          editingContactIndex !== null && contactFields[editingContactIndex]
            ? {
                id: contactFields[editingContactIndex].id || "",
                name: (contactFields[editingContactIndex] as any).name || "",
                email: (contactFields[editingContactIndex] as any).email || "",
                phone: (contactFields[editingContactIndex] as any).phone,
                role: (contactFields[editingContactIndex] as any).role || "primary",
                department: (contactFields[editingContactIndex] as any).department,
                isPrimary: (contactFields[editingContactIndex] as any).isPrimary ?? false,
              }
            : null
        }
      />

      <IntegrationDialog
        key={`integration-${editingIntegrationIndex ?? 'new'}-${integrationDialogOpen}`}
        open={integrationDialogOpen}
        onClose={() => {
          setIntegrationDialogOpen(false);
          setEditingIntegrationIndex(null);
        }}
        onSubmit={handleIntegrationSubmit}
        integration={
          editingIntegrationIndex !== null && integrationFields[editingIntegrationIndex]
            ? {
                id: integrationFields[editingIntegrationIndex].id || "",
                type: (integrationFields[editingIntegrationIndex] as any).type || "api",
                name: (integrationFields[editingIntegrationIndex] as any).name || "",
                endpoint: (integrationFields[editingIntegrationIndex] as any).endpoint,
                credentials: (integrationFields[editingIntegrationIndex] as any).credentials,
                isActive: (integrationFields[editingIntegrationIndex] as any).isActive ?? true,
                lastSync: (integrationFields[editingIntegrationIndex] as any).lastSync,
              }
            : null
        }
      />

      <ConnectionDialog
        key={`connection-${editingConnectionIndex ?? 'new'}-${connectionDialogOpen}`}
        open={connectionDialogOpen}
        onClose={() => {
          setConnectionDialogOpen(false);
          setEditingConnectionIndex(null);
        }}
        onSubmit={handleConnectionSubmit}
        connection={
          editingConnectionIndex !== null && connectionFields[editingConnectionIndex]
            ? {
                id: connectionFields[editingConnectionIndex].id || "",
                name: (connectionFields[editingConnectionIndex] as any).name || "",
                type: (connectionFields[editingConnectionIndex] as any).type || "database",
                host: (connectionFields[editingConnectionIndex] as any).host || "",
                port: (connectionFields[editingConnectionIndex] as any).port,
                database: (connectionFields[editingConnectionIndex] as any).database,
                username: (connectionFields[editingConnectionIndex] as any).username,
                description: (connectionFields[editingConnectionIndex] as any).description,
                isActive: (connectionFields[editingConnectionIndex] as any).isActive ?? true,
                sslEnabled: (connectionFields[editingConnectionIndex] as any).sslEnabled ?? false,
                timeout: (connectionFields[editingConnectionIndex] as any).timeout,
                retryAttempts: (connectionFields[editingConnectionIndex] as any).retryAttempts,
                connectionStatus: (connectionFields[editingConnectionIndex] as any).connectionStatus,
                lastTested: (connectionFields[editingConnectionIndex] as any).lastTested,
              }
            : null
        }
      />
    </>
  );
}