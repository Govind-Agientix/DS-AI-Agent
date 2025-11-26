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
import { Badge } from "@/components/ui/badge";
import { Prompt } from "@/lib/prompt/types";
import { promptSchema, defaultPromptTemplate, type PromptFormData } from "@/lib/prompt/schema";
import { DOCUMENT_TYPES_FOR_PROMPTS, PROMPT_SCOPES } from "@/lib/prompt/types";
import { Plus, X, Loader2 } from "lucide-react";

interface CreateEditPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PromptFormData) => Promise<void>;
  prompt?: Prompt | null;
}

export function CreateEditPromptDialog({
  open,
  onClose,
  onSubmit,
  prompt,
}: CreateEditPromptDialogProps) {
  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      name: "",
      description: "",
      docType: "",
      scope: "Global",
      basePrompt: defaultPromptTemplate,
      fewShotExamples: [],
      variables: [],
      status: "draft",
    },
  });

  const fewShotExamples = form.watch("fewShotExamples") || [];
  const variables = form.watch("variables") || [];

  useEffect(() => {
    if (prompt && open) {
      form.reset({
        name: prompt.name,
        description: prompt.description || "",
        docType: prompt.docType,
        scope: prompt.scope,
        basePrompt: prompt.basePrompt,
        fewShotExamples: prompt.fewShotExamples || [],
        outputSchema: prompt.outputSchema,
        variables: prompt.variables || [],
        status: prompt.status,
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        docType: "",
        scope: "Global",
        basePrompt: defaultPromptTemplate,
        fewShotExamples: [],
        variables: [],
        status: "draft",
      });
    }
  }, [prompt, open, form]);

  const handleSubmit = async (data: PromptFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const addFewShotExample = () => {
    const current = form.getValues("fewShotExamples") || [];
    form.setValue("fewShotExamples", [...current, ""], { shouldValidate: true });
  };

  const updateFewShotExample = (index: number, value: string) => {
    const current = form.getValues("fewShotExamples") || [];
    current[index] = value;
    form.setValue("fewShotExamples", current, { shouldValidate: true });
  };

  const removeFewShotExample = (index: number) => {
    const current = form.getValues("fewShotExamples") || [];
    current.splice(index, 1);
    form.setValue("fewShotExamples", current, { shouldValidate: true });
  };

  const addVariable = () => {
    const current = form.getValues("variables") || [];
    const newVar = `variable_${Date.now()}`;
    form.setValue("variables", [...current, newVar], { shouldValidate: true });
  };

  const updateVariable = (index: number, value: string) => {
    const current = form.getValues("variables") || [];
    current[index] = value;
    form.setValue("variables", current, { shouldValidate: true });
  };

  const removeVariable = (index: number) => {
    const current = form.getValues("variables") || [];
    current.splice(index, 1);
    form.setValue("variables", current, { shouldValidate: true });
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
          <DialogDescription>
            {prompt
              ? "Update the prompt configuration and content"
              : "Create a new prompt template for document processing"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Booking Confirmation Extractor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="docType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_TYPES_FOR_PROMPTS.map((type) => (
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of what this prompt does..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROMPT_SCOPES.map((scope) => (
                          <SelectItem key={scope.value} value={scope.value}>
                            {scope.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Global prompts can be used by all customers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="basePrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Prompt *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the main prompt instructions..."
                      className="min-h-[200px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The core instructions that will be sent to the AI model
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Few-Shot Examples</FormLabel>
                  <FormDescription>Add example inputs/outputs to guide the model</FormDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFewShotExample}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Example
                </Button>
              </div>
              {fewShotExamples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={example}
                    onChange={(e) => updateFewShotExample(index, e.target.value)}
                    placeholder={`Example ${index + 1}...`}
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFewShotExample(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Variables</FormLabel>
                  <FormDescription>
                    Define variables that can be injected into the prompt (e.g., {"{{customer_name}}"}
                    )
                  </FormDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pr-1">
                    <Input
                      value={variable}
                      onChange={(e) => updateVariable(index, e.target.value)}
                      className="h-6 w-24 border-none bg-transparent p-0 focus-visible:ring-0"
                      placeholder="var_name"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="hover:bg-secondary/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {prompt ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{prompt ? "Update Prompt" : "Create Prompt"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

