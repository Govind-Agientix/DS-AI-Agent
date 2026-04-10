import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConnectorBrandIcon } from "@/components/integrations/ConnectorBrandIcon";
import type { Connector } from "@/lib/integrations/types";
import {
  AUTH_METHOD_LABELS,
  CONNECTOR_CATEGORY_LABELS,
} from "@/lib/integrations/types";
import { ExternalLink, Plug, Sparkles, Wrench } from "lucide-react";

interface ConnectorDetailDrawerProps {
  connector: Connector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (connector: Connector) => void;
}

export function ConnectorDetailDrawer({
  connector,
  open,
  onOpenChange,
  onConnect,
}: ConnectorDetailDrawerProps) {
  if (!connector) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b bg-muted/30 px-6 py-6 text-left">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-md"
              aria-hidden
            >
              <ConnectorBrandIcon
                connectorId={connector.id}
                name={connector.name}
                iconClassName="h-10 w-10"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl leading-snug">{connector.name}</SheetTitle>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                {connector.tagline}
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">{CONNECTOR_CATEGORY_LABELS[connector.category]}</Badge>
                <Badge variant="outline">{AUTH_METHOD_LABELS[connector.authMethod]}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                About this integration
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{connector.description}</p>
              {connector.documentationUrl && (
                <a
                  href={connector.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Provider documentation
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Wrench className="h-4 w-4 text-primary" />
                Tools exposed to agents
              </h3>
              <ul className="space-y-3">
                {connector.tools.map((tool) => (
                  <li
                    key={tool.name}
                    className="rounded-lg border bg-card px-3 py-2.5 text-sm shadow-sm"
                  >
                    <code className="text-xs font-semibold text-primary">{tool.name}</code>
                    <p className="mt-1 text-muted-foreground">{tool.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Plug className="h-4 w-4 text-primary" />
                Powers these capabilities
              </h3>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                {connector.agentUseCases.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </section>
          </div>
        </ScrollArea>

        <div className="border-t bg-background p-6">
          <Button
            type="button"
            className="w-full gap-2"
            size="lg"
            onClick={() => onConnect(connector)}
          >
            <Plug className="h-4 w-4" />
            Connect
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Setup wizard and live API wiring ship in Sprint 2. Encrypted storage uses your existing
            Credentials Manager backend.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
