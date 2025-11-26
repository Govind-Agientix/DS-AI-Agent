import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { storesClient } from "@/lib/rag/clients/storesClient";
import { filesClient } from "@/lib/rag/clients/filesClient";
import { StoresToolbar } from "@/components/rag/stores/StoresToolbar";
import { StoresTable } from "@/components/rag/stores/StoresTable";
import { CreateStoreDialog } from "@/components/rag/stores/CreateStoreDialog";
import { StoreDetailsDrawer } from "@/components/rag/stores/StoreDetailsDrawer";
import { AddFilesToStoreDialog } from "@/components/rag/stores/AddFilesToStoreDialog";
import { EmptyState } from "@/components/rag/EmptyState";
import { Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VectorStore, VectorStoreDetail } from "@/lib/rag/types";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RAGVectorStores() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<VectorStoreDetail | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addFilesOpen, setAddFilesOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

  const { data: stores = [], isLoading, refetch } = useQuery({
    queryKey: ['rag-stores'],
    queryFn: storesClient.list,
    refetchInterval: (query) =>
      query.state.data?.some((s) => s.status === 'indexing') ? 3000 : false,
  });

  const { data: files = [] } = useQuery({
    queryKey: ['rag-files'],
    queryFn: filesClient.list,
  });

  const handleCreate = async (input: { name: string; description?: string }) => {
    try {
      await storesClient.create(input);
      toast({
        title: "Vector store created",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Creation failed",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = async (store: VectorStore) => {
    const detail = await storesClient.detail(store.id);
    setSelectedStore(detail);
    setDrawerOpen(true);
  };

  const handleAddFiles = (storeId: string) => {
    setAddFilesOpen(true);
  };

  const handleSubmitFiles = async (fileIds: string[]) => {
    if (!selectedStore) return;

    try {
      await storesClient.addFiles(selectedStore.id, fileIds);
      
      // Attach mock files to store for UI
      const filesToAttach = files.filter(f => fileIds.includes(f.id));
      storesClient.attachMockFiles(selectedStore.id, filesToAttach);
      
      toast({
        title: "Files added",
        description: "Indexing in progress...",
      });
      
      setAddFilesOpen(false);
      refetch();
      
      // Refresh store detail
      const updatedDetail = await storesClient.detail(selectedStore.id);
      setSelectedStore(updatedDetail);
    } catch (error) {
      toast({
        title: "Failed to add files",
        variant: "destructive",
      });
    }
  };

  const handleCreateAssistant = (storeId: string) => {
    navigate(`/agents?vectorStoreId=${storeId}`);
  };

  const handleDelete = (id: string) => {
    setStoreToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    
    try {
      await storesClient.delete(storeToDelete);
      toast({
        title: "Vector store deleted",
      });
      setDrawerOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setStoreToDelete(null);
    }
  };

  return (
    <>
      <StoresToolbar onCreate={() => setCreateOpen(true)} />

      {!isLoading && stores.length === 0 ? (
        <EmptyState
          icon={Database}
          title="Create your first vector store"
          subtitle="Add files to make them searchable by AI agents."
          actionLabel="Create store"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <StoresTable
          stores={stores}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      )}

      <CreateStoreDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <StoreDetailsDrawer
        store={selectedStore}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddFiles={handleAddFiles}
        onCreateAssistant={handleCreateAssistant}
        onDelete={handleDelete}
      />

      <AddFilesToStoreDialog
        open={addFilesOpen}
        files={files.filter(f => f.status === 'ready')}
        selectedIds={selectedFileIds}
        onChange={setSelectedFileIds}
        onClose={() => {
          setAddFilesOpen(false);
          setSelectedFileIds([]);
        }}
        onSubmit={handleSubmitFiles}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion of vector store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you would like to delete this vector store? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete vector store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
