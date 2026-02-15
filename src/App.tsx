
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import VirtualReality from "./pages/VirtualReality";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="h-screen flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/weather" element={
                  <ProtectedRoute>
                    <Weather />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } />
                <Route path="/code" element={
                  <ProtectedRoute>
                    <Code />
                  </ProtectedRoute>
                } />
                <Route path="/web" element={
                  <ProtectedRoute>
                    <Web />
                  </ProtectedRoute>
                } />
                <Route path="/agents" element={
                  <ProtectedRoute>
                    <AgentFramework />
                  </ProtectedRoute>
                } />
                <Route path="/multimodal" element={
                  <ProtectedRoute>
                    <Multimodal />
                  </ProtectedRoute>
                } />
                <Route path="/personas" element={
                  <ProtectedRoute>
                    <Personas />
                  </ProtectedRoute>
                } />
                <Route path="/vr" element={
                  <ProtectedRoute>
                    <VirtualReality />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
