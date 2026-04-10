import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute, RoleGuard } from "@/auth/RouteGuards";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ActivityTimeline from "./pages/ActivityTimeline";
import AgentBuilder from "./pages/AgentBuilder";
import PromptLibrary from "./pages/PromptLibrary";
import CustomerConfig from "./pages/CustomerConfig";
import Integrations from "./pages/Integrations";
import RAGLibrary from "./pages/RAGLibrary";
import RAGFiles from "./pages/RAGFiles";
import RAGVectorStores from "./pages/RAGVectorStores";
import Workflows from "./pages/Workflows";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/activity" element={<ActivityTimeline />} />
                  <Route path="/agents" element={<AgentBuilder />} />
                  <Route path="/prompts" element={<PromptLibrary />} />
                  <Route path="/customers" element={<CustomerConfig />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/connections" element={<Navigate to="/integrations" replace />} />
                  <Route path="/vault" element={<Navigate to="/integrations" replace />} />
                  <Route path="/rag" element={<RAGLibrary />}>
                    <Route path="files" element={<RAGFiles />} />
                    <Route path="vector-stores" element={<RAGVectorStores />} />
                  </Route>
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/orders" element={<Orders />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
