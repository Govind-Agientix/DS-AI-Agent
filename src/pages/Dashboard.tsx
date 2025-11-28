import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bot,
  FileText,
  Users,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Zap,
} from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: "Active Agents", value: "12", icon: Bot, change: "+3 this month", trend: "up" },
    { title: "Prompts", value: "24", icon: FileText, change: "8 updated recently", trend: "neutral" },
    { title: "Customers", value: "8", icon: Users, change: "+2 new", trend: "up" },
    { title: "Success Rate", value: "94%", icon: TrendingUp, change: "+5% this week", trend: "up" },
  ];

  // Performance data for charts
  const performanceData = [
    { month: "Jan", orders: 45, success: 42, failed: 3 },
    { month: "Feb", orders: 52, success: 48, failed: 4 },
    { month: "Mar", orders: 48, success: 45, failed: 3 },
    { month: "Apr", orders: 61, success: 57, failed: 4 },
    { month: "May", orders: 55, success: 52, failed: 3 },
    { month: "Jun", orders: 67, success: 63, failed: 4 },
    { month: "Jul", orders: 72, success: 68, failed: 4 },
  ];

  const agentStatusData = [
    { name: "Traffix Processor", status: "active", orders: 23, success: 98 },
    { name: "Port Monitor", status: "active", orders: 18, success: 95 },
    { name: "Global Terminal", status: "active", orders: 15, success: 100 },
    { name: "Customs Handler", status: "active", orders: 12, success: 92 },
    { name: "Document Processor", status: "warning", orders: 8, success: 75 },
  ];

  const recentOrders = [
    { id: "ORD-2024-001", customer: "Traffix", agent: "Traffix Processor", status: "completed", time: "2 hours ago" },
    { id: "ORD-2024-002", customer: "IMC", agent: "Port Monitor", status: "processing", time: "4 hours ago" },
    { id: "ORD-2024-003", customer: "ARC Logistics", agent: "Customs Handler", status: "completed", time: "6 hours ago" },
    { id: "ORD-2024-004", customer: "MSC", agent: "Document Processor", status: "failed", time: "8 hours ago" },
    { id: "ORD-2024-005", customer: "Evans", agent: "Global Terminal", status: "completed", time: "12 hours ago" },
  ];

  const chartConfig = {
    success: {
      label: "Successful Orders",
      color: "hsl(142 76% 36%)",
    },
    failed: {
      label: "Failed Orders",
      color: "hsl(0 84% 60%)",
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Processing</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Failed</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Warning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to your DS AI Agent platform. Monitor and manage your automation agents.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/agents")}
            className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm sm:text-base"
          >
            <Zap className="h-4 w-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                {stat.trend === "up" && (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                )}
                {stat.trend === "down" && (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Trend Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Order processing over the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-0">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stroke="hsl(142 76% 36%)"
                    fill="url(#fillSuccess)"
                    name="Successful Orders"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="hsl(0 84% 60%)"
                    fill="url(#fillFailed)"
                    name="Failed Orders"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Agent Status Overview</CardTitle>
            <CardDescription>Current status and performance of active agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentStatusData.map((agent, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{agent.name}</span>
                    </div>
                    {getStatusBadge(agent.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{agent.orders} orders</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {agent.success}% success
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${agent.success}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders Table */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest order processing activity</CardDescription>
              </div>
              <button
                onClick={() => navigate("/orders")}
                className="text-sm text-primary hover:underline"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{order.agent}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across your agents</CardDescription>
              </div>
              <button
                onClick={() => navigate("/activity")}
                className="text-sm text-primary hover:underline"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Agent updated", detail: "Crowley Trip Sheet - rules modified", time: "2 hours ago", icon: Bot },
                { action: "Order processed", detail: "IMC Work Order #2341", time: "4 hours ago", icon: Package },
                { action: "Prompt created", detail: "New Customs Release template", time: "1 day ago", icon: FileText },
                { action: "Customer added", detail: "ARC Logistics configuration", time: "2 days ago", icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border pb-3 last:border-0">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10">
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/agents")}
                className="w-full text-left p-3 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                Create New Agent
              </button>
              <button
                onClick={() => navigate("/customers")}
                className="w-full text-left p-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Add Customer Configuration
              </button>
              <button
                onClick={() => navigate("/rag")}
                className="w-full text-left p-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Upload to RAG Library
              </button>
              <button
                onClick={() => navigate("/workflows")}
                className="w-full text-left p-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Build Workflow
              </button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API Status</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Response Time</span>
                </div>
                <span className="text-sm font-medium">142ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Uptime</span>
                </div>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Queue Size</span>
                </div>
                <span className="text-sm font-medium">3 pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Today's activity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-500">68</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Processing</span>
                </div>
                <span className="text-lg font-bold text-blue-500">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Failed</span>
                </div>
                <span className="text-lg font-bold text-destructive">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
