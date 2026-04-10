import { NavLink, useNavigate } from "react-router-dom";
import {
  Bot,
  FileText,
  Users,
  Database,
  Workflow,
  ShoppingCart,
  LayoutDashboard,
  LayoutGrid,
  Activity,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { logoutRequest } from "@/auth/authApi";
import { canAccessRoute, PORTAL_LABELS, ROLE_LABELS } from "@/auth/config";
import logo from "@/assets/drayage-specialist-logo-white.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Activity Timeline", url: "/activity", icon: Activity },
  { title: "Agent Builder", url: "/agents", icon: Bot },
  { title: "Prompt Library", url: "/prompts", icon: FileText },
  { title: "Customer Config", url: "/customers", icon: Users },
  { title: "Integrations", url: "/integrations", icon: LayoutGrid },
  { title: "RAG Library", url: "/rag", icon: Database },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleNav = user
    ? navItems.filter((item) => canAccessRoute(user.role, item.url))
    : navItems;

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      /* still clear local session */
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  }

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
              {visibleNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      style={({ isActive }) =>
                        isActive
                          ? {
                              backgroundColor: 'rgba(255, 255, 255, 0.25)',
                              color: 'white',
                              fontWeight: 'bold',
                              borderLeft: '4px solid #22d3ee',
                              borderRadius: '6px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }
                          : {
                              color: 'rgba(255, 255, 255, 0.7)',
                            }
                      }
                      className="text-base w-full"
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

      {user && (
        <SidebarFooter className="border-t border-sidebar-border p-3 gap-2">
          <div className="text-xs text-sidebar-foreground/80 space-y-0.5 px-1">
            <p className="font-medium text-sidebar-foreground truncate" title={user.email}>
              {user.displayName}
            </p>
            <p className="truncate" title={PORTAL_LABELS[user.portal]}>
              {PORTAL_LABELS[user.portal]}
            </p>
            <p className="text-sidebar-foreground/60 truncate">{ROLE_LABELS[user.role]}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-sidebar-accent/30 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
