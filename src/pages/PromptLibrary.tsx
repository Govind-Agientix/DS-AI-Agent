import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Edit, Copy, Archive, Play, MoreVertical, Filter, X } from "lucide-react";
import { CreateEditPromptDialog } from "@/components/prompt/CreateEditPromptDialog";
import { TestPromptDialog } from "@/components/prompt/TestPromptDialog";
import { promptClient } from "@/lib/prompt/clients/promptClient";
import { Prompt, type PromptFormData } from "@/lib/prompt/types";
import { DOCUMENT_TYPES_FOR_PROMPTS, PROMPT_SCOPES } from "@/lib/prompt/types";
import { useToast } from "@/hooks/use-toast";

export default function PromptLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    docType?: string;
    scope?: string;
    status?: string;
  }>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [testPrompt, setTestPrompt] = useState<Prompt | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<Prompt | null>(null);
  const [archivePrompt, setArchivePrompt] = useState<Prompt | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch prompts with filters
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["prompts", searchQuery, filters],
    queryFn: () =>
      promptClient.list({
        search: searchQuery || undefined,
        ...filters,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PromptFormData) => promptClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Prompt created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prompt",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromptFormData> }) =>
      promptClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setEditPrompt(null);
      toast({
        title: "Success!",
        description: "Prompt updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prompt",
        variant: "destructive",
      });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      promptClient.duplicate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({
        title: "Success!",
        description: "Prompt duplicated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate prompt",
        variant: "destructive",
      });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => promptClient.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setArchivePrompt(null);
      toast({
        title: "Success!",
        description: "Prompt archived successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive prompt",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => promptClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setDeletePrompt(null);
      toast({
        title: "Success!",
        description: "Prompt deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prompt",
        variant: "destructive",
      });
    },
  });

  const handleCreate = async (data: PromptFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: PromptFormData) => {
    if (!editPrompt) return;
    await updateMutation.mutateAsync({ id: editPrompt.id, data });
  };

  const handleDuplicate = (prompt: Prompt) => {
    duplicateMutation.mutate({ id: prompt.id, newName: `${prompt.name} (Copy)` });
  };

  const handleArchive = () => {
    if (!archivePrompt) return;
    archiveMutation.mutate(archivePrompt.id);
  };

  const handleDelete = () => {
    if (!deletePrompt) return;
    deleteMutation.mutate(deletePrompt.id);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || filters.docType || filters.scope || filters.status;

  const getScopeColor = (scope: string) => {
    return scope === "Global" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "draft":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "archived":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prompt Library</h1>
          <p className="text-muted-foreground">
            Create, manage, and version your optimized AI prompts
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts by name, document type, or customer..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={filters.docType || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, docType: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DOCUMENT_TYPES_FOR_PROMPTS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scope</label>
                <Select
                  value={filters.scope || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, scope: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All scopes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    {PROMPT_SCOPES.map((scope) => (
                      <SelectItem key={scope.value} value={scope.value}>
                        {scope.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading prompts...</div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No prompts found</p>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prompt
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt Name</TableHead>
                  <TableHead>Doc Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Edited</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{prompt.name}</div>
                        {prompt.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {prompt.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{prompt.docType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScopeColor(prompt.scope)}>{prompt.scope}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prompt.status)}>{prompt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{prompt.version}</TableCell>
                    <TableCell className="text-muted-foreground">{prompt.lastEdited}</TableCell>
                    <TableCell className="text-muted-foreground">{prompt.owner}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {prompt.usageCount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Test prompt"
                          onClick={() => setTestPrompt(prompt)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditPrompt(prompt)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(prompt)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setArchivePrompt(prompt)}
                              disabled={prompt.status === "archived"}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletePrompt(prompt)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Keep prompts short and focused</p>
            <p>• Use 1-3 few-shot examples maximum</p>
            <p>• Define strict JSON schemas</p>
            <p>• Version prompts for rollback capability</p>
            <p>• Test with real documents before deploying</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Prompt Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Base prompt (document guidance)</p>
            <p>• Few-shot examples (1-3 samples)</p>
            <p>• Variable injection points</p>
            <p>• JSON schema definition</p>
            <p>• Validation rules</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use the Test Prompt feature</p>
            <p>• Paste sample document text</p>
            <p>• Review extracted JSON output</p>
            <p>• Check validation results</p>
            <p>• Iterate before publishing</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <CreateEditPromptDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <CreateEditPromptDialog
        open={!!editPrompt}
        onClose={() => setEditPrompt(null)}
        onSubmit={handleUpdate}
        prompt={editPrompt}
      />

      {/* Test Dialog */}
      <TestPromptDialog
        open={!!testPrompt}
        onClose={() => setTestPrompt(null)}
        prompt={testPrompt}
      />

      {/* Archive Confirmation Dialog */}
      <Dialog open={!!archivePrompt} onOpenChange={() => setArchivePrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive "{archivePrompt?.name}"? This will mark it as
              archived but won't delete it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchivePrompt(null)}>
              Cancel
            </Button>
            <Button onClick={handleArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePrompt} onOpenChange={() => setDeletePrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletePrompt?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePrompt(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}