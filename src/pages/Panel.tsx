import { useState } from "react";
import { ViperButton } from "@/components/ui/button-variants";
import { 
  Play, 
  Square, 
  FileText, 
  Clock, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";

interface PanelProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
}

const Panel = ({ user }: PanelProps) => {
  const [shiftActive, setShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);

  const handleStartShift = () => {
    setShiftActive(true);
    setShiftStartTime(new Date());
  };

  const handleEndShift = () => {
    setShiftActive(false);
    setShiftStartTime(null);
  };

  const formatShiftTime = () => {
    if (!shiftStartTime) return "00:00:00";
    
    const now = new Date();
    const diff = now.getTime() - shiftStartTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-foreground-muted mb-6">Please log in to access the moderation panel.</p>
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
              <h1 className="text-3xl font-bold">Moderation Panel</h1>
              <p className="text-foreground-muted">ER:LC & Discord Integration</p>
            </div>
            
            {/* Shift Status */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${shiftActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <div>
                  <p className="text-sm font-medium">
                    {shiftActive ? 'On Shift' : 'Off Shift'}
                  </p>
                  {shiftActive && (
                    <p className="text-xs text-foreground-muted">
                      {formatShiftTime()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shift Controls */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="text-primary" size={24} />
                Shift Management
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <ViperButton
                    onClick={handleStartShift}
                    disabled={shiftActive}
                    variant="viper"
                    size="xl"
                    className="w-full"
                  >
                    <Play size={20} className="mr-2" />
                    Start Shift
                  </ViperButton>
                  
                  <ViperButton
                    onClick={handleEndShift}
                    disabled={!shiftActive}
                    variant="destructive"
                    size="xl"
                    className="w-full"
                  >
                    <Square size={20} className="mr-2" />
                    End Shift
                  </ViperButton>
                </div>

                {shiftActive && (
                  <div className="bg-background-secondary rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Current Shift</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Started:</span>
                        <span>{shiftStartTime?.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Duration:</span>
                        <span className="font-mono">{formatShiftTime()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Status:</span>
                        <span className="text-green-500 flex items-center gap-1">
                          <Activity size={12} />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Moderation Actions */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="text-primary" size={24} />
                Moderation Tools
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <ViperButton
                  variant="viper-outline"
                  size="xl"
                  className="w-full h-20 flex-col"
                >
                  <FileText size={24} className="mb-2" />
                  Log Moderations
                </ViperButton>
                
                <ViperButton
                  variant="panel"
                  size="xl"
                  className="w-full h-20 flex-col"
                >
                  <Users size={24} className="mb-2" />
                  View Active Users
                </ViperButton>
                
                <ViperButton
                  variant="panel"
                  size="xl"
                  className="w-full h-20 flex-col"
                >
                  <Shield size={24} className="mb-2" />
                  Security Logs
                </ViperButton>
                
                <ViperButton
                  variant="panel"
                  size="xl"
                  className="w-full h-20 flex-col"
                >
                  <AlertTriangle size={24} className="mb-2" />
                  Report Center
                </ViperButton>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {/* Mock activity items */}
                <div className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <div>
                    <p className="text-sm">User @member123 was warned for inappropriate behavior</p>
                    <p className="text-xs text-foreground-muted">2 minutes ago by {user.username}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg">
                  <AlertTriangle className="text-yellow-500 mt-1" size={16} />
                  <div>
                    <p className="text-sm">Automated spam detection triggered in #general</p>
                    <p className="text-xs text-foreground-muted">5 minutes ago by Viper Bot</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg">
                  <Shield className="text-blue-500 mt-1" size={16} />
                  <div>
                    <p className="text-sm">Raid protection activated due to suspicious activity</p>
                    <p className="text-xs text-foreground-muted">12 minutes ago by Viper Bot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Server Status */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Server Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Bot Status</span>
                  <span className="text-green-500 text-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">ER:LC Link</span>
                  <span className="text-green-500 text-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Active Moderators</span>
                  <span className="text-sm">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Online Members</span>
                  <span className="text-sm">1,247</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Activity</h3>
              <div className="space-y-4">
                <div className="text-center p-3 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-xs text-foreground-muted">Moderations</div>
                </div>
                <div className="text-center p-3 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-foreground-muted">Warnings Issued</div>
                </div>
                <div className="text-center p-3 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">7</div>
                  <div className="text-xs text-foreground-muted">Messages Deleted</div>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="glass-card p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Emergency Actions</h3>
              <div className="space-y-2">
                <ViperButton
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Lockdown Server
                </ViperButton>
                <ViperButton
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Enable Raid Mode
                </ViperButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Panel;