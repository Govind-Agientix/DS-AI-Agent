import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

export default function RAGLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentTab = location.pathname.includes('/vector-stores') ? 'vector-stores' : 'files';

  // Redirect to files tab by default
  useEffect(() => {
    if (location.pathname === '/rag') {
      navigate('/rag/files', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Storage</h1>
        <p className="text-muted-foreground">
          Upload and index SOPs, rate cards, and reference documents
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => navigate(`/rag/${value}`)}>
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="vector-stores">Vector stores</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  );
}
