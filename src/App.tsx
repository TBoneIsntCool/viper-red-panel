import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Servers from "./pages/Servers";
import Panel from "./pages/Panel";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Mock user for development - in production this would come from Supabase auth
const mockUser = {
  id: "12345",
  username: "TestUser",
  avatar: "https://cdn.discordapp.com/avatars/12345/a_1234567890abcdef.gif"
};

const App = () => {
  const [user, setUser] = useState<typeof mockUser | null>(null);

  const handleLogin = () => {
    // In production, this would trigger Discord OAuth2 via Supabase
    console.log("Login with Discord OAuth2");
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout user={user} onLogin={handleLogin} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Home user={user} onLogin={handleLogin} />} />
              <Route path="/servers" element={<Servers user={user} />} />
              <Route path="/panel" element={<Panel user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
