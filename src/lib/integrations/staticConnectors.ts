import type { Connector } from "./types";

/** Eleven Day-1 connectors from Integration Directory spec §3 (static until GET /api/connectors). */
export const STATIC_CONNECTORS: Connector[] = [
  {
    id: "gmail",
    name: "Gmail",
    tagline: "Receive and classify logistics email",
    description:
      "Connect Google Workspace Gmail so Traffix Processor and related agents can read delivery orders, terminal notices, and customer threads. Credentials are stored encrypted in the existing vault.",
    category: "communication",
    authMethod: "oauth",
    tools: [
      { name: "list_messages", description: "Search and list messages by label or query" },
      { name: "get_message", description: "Fetch full thread content and attachments metadata" },
      { name: "send_reply", description: "Send templated replies from approved workflows" },
    ],
    agentUseCases: ["Traffix Processor — inbound orders", "Email triage and routing"],
    documentationUrl: "https://developers.google.com/gmail/api",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    tagline: "Microsoft 365 mailboxes",
    description:
      "Connect Outlook / Microsoft 365 for carriers standardized on Microsoft email. Same agent capabilities as Gmail with Entra-backed authentication.",
    category: "communication",
    authMethod: "oauth",
    tools: [
      { name: "list_mail", description: "List folders and messages" },
      { name: "read_message", description: "Read message body and headers" },
      { name: "send_mail", description: "Send from connected mailbox" },
    ],
    agentUseCases: ["Order intake from Outlook", "Shared operations inbox"],
    documentationUrl: "https://learn.microsoft.com/graph/api/resources/mail-api-overview",
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "Team alerts and slash-command hooks",
    description:
      "Post status updates, exception alerts, and human-in-the-loop prompts to your workspace channels.",
    category: "communication",
    authMethod: "oauth",
    tools: [
      { name: "post_message", description: "Post to a channel or thread" },
      { name: "list_channels", description: "Discover channels the app can use" },
      { name: "upload_file", description: "Share documents from workflows" },
    ],
    agentUseCases: ["Dispatcher alerts", "Failed automation escalation"],
    documentationUrl: "https://api.slack.com/",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    tagline: "BOL, POD, and document storage",
    description:
      "Link Google Drive for Document Processor to store and retrieve bills of lading, proofs of delivery, and customs paperwork.",
    category: "storage",
    authMethod: "oauth",
    tools: [
      { name: "list_files", description: "Search files by folder or query" },
      { name: "get_file", description: "Download file content" },
      { name: "create_file", description: "Upload generated documents" },
    ],
    agentUseCases: ["Document Processor — BOL archive", "Shared customer folders"],
    documentationUrl: "https://developers.google.com/drive",
  },
  {
    id: "supabase",
    name: "Supabase",
    tagline: "Postgres + REST for app data",
    description:
      "Use Supabase as a managed database and API layer for custom workflows and customer-scoped data.",
    category: "database",
    authMethod: "api_key",
    tools: [
      { name: "sql_query", description: "Parameterized queries via REST/RPC" },
      { name: "realtime", description: "Subscribe to row changes where enabled" },
      { name: "storage", description: "Optional object storage bucket access" },
    ],
    agentUseCases: ["Custom TMS mirrors", "Analytics sidecars"],
    documentationUrl: "https://supabase.com/docs",
  },
  {
    id: "sftp",
    name: "SFTP / FTP",
    tagline: "Secure file exchange with partners",
    description:
      "Connect SFTP or FTPS endpoints for EDI-style drops and pickups without exposing raw host details in prompts.",
    category: "database",
    authMethod: "api_key",
    tools: [
      { name: "list_remote", description: "List remote paths" },
      { name: "get_file", description: "Pull inbound files" },
      { name: "put_file", description: "Push outbound files" },
    ],
    agentUseCases: ["Carrier file drops", "Legacy TMS batch files"],
  },
  {
    id: "carrier-tms",
    name: "Carrier TMS",
    tagline: "REST API to your transportation management system",
    description:
      "Generic REST connector for major TMS products. Supply base URL and API credentials; adapters map endpoints to agent tools.",
    category: "logistics",
    authMethod: "api_key",
    tools: [
      { name: "list_loads", description: "Query open and assigned loads" },
      { name: "update_status", description: "Push status and milestone updates" },
      { name: "get_reference", description: "Resolve references by PRO or container" },
    ],
    agentUseCases: ["Traffix Processor — load sync", "Dispatcher workflows"],
  },
  {
    id: "terminal-portal",
    name: "Terminal & port portal",
    tagline: "Browser session to terminal websites",
    description:
      "Session-authenticated access to marine and rail terminal portals for availability and cutoff checks (Port Monitor). Uses managed browser sessions with anti-bot safeguards.",
    category: "logistics",
    authMethod: "session",
    tools: [
      { name: "query_availability", description: "Check container or chassis availability" },
      { name: "appointment_window", description: "Read appointment slots where exposed" },
      { name: "document_pickup", description: "Locate release or pickup status" },
    ],
    agentUseCases: ["Port Monitor — container availability", "Cutoff reminders"],
  },
  {
    id: "zoho-desk",
    name: "Zoho Desk",
    tagline: "Customer support tickets",
    description:
      "Integrate Zoho Desk so agents can open, update, and resolve customer issues with full audit trail.",
    category: "business",
    authMethod: "oauth",
    tools: [
      { name: "list_tickets", description: "Search tickets by status and assignee" },
      { name: "get_ticket", description: "Fetch thread and custom fields" },
      { name: "reply_ticket", description: "Add public or internal notes" },
    ],
    agentUseCases: ["Customer exception handling", "Ops-to-support handoff"],
    documentationUrl: "https://www.zoho.com/desk/help/api/",
  },
  {
    id: "stripe",
    name: "Stripe",
    tagline: "Payments and billing metadata",
    description:
      "Read-only or restricted Stripe access for matching shipments to invoices and payment status where your process requires it.",
    category: "business",
    authMethod: "api_key",
    tools: [
      { name: "list_charges", description: "Search charges and payment intents" },
      { name: "get_customer", description: "Resolve customer billing profile" },
      { name: "list_invoices", description: "List open and paid invoices" },
    ],
    agentUseCases: ["Billing reconciliation", "Credit holds"],
    documentationUrl: "https://stripe.com/docs/api",
  },
  {
    id: "custom-rest",
    name: "Custom REST API",
    tagline: "Any HTTPS API with key or bearer auth",
    description:
      "Generic connector for internal microservices, webhooks, or partner APIs not yet modeled as a first-class card.",
    category: "business",
    authMethod: "api_key",
    tools: [
      { name: "invoke", description: "Configured GET/POST routes with secrets from vault" },
      { name: "health_ping", description: "Lightweight connectivity check" },
    ],
    agentUseCases: ["Internal tools", "Partner bridges until a dedicated card ships"],
  },
];
