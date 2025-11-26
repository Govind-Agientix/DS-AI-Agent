import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Orders() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground">
          Process, validate, and submit logistics orders
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Upload documents, extract data, preview fills, and submit orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
