import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SchemaBuilder } from "@/components/agent/SchemaBuilder";
import { PromptPreview } from "@/components/agent/PromptPreview";
import { useToast } from "@/hooks/use-toast";
import {
  agentConfigSchema,
  defaultOutputSchema,
  defaultBasePrompt,
  type AgentConfigFormData,
} from "@/lib/agent/schema";
import {
  DOCUMENT_TYPES,
  CUSTOMERS,
  OFFICES,
  SERVICE_TYPES,
  LOAD_TYPES,
  RULE_TEMPLATES,
} from "@/lib/agent/types";
import { Plus, Save, Loader2 } from "lucide-react";

const STORAGE_KEY = "agent-builder-data";

export default function AgentBuilder() {
  const { toast } = useToast();
  
  const form = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      name: "",
      customer: "",
      documentTypes: [],
      office: "",
      serviceType: "",
      loadType: "",
      instructions: "",
      outputSchema: defaultOutputSchema,
      basePrompt: defaultBasePrompt,
      fewShotExamples: [],
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const { documentTypes, instructions, outputSchema, basePrompt, fewShotExamples } = watchedValues;

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        form.reset(data);
        toast({
          title: "Loaded",
          description: "Previous form data has been restored",
        });
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, [form, toast]);

  // Auto-save on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: AgentConfigFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      toast({
        title: "Success!",
        description: `Agent "${data.name}" has been saved successfully`,
      });
      
      // In a real app, you would make an API call here
      console.log("Agent config saved:", data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addRuleTemplate = (template: typeof RULE_TEMPLATES[0]) => {
    const currentInstructions = form.getValues("instructions");
    const newInstructions = currentInstructions
      ? `${currentInstructions}\n\n${template.name}:\n${template.content}`
      : `${template.name}:\n${template.content}`;
    form.setValue("instructions", newInstructions, { shouldValidate: true });
  };

  const addFewShotExample = () => {
    const currentExamples = form.getValues("fewShotExamples") || [];
    form.setValue("fewShotExamples", [...currentExamples, ""], { shouldValidate: true });
  };

  const updateFewShotExample = (index: number, value: string) => {
    const currentExamples = form.getValues("fewShotExamples") || [];
    currentExamples[index] = value;
    form.setValue("fewShotExamples", currentExamples, { shouldValidate: true });
  };

  const removeFewShotExample = (index: number) => {
    const currentExamples = form.getValues("fewShotExamples") || [];
    currentExamples.splice(index, 1);
    form.setValue("fewShotExamples", currentExamples, { shouldValidate: true });
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Agent Builder</h1>
        <p className="text-muted-foreground">
          Create and configure AI agents for specific customers and document types
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-muted">
              <TabsTrigger value="info">Agent Info</TabsTrigger>
              <TabsTrigger value="instructions">Customer Instructions</TabsTrigger>
              <TabsTrigger value="prompt">Prompt Assembly</TabsTrigger>
              <TabsTrigger value="outputs">Output Schema</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Define the agent's identity and scope</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Crowley Trip Sheet Agent"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this agent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                  <FormField
                    control={form.control}
                    name="documentTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Document Types Handled</FormLabel>
                          <FormDescription>
                            Select all document types this agent should process
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {DOCUMENT_TYPES.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="documentTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== type
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {type}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="office"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evans Office</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select office" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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

                    <FormField
                      control={form.control}
                      name="loadType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Load Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select load" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LOAD_TYPES.map((load) => (
                                <SelectItem key={load.value} value={load.value}>
                                  {load.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6 mt-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Customer-Specific Instructions</CardTitle>
                  <CardDescription>
                    Add rules and requirements that will be injected into prompts at runtime
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions & Rules</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Always use consignee as bill-to unless third party is listed. No subcontracting. Apply 2-hour detention after first 2 hours free. Cap chassis at $75/day..."
                            className="min-h-[300px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These instructions will be automatically injected when this agent processes documents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Common Rule Templates</h4>
                    <div className="flex flex-wrap gap-2">
                      {RULE_TEMPLATES.map((template) => (
                        <Badge
                          key={template.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80 transition-colors"
                          onClick={() => addRuleTemplate(template)}
                        >
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click a template to add it to your instructions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Base Prompt</CardTitle>
                    <CardDescription>
                      The core instructions for the AI model
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="basePrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Few-Shot Examples</CardTitle>
                    <CardDescription>
                      Example inputs and outputs to guide the model
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(fewShotExamples || []).map((example, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={example}
                          onChange={(e) => updateFewShotExample(index, e.target.value)}
                          placeholder={`Example ${index + 1} (JSON or text)...`}
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFewShotExample(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFewShotExample}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Example
                    </Button>
                  </CardContent>
                </Card>

                <PromptPreview
                  basePrompt={basePrompt || defaultBasePrompt}
                  instructions={instructions}
                  documentTypes={documentTypes}
                  outputSchema={outputSchema}
                  fewShotExamples={fewShotExamples}
                />
              </div>
            </TabsContent>

            <TabsContent value="outputs" className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="outputSchema"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SchemaBuilder
                        schema={field.value || defaultOutputSchema}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}