import type { ReactNode } from "react";
import logo from "@/assets/drayage-specialist-logo-white.png";

type AuthPageShellProps = {
  /** Short paragraph shown in the brand column (desktop) and can inform mobile context. */
  asideCopy: string;
  children: ReactNode;
};

export function AuthPageShell({ asideCopy, children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-sidebar-border lg:border-b-0 lg:border-r lg:w-[min(42%,520px)] lg:min-w-[320px] lg:shrink-0">
        <div aria-hidden className="absolute inset-0 bg-sidebar" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,hsl(var(--sidebar-ring)),transparent_55%)]"
        />
        <div className="relative z-10 p-8 sm:p-10 lg:p-12 lg:py-14 flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-sidebar-accent/80 p-2.5 ring-1 ring-sidebar-ring/30 shadow-elevated">
              <img src={logo} alt="Drayage Specialist" className="h-11 w-11 object-contain" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sidebar-foreground">
                DS AI Agent
              </h1>
              <p className="text-sm text-sidebar-foreground/70 mt-1">Logistics Automation</p>
            </div>
          </div>
          <div className="hidden sm:block space-y-3 max-w-sm">
            <p className="text-sm leading-relaxed text-sidebar-foreground/85">{asideCopy}</p>
            <div className="h-1 w-12 rounded-full bg-gradient-primary" />
          </div>
        </div>
        <div className="relative z-10 px-8 sm:px-10 lg:px-12 pb-8 lg:pb-12 hidden lg:block">
          <p className="text-xs text-sidebar-foreground/45 leading-relaxed">
            © {new Date().getFullYear()} Drayage Specialist · Secure access
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        {children}
      </main>
    </div>
  );
}
