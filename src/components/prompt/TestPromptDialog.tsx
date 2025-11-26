import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, CheckCircle2, XCircle } from "lucide-react";
import { Prompt } from "@/lib/prompt/types";
import { promptClient } from "@/lib/prompt/clients/promptClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TestPromptDialogProps {
  open: boolean;
  onClose: () => void;
  prompt: Prompt | null;
}

export function TestPromptDialog({ open, onClose, prompt }: TestPromptDialogProps) {
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!prompt || !testInput.trim()) {
      toast({
        title: "Error",
        description: "Please provide test input",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setIsValid(null);
    setTestOutput(null);

    try {
      const result = await promptClient.test(prompt.id, testInput);
      setTestOutput(result.output);
      setIsValid(result.isValid);
      
      if (!result.isValid && result.errors) {
        toast({
          title: "Validation Errors",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Complete",
          description: "Prompt executed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setTestOutput("Error: Failed to execute test");
      setIsValid(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    setTestInput("");
    setTestOutput(null);
    setIsValid(null);
    onClose();
  };

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Test Prompt: {prompt.name}</DialogTitle>
          <DialogDescription>
            Test this prompt with sample input to see the output
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prompt Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{prompt.docType}</Badge>
            <Badge variant={prompt.scope === "Global" ? "default" : "secondary"}>
              {prompt.scope}
            </Badge>
            <Badge variant="outline">{prompt.version}</Badge>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <Label htmlFor="test-input">Test Input</Label>
            <Textarea
              id="test-input"
              placeholder="Paste sample document text or JSON here..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Test Output</Label>
              {isValid !== null && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">Invalid</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <ScrollArea className="h-[300px] w-full rounded-lg border bg-muted/50 p-4">
              {testOutput ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                  {testOutput}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Output will appear here after running the test...
                </p>
              )}
            </ScrollArea>
          </div>

          {/* Prompt Preview */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              View Full Prompt Assembly
            </summary>
            <ScrollArea className="h-[200px] mt-2">
              <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                {prompt.basePrompt}
                {prompt.fewShotExamples && prompt.fewShotExamples.length > 0 && (
                  <>
                    {"\n\n=== Examples ===\n"}
                    {prompt.fewShotExamples.join("\n\n")}
                  </>
                )}
              </pre>
            </ScrollArea>
          </details>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isTesting}>
            Close
          </Button>
          <Button onClick={handleTest} disabled={isTesting || !testInput.trim()}>
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

