
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Weather from "./pages/Weather";
import Search from "./pages/Search"; 
import Code from "./pages/Code";
import Web from "./pages/Web";
import NotFound from "./pages/NotFound";
import { AgentFramework } from "./components/AgentFramework";
import { Multimodal } from "./components/Multimodal";
import Personas from "./pages/Personas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/search" element={<Search />} />
          <Route path="/code" element={<Code />} />
          <Route path="/web" element={<Web />} />
          <Route path="/agents" element={<AgentFramework />} />
          <Route path="/multimodal" element={<Multimodal />} />
          <Route path="/personas" element={<Personas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
