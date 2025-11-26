import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ActivityTimeline from "./pages/ActivityTimeline";
import AgentBuilder from "./pages/AgentBuilder";
import PromptLibrary from "./pages/PromptLibrary";
import CustomerConfig from "./pages/CustomerConfig";
import Connections from "./pages/Connections";
import Vault from "./pages/Vault";
import RAGLibrary from "./pages/RAGLibrary";
import RAGFiles from "./pages/RAGFiles";
import RAGVectorStores from "./pages/RAGVectorStores";
import Workflows from "./pages/Workflows";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activity" element={<ActivityTimeline />} />
            <Route path="/agents" element={<AgentBuilder />} />
            <Route path="/prompts" element={<PromptLibrary />} />
            <Route path="/customers" element={<CustomerConfig />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/rag" element={<RAGLibrary />}>
              <Route path="files" element={<RAGFiles />} />
              <Route path="vector-stores" element={<RAGVectorStores />} />
            </Route>
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
