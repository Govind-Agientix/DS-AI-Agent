import { NavLink } from "react-router-dom";
import {
  Bot,
  FileText,
  Users,
  Plug,
  Lock,
  Database,
  Workflow,
  ShoppingCart,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import logo from "@/assets/drayage-specialist-logo-white.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Activity Timeline", url: "/activity", icon: Activity },
  { title: "Agent Builder", url: "/agents", icon: Bot },
  { title: "Prompt Library", url: "/prompts", icon: FileText },
  { title: "Customer Config", url: "/customers", icon: Users },
  { title: "Connections", url: "/connections", icon: Plug },
  { title: "Credentials Manager", url: "/vault", icon: Lock },
  { title: "RAG Library", url: "/rag", icon: Database },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="Drayage Specialist" 
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">DS AI Agent</h1>
            <p className="text-xs text-sidebar-foreground/60">Logistics Automation</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium text-base"
                          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground text-base"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
