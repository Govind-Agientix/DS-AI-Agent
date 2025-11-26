import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Workflows() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Workflows & Automation</h1>
        <p className="text-muted-foreground">
          Build no-code automation workflows with triggers and steps
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Visual workflow builder for end-to-end document automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
