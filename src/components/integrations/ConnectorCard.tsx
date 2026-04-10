import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectorBrandIcon } from "@/components/integrations/ConnectorBrandIcon";
import type { Connector } from "@/lib/integrations/types";
import { AUTH_METHOD_LABELS, CONNECTOR_CATEGORY_LABELS } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

interface ConnectorCardProps {
  connector: Connector;
  onOpen: (connector: Connector) => void;
}

export function ConnectorCard({ connector, onOpen }: ConnectorCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(connector)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(connector);
        }
      }}
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "border border-border/80 bg-card shadow-[var(--shadow-card)]",
        "hover:border-primary/35 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-background shadow-inner"
            aria-hidden
          >
            <ConnectorBrandIcon connectorId={connector.id} name={connector.name} />
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px] font-medium uppercase tracking-wide">
            {CONNECTOR_CATEGORY_LABELS[connector.category]}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {connector.name}
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 text-sm">{connector.tagline}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {AUTH_METHOD_LABELS[connector.authMethod]}
          </Badge>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {connector.tools.length} tools
          </Badge>
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(connector);
          }}
        >
          View details
        </Button>
      </CardContent>
    </Card>
  );
}
