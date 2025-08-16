import { ViperButton } from "@/components/ui/button-variants";
import { BarChart3, TrendingUp, Users, Shield, Activity, Clock } from "lucide-react";

interface DashboardProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
}

const Dashboard = ({ user }: DashboardProps) => {
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-foreground-muted mb-6">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-background-secondary/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-foreground-muted">Analytics & Server Overview</p>
            </div>
            
            <ViperButton variant="viper-outline">
              Export Report
            </ViperButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-red rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-foreground-muted">Active Members</div>
                <div className="text-xs text-green-500 mt-1">+12% this week</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-red rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-foreground-muted">Moderations Today</div>
                <div className="text-xs text-green-500 mt-1">-5% from yesterday</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-red rounded-lg flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-foreground-muted">Active Moderators</div>
                <div className="text-xs text-green-500 mt-1">+2 from last hour</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-red rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">24.5h</div>
                <div className="text-sm text-foreground-muted">Total Shift Time</div>
                <div className="text-xs text-green-500 mt-1">This week</div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="text-primary" size={24} />
                Moderation Activity
              </h2>
              <div className="h-64 bg-background-secondary rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="text-foreground-muted mx-auto mb-2" size={48} />
                  <p className="text-foreground-muted">Chart visualization coming soon</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="text-primary" size={24} />
                Member Growth
              </h2>
              <div className="h-64 bg-background-secondary rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="text-foreground-muted mx-auto mb-2" size={48} />
                  <p className="text-foreground-muted">Growth analytics coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Moderation Actions</h2>
            <div className="space-y-4">
              {/* Mock data */}
              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Warning issued to @troublemaker</p>
                    <p className="text-sm text-foreground-muted">Reason: Spam in #general</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground-muted">by ModeratorName</p>
                  <p className="text-xs text-foreground-muted">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Member banned from server</p>
                    <p className="text-sm text-foreground-muted">Reason: Harassment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground-muted">by AdminName</p>
                  <p className="text-xs text-foreground-muted">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Messages cleared in #general</p>
                    <p className="text-sm text-foreground-muted">7 messages deleted</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground-muted">by Viper Bot</p>
                  <p className="text-xs text-foreground-muted">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;