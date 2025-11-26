import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchemaField {
  key: string;
  type: "string" | "number" | "boolean" | "date" | "datetime" | "object" | "array";
  nested?: Record<string, SchemaField>;
  required?: boolean;
}

interface SchemaBuilderProps {
  schema: Record<string, any>;
  onChange: (schema: Record<string, any>) => void;
}

const FIELD_TYPES = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "DateTime" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
] as const;

export function SchemaBuilder({ schema, onChange }: SchemaBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const updateSchema = (path: string[], value: any) => {
    const newSchema = JSON.parse(JSON.stringify(schema));
    let current: any = newSchema;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onChange(newSchema);
  };

  const deleteField = (path: string[]) => {
    const newSchema = JSON.parse(JSON.stringify(schema));
    let current: any = newSchema;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    delete current[path[path.length - 1]];
    onChange(newSchema);
  };

  const addField = (path: string[] = []) => {
    const newSchema = JSON.parse(JSON.stringify(schema));
    let current: any = newSchema;
    
    for (const key of path) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const newKey = `field_${Date.now()}`;
    current[newKey] = "string";
    onChange(newSchema);
  };

  const renderField = (key: string, value: any, path: string[] = [], parentPath = ""): JSX.Element => {
    const fullPath = parentPath ? `${parentPath}.${key}` : key;
    const isExpanded = expandedFields.has(fullPath);
    const isObject = typeof value === "object" && value !== null && !Array.isArray(value);

    return (
      <div key={fullPath} className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isObject && (
              <button
                type="button"
                onClick={() => toggleExpand(fullPath)}
                className="p-0.5 hover:bg-background rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <Input
              value={key}
              onChange={(e) => {
                const newKey = e.target.value;
                if (newKey && newKey !== key) {
                  const newSchema = JSON.parse(JSON.stringify(schema));
                  let current: any = newSchema;
                  for (let i = 0; i < path.length; i++) {
                    current = current[path[i]];
                  }
                  current[newKey] = current[key];
                  delete current[key];
                  onChange(newSchema);
                }
              }}
              className="h-8 flex-1 min-w-0"
              placeholder="Field name"
            />
            {!isObject && (
              <Select
                value={typeof value === "string" ? value : "object"}
                onValueChange={(newType) => {
                  if (newType === "object") {
                    updateSchema([...path, key], {});
                  } else {
                    updateSchema([...path, key], newType);
                  }
                }}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isObject && (
              <Badge variant="secondary" className="w-32 justify-center">
                Object
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => deleteField([...path, key])}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isObject && isExpanded && (
          <div className="ml-6 pl-4 border-l-2 border-border space-y-2">
            {Object.entries(value).map(([nestedKey, nestedValue]) =>
              renderField(nestedKey, nestedValue, [...path, key], fullPath)
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addField([...path, key])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Output Schema</CardTitle>
            <CardDescription>
              Define the JSON structure that the agent will return
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addField()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-2">
            {Object.keys(schema).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No fields defined</p>
                <Button type="button" variant="outline" size="sm" onClick={() => addField()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Field
                </Button>
              </div>
            ) : (
              Object.entries(schema).map(([key, value]) => renderField(key, value))
            )}
          </div>
        </ScrollArea>
        <div className="mt-4 pt-4 border-t">
          <Label className="text-xs font-mono text-muted-foreground">Schema Preview (JSON)</Label>
          <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
