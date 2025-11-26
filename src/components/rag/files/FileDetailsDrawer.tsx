import { FileDetail } from "@/lib/rag/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusTag } from "../StatusTag";
import { CopyToClipboard } from "../CopyToClipboard";
import { formatBytes, formatDate } from "@/lib/rag/utils";
import { Trash2 } from "lucide-react";

interface FileDetailsDrawerProps {
  file?: FileDetail;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function FileDetailsDrawer({ file, open, onClose, onDelete }: FileDetailsDrawerProps) {
  if (!file) return null;

  const isProcessing = file.status === 'processing';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>FILE</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusTag status={file.status} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File ID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {file.id}
                </code>
                <CopyToClipboard text={file.id} label="File ID" />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purpose</span>
              <span className="text-sm">{file.purpose || 'N/A'}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm">{formatBytes(file.sizeBytes)}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created at</span>
              <span className="text-sm">{formatDate(file.createdAt)}</span>
            </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(file.id)}
              disabled={isProcessing}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
