import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AgentMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentLabel?: string;
  loading: boolean;
  error: string | null;
  payload: unknown;
}

export function AgentMemoryDialog({
  open,
  onOpenChange,
  agentId,
  agentLabel,
  loading,
  error,
  payload,
}: AgentMemoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agent memory</DialogTitle>
          <DialogDescription>
            Response from <code className="text-xs">GET /api/v1/agents/…/memory</code>
            {agentLabel ? (
              <>
                {" "}
                for <span className="font-medium text-foreground">{agentLabel}</span>
              </>
            ) : null}
            <span className="font-mono text-xs block mt-1">{agentId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {loading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading memory…
            </p>
          )}
          {!loading && error && <p className="text-sm text-destructive py-4">{error}</p>}
          {!loading && !error && (
            <pre className="text-xs bg-muted/50 rounded-md p-4 overflow-auto max-h-[55vh] font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
