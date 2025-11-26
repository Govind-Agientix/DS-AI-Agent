import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PromptPreviewProps {
  basePrompt: string;
  instructions: string;
  documentTypes: string[];
  outputSchema: Record<string, any>;
  fewShotExamples?: string[];
}

export function PromptPreview({
  basePrompt,
  instructions,
  documentTypes,
  outputSchema,
  fewShotExamples = [],
}: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const assemblePrompt = () => {
    const parts: string[] = [];

    // Base Prompt
    parts.push("=== BASE PROMPT ===");
    parts.push(basePrompt || "Extract structured data from this logistics document. Return valid JSON matching the schema.");
    parts.push("");

    // Document Types Context
    if (documentTypes.length > 0) {
      parts.push("=== DOCUMENT TYPES ===");
      parts.push(`This agent processes the following document types: ${documentTypes.join(", ")}`);
      parts.push("");
    }

    // Customer Instructions
    if (instructions) {
      parts.push("=== CUSTOMER-SPECIFIC INSTRUCTIONS ===");
      parts.push(instructions);
      parts.push("");
    }

    // Output Schema
    parts.push("=== OUTPUT SCHEMA ===");
    parts.push("Return a JSON object matching this exact structure:");
    parts.push(JSON.stringify(outputSchema, null, 2));
    parts.push("");

    // Few-shot Examples
    if (fewShotExamples.length > 0) {
      parts.push("=== FEW-SHOT EXAMPLES ===");
      fewShotExamples.forEach((example, index) => {
        parts.push(`Example ${index + 1}:`);
        parts.push(example);
        parts.push("");
      });
    }

    return parts.join("\n");
  };

  const handleCopy = async () => {
    const promptText = assemblePrompt();
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Prompt has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const fullPrompt = assemblePrompt();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt Assembly Preview</CardTitle>
            <CardDescription>
              See exactly what the AI model receives when processing documents
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Section Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Base Prompt</Badge>
            {documentTypes.length > 0 && <Badge variant="outline">Document Types</Badge>}
            {instructions && <Badge variant="outline">Instructions</Badge>}
            {Object.keys(outputSchema).length > 0 && <Badge variant="outline">Output Schema</Badge>}
            {fewShotExamples.length > 0 && <Badge variant="outline">Examples ({fewShotExamples.length})</Badge>}
          </div>

          {/* Prompt Content */}
          <ScrollArea className="h-[500px] w-full rounded-lg border bg-muted/50 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
              {fullPrompt || (
                <span className="text-muted-foreground italic">
                  Fill in the form fields above to see the assembled prompt...
                </span>
              )}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
