import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RagFile } from "@/lib/rag/types";
import { formatBytes } from "@/lib/rag/utils";
import { StatusTag } from "../StatusTag";
import { Search } from "lucide-react";

interface AddFilesToStoreDialogProps {
  open: boolean;
  files: RagFile[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
  onSubmit: (fileIds: string[]) => void;
}

export function AddFilesToStoreDialog({
  open,
  files,
  selectedIds,
  onChange,
  onClose,
  onSubmit,
}: AddFilesToStoreDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFile = (fileId: string) => {
    if (selectedIds.includes(fileId)) {
      onChange(selectedIds.filter((id) => id !== fileId));
    } else {
      onChange([...selectedIds, fileId]);
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedIds);
    onChange([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    onChange([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add files to vector store</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Available Files */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available files</h4>
              <div className="border rounded-lg p-2 max-h-96 overflow-y-auto space-y-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => toggleFile(file.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(file.id)}
                      onCheckedChange={() => toggleFile(file.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)}
                        </span>
                        <StatusTag status={file.status} />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredFiles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No files found
                  </p>
                )}
              </div>
            </div>

            {/* Selected Files */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Selected ({selectedIds.length})</h4>
              <div className="border rounded-lg p-2 max-h-96 overflow-y-auto space-y-1">
                {selectedIds.map((id) => {
                  const file = files.find((f) => f.id === id);
                  if (!file) return null;
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {selectedIds.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No files selected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
            Add files ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
