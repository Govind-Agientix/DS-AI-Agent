import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { filesClient } from "@/lib/rag/clients/filesClient";
import { FilesToolbar } from "@/components/rag/files/FilesToolbar";
import { FilesTable } from "@/components/rag/files/FilesTable";
import { FileDetailsDrawer } from "@/components/rag/files/FileDetailsDrawer";
import { UploadDialog } from "@/components/rag/files/UploadDialog";
import { EmptyState } from "@/components/rag/EmptyState";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RagFile, FileDetail } from "@/lib/rag/types";
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

export default function RAGFiles() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileDetail | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: ['rag-files'],
    queryFn: filesClient.list,
    refetchInterval: (query) =>
      query.state.data?.some((f) => f.status === 'processing') ? 3000 : false,
  });

  const handleUpload = async (uploadedFiles: File[]) => {
    try {
      await filesClient.upload(uploadedFiles);
      toast({
        title: "Upload started",
        description: `Processing ${uploadedFiles.length} file(s)...`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = async (file: RagFile) => {
    const detail = await filesClient.detail(file.id);
    setSelectedFile(detail);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setFileToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      await filesClient.delete(fileToDelete);
      toast({
        title: "File deleted",
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
      setFileToDelete(null);
    }
  };

  const handleLearnMore = () => {
    window.open("https://docs.lovable.dev/features/cloud", "_blank");
  };

  return (
    <>
      <FilesToolbar
        onUploadClick={() => setUploadOpen(true)}
        onLearnMoreClick={handleLearnMore}
      />

      {!isLoading && files.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No files yet"
          subtitle="Upload PDFs, DOCX, TXT, or CSV to add ground-truth knowledge for your agents."
          actionLabel="Upload files"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <FilesTable
          files={files}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />

      <FileDetailsDrawer
        file={selectedFile}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDelete={handleDelete}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete file
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
