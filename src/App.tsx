
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Layout>
                    <Index />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/marketplace"
              element={
                <AuthGuard>
                  <Layout>
                    <Marketplace />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/services"
              element={
                <AuthGuard>
                  <Layout>
                    <Services />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/events"
              element={
                <AuthGuard>
                  <Layout>
                    <Events />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/messages"
              element={
                <AuthGuard>
                  <Layout>
                    <Messages />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
