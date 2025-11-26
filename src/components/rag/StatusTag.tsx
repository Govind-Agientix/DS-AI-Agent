import { Badge } from "@/components/ui/badge";
import { FileStatus, StoreStatus } from "@/lib/rag/types";
import { Loader2 } from "lucide-react";

interface StatusTagProps {
  status: FileStatus | StoreStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const config = {
    processing: { variant: "secondary" as const, label: "Processing", loading: true },
    indexing: { variant: "secondary" as const, label: "Indexing", loading: true },
    ready: { variant: "default" as const, label: "Ready", loading: false },
    failed: { variant: "destructive" as const, label: "Failed", loading: false },
  };

  const { variant, label, loading } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}
    </Badge>
  );
}
