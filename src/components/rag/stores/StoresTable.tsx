import { VectorStore } from "@/lib/rag/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusTag } from "../StatusTag";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/rag/utils";

interface StoresTableProps {
  stores: VectorStore[];
  isLoading: boolean;
  onRowClick: (store: VectorStore) => void;
}

export function StoresTable({ stores, isLoading, onRowClick }: StoresTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow
              key={store.id}
              onClick={() => onRowClick(store)}
              className="cursor-pointer"
            >
              <TableCell>
                <div>
                  <p className="font-medium">{store.name}</p>
                  {store.description && (
                    <p className="text-xs text-muted-foreground">{store.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {store.filesCount}
              </TableCell>
              <TableCell>
                <StatusTag status={store.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {store.lastActive ? formatDate(store.lastActive) : 'Never'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
