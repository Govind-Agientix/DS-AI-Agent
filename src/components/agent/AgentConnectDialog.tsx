import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AgentCategory, AgentCategoryPropertySchema } from "@/lib/agent/categoryTypes";
import {
  buildConnectConfig,
  editableConfigKeys,
  getDefaultForProperty,
  validateRequiredConnectFields,
} from "@/lib/agent/connectConfig";
import { connectAgent } from "@/lib/agent/clients/agentClient";
import { getApiErrorMessage } from "@/auth/authApi";
import { Loader2 } from "lucide-react";

interface AgentConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentLabel?: string;
  categories: AgentCategory[];
  onConnected: () => void;
}

function fieldLabel(key: string, prop: AgentCategoryPropertySchema): string {
  return prop.title ?? key;
}

function renderField(
  key: string,
  prop: AgentCategoryPropertySchema,
  value: unknown,
  onChange: (v: unknown) => void,
): ReactNode {
  const label = fieldLabel(key, prop);
  const desc = prop.description ? (
    <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
  ) : null;

  if (Array.isArray(prop.enum) && prop.enum.length > 0) {
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`connect-${key}`}>{label}</Label>
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger id={`connect-${key}`}>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {prop.enum.map((ev) => (
              <SelectItem key={String(ev)} value={String(ev)}>
                {String(ev)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {desc}
      </div>
    );
  }

  if (prop.type === "boolean") {
    return (
      <div key={key} className="flex flex-row items-center justify-between rounded-lg border p-3 gap-4">
        <div className="space-y-0.5 flex-1">
          <Label htmlFor={`connect-${key}`}>{label}</Label>
          {desc}
        </div>
        <Switch
          id={`connect-${key}`}
          checked={value === true || value === "true"}
          onCheckedChange={(c) => onChange(c)}
        />
      </div>
    );
  }

  if (prop.type === "integer") {
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`connect-${key}`}>{label}</Label>
        <Input
          id={`connect-${key}`}
          type="number"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => {
            const t = e.target.value;
            onChange(t === "" ? "" : Number.parseInt(t, 10));
          }}
        />
        {desc}
      </div>
    );
  }

  if (prop.type === "array" || (Array.isArray(prop.anyOf) && prop.anyOf.some((a) => a?.type === "array"))) {
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`connect-${key}`}>{label}</Label>
        <Input
          id={`connect-${key}`}
          placeholder="Comma-separated, e.g. follow, like, comment"
          value={typeof value === "string" ? value : Array.isArray(value) ? value.join(", ") : ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {desc}
      </div>
    );
  }

  if (prop.type === "object" && prop.additionalProperties) {
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`connect-${key}`}>{label}</Label>
        <Textarea
          id={`connect-${key}`}
          className="font-mono text-sm min-h-[100px]"
          placeholder='{"key": "value"}'
          value={typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2)}
          onChange={(e) => onChange(e.target.value)}
        />
        {desc}
      </div>
    );
  }

  const multiline =
    key === "notes" ||
    key === "password" ||
    (prop.format === "uri" && String(value ?? "").length > 80);

  if (multiline) {
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={`connect-${key}`}>{label}</Label>
        <Textarea
          id={`connect-${key}`}
          className="font-mono text-sm min-h-[80px]"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
        {desc}
      </div>
    );
  }

  return (
    <div key={key} className="space-y-2">
      <Label htmlFor={`connect-${key}`}>{label}</Label>
      <Input
        id={`connect-${key}`}
        type={prop.format === "uri" ? "url" : "text"}
        autoComplete="off"
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
      {desc}
    </div>
  );
}

export function AgentConnectDialog({
  open,
  onOpenChange,
  agentId,
  agentLabel,
  categories,
  onConnected,
}: AgentConnectDialogProps) {
  const [categoryType, setCategoryType] = useState<string>("");
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => categories.find((c) => c.type === categoryType),
    [categories, categoryType],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCategoryType((prev) => {
      if (prev && categories.some((c) => c.type === prev)) return prev;
      return categories[0]?.type ?? "";
    });
  }, [open, agentId, categories]);

  useEffect(() => {
    if (!selected) return;
    const next: Record<string, unknown> = {};
    for (const key of editableConfigKeys(selected)) {
      next[key] = getDefaultForProperty(key, selected.properties[key]!);
    }
    setValues(next);
  }, [selected]);

  const setField = (key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError("Select an agent category.");
      return;
    }
    const reqErr = validateRequiredConnectFields(selected, values);
    if (reqErr) {
      setError(reqErr);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const config = buildConnectConfig(selected, values);
      await connectAgent(agentId, { config });
      onConnected();
      onOpenChange(false);
    } catch (e) {
      setError(getApiErrorMessage(e, "Connect failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect agent</DialogTitle>
          <DialogDescription>
            {agentLabel ? (
              <>
                Configure and connect <span className="font-medium text-foreground">{agentLabel}</span>
                <span className="font-mono text-xs ml-1">({agentId})</span>
              </>
            ) : (
              <span className="font-mono text-sm">{agentId}</span>
            )}
            . Sends <code className="text-xs">POST .../connect</code> with a <code className="text-xs">config</code>{" "}
            block from the schema explorer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Category / config type</Label>
            <Select value={categoryType} onValueChange={setCategoryType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.type} value={c.type}>
                    {c.title || c.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected?.description ? (
              <p className="text-xs text-muted-foreground">{selected.description}</p>
            ) : null}
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories loaded. Use Refresh on the Schema explorer card or check{" "}
              <code className="text-xs">GET /api/v1/agents/categories</code>.
            </p>
          ) : null}

          {selected
            ? editableConfigKeys(selected).map((key) =>
                renderField(key, selected.properties[key]!, values[key], (v) => setField(key, v)),
              )
            : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !selected || categories.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
