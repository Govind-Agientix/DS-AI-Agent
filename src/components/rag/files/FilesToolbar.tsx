import { Button } from "@/components/ui/button";
import { BookOpen, Upload } from "lucide-react";

interface FilesToolbarProps {
  onUploadClick: () => void;
  onLearnMoreClick: () => void;
}

export function FilesToolbar({ onUploadClick, onLearnMoreClick }: FilesToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Files</h2>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onLearnMoreClick}>
          <BookOpen className="h-4 w-4 mr-2" />
          Learn more
        </Button>
        <Button onClick={onUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
}
