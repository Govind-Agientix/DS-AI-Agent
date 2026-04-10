import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectorCard } from "@/components/integrations/ConnectorCard";
import { ConnectorDetailDrawer } from "@/components/integrations/ConnectorDetailDrawer";
import { STATIC_CONNECTORS } from "@/lib/integrations/staticConnectors";
import type { Connector, ConnectorCategoryId } from "@/lib/integrations/types";
import { CONNECTOR_CATEGORY_LABELS } from "@/lib/integrations/types";
import { useToast } from "@/hooks/use-toast";
import { LayoutGrid, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: (ConnectorCategoryId | "all")[] = [
  "all",
  "communication",
  "storage",
  "database",
  "logistics",
  "business",
];

export default function Integrations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ConnectorCategoryId | "all">("all");
  const [selected, setSelected] = useState<Connector | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STATIC_CONNECTORS.filter((c) => {
      const catOk = category === "all" || c.category === category;
      if (!catOk) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.tagline} ${c.description} ${CONNECTOR_CATEGORY_LABELS[c.category]}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search, category]);

  function openConnector(c: Connector) {
    setSelected(c);
    setDrawerOpen(true);
  }

  function handleConnect(c: Connector) {
    toast({
      title: "Coming in Sprint 2",
      description: `Setup wizard for ${c.name} will call POST /api/connections when the API is ready.`,
    });
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-full bg-background">
      <div
        className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <LayoutGrid className="h-8 w-8" aria-hidden />
                <span className="text-sm font-semibold uppercase tracking-wider">Integrations</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Integration Directory</h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Browse connectors like an app store, then connect each service through a guided flow.
                Your existing encrypted credentials and connection health checks stay on the backend—this
                page is the friendly front end.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or use case…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-background/80"
                aria-label="Search integrations"
              />
            </div>
            <p className="text-sm text-muted-foreground sm:ml-auto">
              {filtered.length} of {STATIC_CONNECTORS.length} connectors
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {CATEGORY_ORDER.map((id) => {
              const label =
                id === "all" ? "All" : CONNECTOR_CATEGORY_LABELS[id as ConnectorCategoryId];
              const active = category === id;
              return (
                <Button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    active && "shadow-sm"
                  )}
                  onClick={() => setCategory(id)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <p className="text-lg font-medium">No integrations match your filters</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a different search term or clear the category filter.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.id}>
                <ConnectorCard connector={c} onOpen={openConnector} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConnectorDetailDrawer
        connector={selected}
        open={drawerOpen && selected !== null}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setSelected(null);
        }}
        onConnect={handleConnect}
      />
    </div>
  );
}
