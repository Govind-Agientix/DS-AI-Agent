export interface AgentConfig {
  id?: string;
  name: string;
  customer: string;
  documentType: string;
  office: string;
  serviceType: string;
  loadType: string;
  instructions: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Options for `document_type` on agent create (snake_case API values). */
export const AGENT_DOCUMENT_TYPES = [
  { value: "booking_confirmation", label: "Booking confirmation" },
  { value: "work_order", label: "Work order" },
  { value: "delivery_order", label: "Delivery order" },
  { value: "trip_sheet", label: "Trip sheet" },
  { value: "customs_release", label: "Customs release" },
  { value: "prenote", label: "Prenote" },
  { value: "rate_confirmation", label: "Rate confirmation" },
] as const;

export const CUSTOMERS = [
  { value: "acme", label: "ACME" },
  { value: "crowley", label: "Crowley Logistics" },
  { value: "imc", label: "IMC Companies" },
  { value: "arc", label: "ARC Logistics" },
  { value: "chr", label: "CHR Logistics" },
  { value: "traffix", label: "Traffix" },
] as const;

/** Shared with customer config (default office codes). */
export const OFFICES = [
  { value: "la", label: "Los Angeles" },
  { value: "oakland", label: "Oakland" },
  { value: "seattle", label: "Seattle" },
] as const;

/** Shared with customer config. */
export const SERVICE_TYPES = [
  { value: "drayage", label: "Drayage" },
  { value: "transload", label: "Transload" },
  { value: "warehousing", label: "Warehousing" },
] as const;

/** `evans_office_location` values for POST /agents/create. */
export const AGENT_EVANS_OFFICES = [
  { value: "NYC", label: "NYC" },
  { value: "Los Angeles", label: "Los Angeles" },
  { value: "Oakland", label: "Oakland" },
  { value: "Seattle", label: "Seattle" },
] as const;

/** `service_type` values for POST /agents/create. */
export const AGENT_SERVICE_TYPES = [
  { value: "freight_forwarding", label: "Freight forwarding" },
  { value: "transload", label: "Transload" },
  { value: "warehousing", label: "Warehousing" },
] as const;

export const LOAD_TYPES = [
  { value: "import", label: "Import" },
  { value: "export", label: "Export" },
  { value: "domestic", label: "Domestic" },
] as const;
