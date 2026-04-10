import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { AgentDetailResponse } from "@/lib/agent/clients/agentClient";

interface AgentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentLabel?: string;
  loading: boolean;
  error: string | null;
  detail: AgentDetailResponse | null;
}

function fmtDate(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

export function AgentDetailDialog({
  open,
  onOpenChange,
  agentId,
  agentLabel,
  loading,
  error,
  detail,
}: AgentDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agent details</DialogTitle>
          <DialogDescription>
            Response from <code className="text-xs">GET /api/v1/agents/…</code>
            {agentLabel ? (
              <>
                {" "}
                for <span className="font-medium text-foreground">{agentLabel}</span>
              </>
            ) : null}
            <span className="font-mono text-xs block mt-1 break-all">{agentId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 text-sm">
          {loading && (
            <p className="text-muted-foreground flex items-center gap-2 py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details…
            </p>
          )}
          {!loading && error && <p className="text-destructive py-2">{error}</p>}
          {!loading && !error && detail && (
            <>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Agent name</dt>
                  <dd className="font-medium">{detail.agent_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Category</dt>
                  <dd>
                    <code className="text-xs">{detail.category}</code>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Status</dt>
                  <dd>{detail.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Connected</dt>
                  <dd>{detail.connected ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">User</dt>
                  <dd className="break-all">{detail.user_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Memory count</dt>
                  <dd>{detail.memory_count}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Created</dt>
                  <dd>{fmtDate(detail.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Last heartbeat</dt>
                  <dd>{fmtDate(detail.last_heartbeat)}</dd>
                </div>
              </dl>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Customer</p>
                <p>{detail.customer || "—"}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Document type</p>
                  <p>{detail.document_type ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Evans office</p>
                  <p>{detail.evans_office_location ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Service type</p>
                  <p>{detail.service_type ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Load type</p>
                  <p>{detail.load_type ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Instructions</p>
                <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs">
                  {detail.instructions || "—"}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Config</p>
                <pre className="text-xs bg-muted/50 rounded-md p-4 overflow-auto max-h-[40vh] font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(detail.config, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
