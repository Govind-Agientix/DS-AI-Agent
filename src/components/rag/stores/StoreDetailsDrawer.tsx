import { VectorStoreDetail } from "@/lib/rag/types";
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
import { formatDate } from "@/lib/rag/utils";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StoreDetailsDrawerProps {
  store?: VectorStoreDetail;
  open: boolean;
  onClose: () => void;
  onAddFiles: (storeId: string) => void;
  onCreateAssistant: (storeId: string) => void;
  onDelete: (storeId: string) => void;
}

export function StoreDetailsDrawer({
  store,
  open,
  onClose,
  onAddFiles,
  onCreateAssistant,
  onDelete,
}: StoreDetailsDrawerProps) {
  if (!store) return null;

  const canDelete = store.usedBy.length === 0;
  const isIndexing = store.status === 'indexing';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>VECTOR STORE</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Overview Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Overview</h3>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {store.id}
                </code>
                <CopyToClipboard text={store.id} label="Store ID" />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated usage</span>
              <span className="text-sm">
                {store.estimatedUsageUsd !== undefined
                  ? `$${store.estimatedUsageUsd.toFixed(2)} / GB per day`
                  : 'N/A'}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm">{store.filesCount} files</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusTag status={store.status} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last active</span>
              <span className="text-sm">
                {store.lastActive ? formatDate(store.lastActive) : 'Never'}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(store.createdAt)}</span>
            </div>
          </div>

          {/* Files Attached Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Files attached {isIndexing && <span className="text-sm text-muted-foreground ml-2">(Indexing...)</span>}
              </h3>
              <Button size="sm" variant="outline" onClick={() => onAddFiles(store.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add files
              </Button>
            </div>

            {store.filesAttached.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                This vector store is empty.
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FILE</TableHead>
                      <TableHead>UPLOADED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.filesAttached.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(file.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Used By Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Used by</h3>
              <Button size="sm" onClick={() => onCreateAssistant(store.id)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create assistant
              </Button>
            </div>

            {store.usedBy.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assistants are using this store yet.
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.usedBy.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {resource.id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex w-full gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(store.id)}
              disabled={!canDelete}
              className="flex-1"
              title={!canDelete ? "Detach from agents before deleting this store" : ""}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete vector store
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
