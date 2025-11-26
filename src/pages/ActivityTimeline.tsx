import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

// Mock data for demonstration
const activities = [
  {
    id: "1",
    action: "Created order #ORD-2024-001",
    agent: "AI Agent - Traffix Processor",
    type: "agent",
    status: "completed",
    timestamp: "2025-10-01T14:30:00",
    reasoning: [
      "Extracted shipment details from Traffix tender PDF",
      "Validated container number UETU7322989 with ISO-6346 check digit",
      "Retrieved rate card: Line-haul $850.00, Fuel $127.50, Chassis $75.00",
      "Calculated total miles: 245 miles",
      "Mapped to Evans delivery system format",
      "Submitted order successfully"
    ]
  },
  {
    id: "2",
    action: "Checking port availability and terminal clearance",
    agent: "AI Agent - Port Monitor",
    type: "agent",
    status: "in-progress",
    timestamp: "2025-10-01T14:45:00",
    reasoning: [
      "Querying APM Terminals availability API",
      "Checking container release status for TCLU4567890",
      "Verifying customs clearance (in-bond examination)",
      "Awaiting terminal appointment confirmation..."
    ]
  },
  {
    id: "3",
    action: "Terminal Appointment Made",
    agent: "AI Agent - Global Terminal",
    type: "agent",
    status: "completed",
    timestamp: "2025-10-01T14:00:00",
    reasoning: [
      "Retrieved container arrival information",
      "Checked terminal availability for pickup slots",
      "Selected optimal time slot: Oct 2, 2025 10:00 AM",
      "Submitted appointment request to Global Terminal",
      "Received confirmation number: APT-2025-GT-4521",
      "Updated order with appointment details"
    ]
  },
  {
    id: "4",
    action: "Updated customer configuration",
    agent: "Drayage Specialist",
    type: "user",
    status: "completed",
    timestamp: "2025-10-01T13:15:00",
    reasoning: [
      "Modified billing preference: Set to 'Third Party' as default",
      "Added equipment alias: '40HC' → '40' High Cube'",
      "Updated detention policy: 120 free minutes for live unloads",
      "Saved configuration changes"
    ]
  },
  {
    id: "5",
    action: "Failed to extract data from booking confirmation",
    agent: "AI Agent - Document Processor",
    type: "agent",
    status: "failed",
    timestamp: "2025-10-01T12:00:00",
    reasoning: [
      "Received booking confirmation from MSC",
      "OCR extraction initiated",
      "Error: Vessel/Voyage information missing from document",
      "Error: ERD/VGM cut-off dates could not be parsed",
      "Escalated to manual review queue"
    ]
  },
  {
    id: "6",
    action: "Created customs release entry",
    agent: "AI Agent - Customs Handler",
    type: "agent",
    status: "completed",
    timestamp: "2025-10-01T11:30:00",
    reasoning: [
      "Extracted Form 3461 data",
      "Verified in-bond number: 123456789012",
      "Confirmed FDA may proceed flag",
      "Retrieved entry number: 123-4567890-1",
      "Validated arrival notice against customs data",
      "Submitted release to Evans system"
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "in-progress":
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; className: string }> = {
    completed: { label: "Completed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    "in-progress": { label: "In Progress", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" }
  };
  
  const variant = variants[status] || variants.completed;
  return <Badge className={variant.className}>{variant.label}</Badge>;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export default function ActivityTimeline() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Activity Timeline</h1>
        <p className="text-muted-foreground">
          Track all actions performed by users and AI agents
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            View detailed reasoning and timestamps for all operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline connector line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-[9px] top-12 bottom-[-16px] w-0.5 bg-border overflow-hidden">
                    {/* Chase animation only on first line */}
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-transparent via-primary to-transparent animate-chase-up" style={{ animationDuration: '3s' }} />
                    )}
                  </div>
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {activity.type === "agent" ? (
                            <Bot className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                          <span>{activity.agent}</span>
                          <span>•</span>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>

                    {/* Reasoning details accordion */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="reasoning" className="border-none">
                        <AccordionTrigger className="py-2 text-sm hover:no-underline">
                          View reasoning details
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {activity.reasoning.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex gap-2 text-sm text-muted-foreground pl-4 border-l-2 border-border"
                              >
                                <span className="text-primary font-medium">{idx + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
