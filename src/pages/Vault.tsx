import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Vault() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Credentials Manager</h1>
        <p className="text-muted-foreground">
          Securely store and manage API keys, passwords, and secrets
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Encrypted storage for portal credentials and environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
