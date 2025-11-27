import { useState, useEffect } from "react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  MoreVertical,
  X,
  Eye,
  EyeOff,
  Key,
  Lock,
  Shield,
  Globe,
  Copy,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
type CredentialType = "api-key" | "password" | "secret" | "env-var";

interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  value: string;
  description?: string;
  tags: string[];
  isEncrypted: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Dummy data
const generateDummyCredentials = (): Credential[] => {
  const types: CredentialType[] = ["api-key", "password", "secret", "env-var"];
  const credentials: Credential[] = [];

  for (let i = 1; i <= 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const tags = ["production", "development", "staging"].slice(0, Math.floor(Math.random() * 3) + 1);
    
    credentials.push({
      id: `cred-${i}`,
      name: `${type === "api-key" ? "API Key" : type === "password" ? "Password" : type === "secret" ? "Secret" : "Env Var"} ${i}`,
      type,
      value: type === "api-key" ? `sk_live_${Math.random().toString(36).substring(7)}` : "••••••••",
      description: `Description for ${type} credential ${i}`,
      tags,
      isEncrypted: true,
      lastUsed: i % 3 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      expiresAt: i % 5 === 0 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return credentials;
};

// Credential Dialog Component
interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Credential, "id" | "createdAt" | "updatedAt">) => void;
  credential?: Credential | null;
}

function CredentialDialog({ open, onClose, onSubmit, credential }: CredentialDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CredentialType>("api-key");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (credential && open) {
      setName(credential.name);
      setType(credential.type);
      setValue(credential.value);
      setDescription(credential.description || "");
      setTags(credential.tags.join(", "));
      setExpiresAt(credential.expiresAt ? credential.expiresAt.split("T")[0] : "");
    } else if (open) {
      setName("");
      setType("api-key");
      setValue("");
      setDescription("");
      setTags("");
      setExpiresAt("");
    }
  }, [credential, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    onSubmit({
      name,
      type,
      value,
      description,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      isEncrypted: true,
      expiresAt: expiresAt || undefined,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{credential ? "Edit Credential" : "Create Credential"}</DialogTitle>
          <DialogDescription>
            {credential ? "Update the credential details" : "Add a new credential to the vault"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Stripe API Key"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <Select value={type} onValueChange={(v) => setType(v as CredentialType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
                <SelectItem value="env-var">Environment Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Value *</label>
            <div className="relative">
              <Input
                type={showValue ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter credential value"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (e.g., production, api)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expires At</label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              {credential ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Vault() {
  const { toast } = useToast();

  const [currentTab, setCurrentTab] = useState<CredentialType>("api-key");
  const [credentials, setCredentials] = useState<Credential[]>(generateDummyCredentials());
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCredential, setEditCredential] = useState<Credential | null>(null);
  const [deleteCredential, setDeleteCredential] = useState<Credential | null>(null);
  const [viewCredential, setViewCredential] = useState<Credential | null>(null);
  const [showValue, setShowValue] = useState<{ [key: string]: boolean }>({});

  // Filter credentials based on current tab, search, and filters
  const filteredCredentials = credentials.filter((cred) => {
    const matchesTab = cred.type === currentTab;
    const matchesSearch = !searchQuery || 
      cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = tagFilter === "all" || cred.tags.includes(tagFilter);
    return matchesTab && matchesSearch && matchesTag;
  });

  // Get unique tags for filter
  const allTags = Array.from(new Set(credentials.flatMap(c => c.tags)));

  // Stats
  const stats = {
    total: credentials.length,
    apiKeys: credentials.filter(c => c.type === "api-key").length,
    passwords: credentials.filter(c => c.type === "password").length,
    secrets: credentials.filter(c => c.type === "secret").length,
    envVars: credentials.filter(c => c.type === "env-var").length,
    encrypted: credentials.filter(c => c.isEncrypted).length,
  };

  const handleCreate = (data: Omit<Credential, "id" | "createdAt" | "updatedAt">) => {
    const newCredential: Credential = {
      ...data,
      id: `cred-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCredentials([...credentials, newCredential]);
    toast({
      title: "Success!",
      description: "Credential created successfully",
    });
  };

  const handleUpdate = (data: Omit<Credential, "id" | "createdAt" | "updatedAt">) => {
    if (!editCredential) return;
    const updated = credentials.map(c =>
      c.id === editCredential.id
        ? { ...c, ...data, updatedAt: new Date().toISOString() }
        : c
    );
    setCredentials(updated);
    setEditCredential(null);
    toast({
      title: "Success!",
      description: "Credential updated successfully",
    });
  };

  const handleDelete = () => {
    if (!deleteCredential) return;
    setCredentials(credentials.filter(c => c.id !== deleteCredential.id));
    setDeleteCredential(null);
    toast({
      title: "Success!",
      description: "Credential deleted successfully",
    });
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: "Credential value copied to clipboard",
    });
  };

  const toggleShowValue = (id: string) => {
    setShowValue(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTypeIcon = (type: CredentialType) => {
    switch (type) {
      case "api-key":
        return <Key className="h-4 w-4" />;
      case "password":
        return <Lock className="h-4 w-4" />;
      case "secret":
        return <Shield className="h-4 w-4" />;
      case "env-var":
        return <Globe className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: CredentialType) => {
    switch (type) {
      case "api-key":
        return "API Key";
      case "password":
        return "Password";
      case "secret":
        return "Secret";
      case "env-var":
        return "Env Var";
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as CredentialType);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Credentials Manager</h1>
          <p className="text-muted-foreground">
            Securely store and manage API keys, passwords, secrets, and environment variables
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Credential
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Keys</p>
                <p className="text-2xl font-bold">{stats.apiKeys}</p>
              </div>
              <Key className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passwords</p>
                <p className="text-2xl font-bold">{stats.passwords}</p>
              </div>
              <Lock className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secrets</p>
                <p className="text-2xl font-bold">{stats.secrets}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encrypted</p>
                <p className="text-2xl font-bold">{stats.encrypted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="api-key">API Keys</TabsTrigger>
          <TabsTrigger value="password">Passwords</TabsTrigger>
          <TabsTrigger value="secret">Secrets</TabsTrigger>
          <TabsTrigger value="env-var">Environment Variables</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search credentials by name, description, or tags..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCredentials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No credentials found</p>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Credential
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credential</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCredentials.map((credential) => (
                      <TableRow key={credential.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(credential.type)}
                              <div className="font-medium">{credential.name}</div>
                            </div>
                            {credential.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {credential.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {showValue[credential.id] ? credential.value : "••••••••"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleShowValue(credential.id)}
                            >
                              {showValue[credential.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(credential.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {credential.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {credential.lastUsed ? (
                            <div className="text-sm text-muted-foreground">
                              {new Date(credential.lastUsed).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {credential.expiresAt ? (
                            <div className="flex items-center gap-1">
                              {new Date(credential.expiresAt) < new Date() ? (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {new Date(credential.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewCredential(credential)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditCredential(credential)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopy(credential.value)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Value
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteCredential(credential)}
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
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <CredentialDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <CredentialDialog
        open={!!editCredential}
        onClose={() => setEditCredential(null)}
        onSubmit={handleUpdate}
        credential={editCredential}
      />

      {/* View Dialog */}
      <Dialog open={!!viewCredential} onOpenChange={() => setViewCredential(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewCredential?.name}</DialogTitle>
            <DialogDescription>{viewCredential?.description}</DialogDescription>
          </DialogHeader>
          {viewCredential && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(viewCredential.type)}
                    <span>{getTypeLabel(viewCredential.type)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {viewCredential.isEncrypted ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Encrypted</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Value</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type={showValue[viewCredential.id] ? "text" : "password"}
                    value={viewCredential.value}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowValue(viewCredential.id)}
                  >
                    {showValue[viewCredential.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(viewCredential.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewCredential.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewCredential.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm mt-1">
                    {new Date(viewCredential.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated</label>
                  <p className="text-sm mt-1">
                    {new Date(viewCredential.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {viewCredential.lastUsed && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Used</label>
                  <p className="text-sm mt-1">
                    {new Date(viewCredential.lastUsed).toLocaleString()}
                  </p>
                </div>
              )}

              {viewCredential.expiresAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires At</label>
                  <div className="flex items-center gap-2 mt-1">
                    {new Date(viewCredential.expiresAt) < new Date() ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    )}
                    <p className="text-sm">
                      {new Date(viewCredential.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCredential(null)}>
              Close
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => {
                setEditCredential(viewCredential);
                setViewCredential(null);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCredential} onOpenChange={() => setDeleteCredential(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteCredential?.name}"? This action cannot be undone
              and may affect systems using this credential.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCredential(null)}>
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
