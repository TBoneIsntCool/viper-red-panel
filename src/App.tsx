import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Servers from "./pages/Servers";
import Panel from "./pages/Panel";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

interface User {
  id: string;
  username: string;
  avatar?: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const storedUserId = localStorage.getItem('discord_user_id');
    if (storedUserId) {
      // Validate user session with backend
      fetch(`/api/me/${storedUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('discord_user_id');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/auth/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLoginCallback = (userData: User) => {
    setUser(userData);
    localStorage.setItem('discord_user_id', userData.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('discord_user_id');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout user={user} onLogin={handleLogin} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Home user={user} onLogin={handleLogin} />} />
              <Route path="/auth/callback" element={<AuthCallback onLogin={handleLoginCallback} />} />
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
