import type { ComponentType, SVGProps } from "react";
import {
  SiGmail,
  SiGoogledrive,
  SiSlack,
  SiStripe,
  SiSupabase,
  SiZoho,
} from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa6";
import { Code2, Server, Ship, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

interface BrandEntry {
  Icon: IconComponent;
  /** Tailwind classes for brand color (react-icons / lucide inherit currentColor). */
  className: string;
}

/**
 * Maps Integration Directory connector `id` (from `staticConnectors`) to a brand or semantic icon.
 */
const CONNECTOR_BRAND_ICONS: Record<string, BrandEntry> = {
  gmail: { Icon: SiGmail as IconComponent, className: "text-[#EA4335]" },
  outlook: { Icon: FaMicrosoft as IconComponent, className: "text-[#0078D4]" },
  slack: { Icon: SiSlack as IconComponent, className: "text-[#4A154B]" },
  "google-drive": { Icon: SiGoogledrive as IconComponent, className: "text-[#4285F4]" },
  supabase: { Icon: SiSupabase as IconComponent, className: "text-[#3ECF8E]" },
  sftp: { Icon: Server as IconComponent, className: "text-slate-600 dark:text-slate-400" },
  "carrier-tms": { Icon: Truck as IconComponent, className: "text-amber-600 dark:text-amber-500" },
  "terminal-portal": { Icon: Ship as IconComponent, className: "text-sky-600 dark:text-sky-500" },
  "zoho-desk": { Icon: SiZoho as IconComponent, className: "text-[#C8202B]" },
  stripe: { Icon: SiStripe as IconComponent, className: "text-[#635BFF]" },
  "custom-rest": { Icon: Code2 as IconComponent, className: "text-primary" },
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return letters || "?";
}

export interface ConnectorBrandIconProps {
  connectorId: string;
  name: string;
  /** Icon dimensions (default fits the 11×11 / 14×14 card headers). */
  iconClassName?: string;
  className?: string;
}

export function ConnectorBrandIcon({
  connectorId,
  name,
  iconClassName = "h-7 w-7",
  className,
}: ConnectorBrandIconProps) {
  const entry = CONNECTOR_BRAND_ICONS[connectorId];
  if (!entry) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-[0.65rem] font-bold uppercase text-white",
          className,
        )}
        aria-hidden
      >
        {initialsFromName(name)}
      </div>
    );
  }

  const { Icon, className: brandClass } = entry;
  return <Icon className={cn(iconClassName, brandClass, className)} aria-hidden />;
}
