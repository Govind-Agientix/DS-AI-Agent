import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StoresToolbarProps {
  onCreate: () => void;
}

export function StoresToolbar({ onCreate }: StoresToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Vector stores</h2>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create
      </Button>
    </div>
  );
}
