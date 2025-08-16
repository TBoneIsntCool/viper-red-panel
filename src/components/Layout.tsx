import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Server, 
  Settings, 
  BarChart3, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Layout = ({ children, user, onLogin, onLogout }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Servers", path: "/servers", icon: Server },
    { name: "Panel", path: "/panel", icon: Settings },
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div 
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-background-secondary border-r border-glass-border transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-glass-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-lg">Viper</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-foreground-muted hover:text-foreground"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-glass-border">
          {user ? (
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <img 
                src={user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
                alt={user.username}
                className="w-10 h-10 discord-avatar"
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.username}</p>
                  <p className="text-xs text-foreground-muted">Online</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-10 h-10 bg-discord-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-discord-secondary transition-colors"
                   onClick={onLogin}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              {!sidebarCollapsed && (
                <Button 
                  onClick={onLogin}
                  variant="ghost"
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  Click to Login
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-2 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-foreground-muted hover:text-foreground hover:bg-secondary/50"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <item.icon 
                  size={20} 
                  className={`nav-icon ${isActive(item.path) ? "active" : ""}`}
                />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        {user && (
          <div className="p-4 border-t border-glass-border">
            <Button
              onClick={onLogout}
              variant="ghost"
              className={`w-full text-foreground-muted hover:text-foreground hover:bg-destructive/10 ${
                sidebarCollapsed ? "px-0" : ""
              }`}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;