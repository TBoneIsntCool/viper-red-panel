import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  Play, 
  Square, 
  Activity,
  Ban,
  UserX,
  MessageCircle,
  Eye
} from "lucide-react";

interface PanelProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

interface ModerationLog {
  id: number;
  action_type: string;
  target_user: string;
  reason: string;
  moderator_name: string;
  created_at: string;
}

interface ServerStats {
  memberCount: number;
  todayModerations: number;
  activeModerators: number;
  totalShiftTime: number;
}

const Panel = ({ user }: PanelProps) => {
  const { toast } = useToast();
  const [shiftActive, setShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats>({
    memberCount: 0,
    todayModerations: 0,
    activeModerators: 0,
    totalShiftTime: 0
  });
  const [loading, setLoading] = useState(true);

  const serverId = "123456789"; // This would come from route params in a real app

  // Load panel data on component mount
  useEffect(() => {
    if (user) {
      loadPanelData();
      const interval = setInterval(loadPanelData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPanelData = async () => {
    if (!user) return;

    try {
      // Load moderation logs
      const logsResponse = await fetch('/functions/v1/panel-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_moderation_logs', 
          server_id: serverId 
        })
      });
      const logsData = await logsResponse.json();
      setModerationLogs(logsData.logs || []);

      // Load server stats
      const statsResponse = await fetch('/functions/v1/panel-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_server_stats', 
          server_id: serverId 
        })
      });
      const statsData = await statsResponse.json();
      setServerStats(statsData);

    } catch (error) {
      console.error('Failed to load panel data:', error);
      toast({
        title: "Error",
        description: "Failed to load panel data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    if (!user) return;

    try {
      const response = await fetch('/functions/v1/panel-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start_shift', 
          user_id: user.id, 
          server_id: serverId 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShiftActive(true);
        setShiftStartTime(new Date());
        toast({
          title: "Shift Started",
          description: "Your moderation shift has begun"
        });
        loadPanelData(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to start shift:', error);
      toast({
        title: "Error",
        description: "Failed to start shift",
        variant: "destructive"
      });
    }
  };

  const handleEndShift = async () => {
    if (!user) return;

    try {
      const response = await fetch('/functions/v1/panel-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'end_shift', 
          user_id: user.id, 
          server_id: serverId 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShiftActive(false);
        setShiftStartTime(null);
        toast({
          title: "Shift Ended",
          description: "Your moderation shift has ended"
        });
        loadPanelData(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to end shift:', error);
      toast({
        title: "Error",
        description: "Failed to end shift",
        variant: "destructive"
      });
    }
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

  const handleModerationAction = async (action: string, target: string, reason?: string) => {
    if (!user) return;

    try {
      const response = await fetch('/functions/v1/panel-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'log_action', 
          user_id: user.id, 
          server_id: serverId,
          data: { action, target, reason }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Action Logged",
          description: `${action} action recorded for ${target}`
        });
        loadPanelData(); // Refresh logs
      }
    } catch (error) {
      console.error('Failed to log action:', error);
      toast({
        title: "Error",
        description: "Failed to log moderation action",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to access the moderation panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Moderation Panel</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}</p>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${shiftActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <div>
              <p className="text-sm font-medium">
                {shiftActive ? 'On Shift' : 'Off Shift'}
              </p>
              {shiftActive && (
                <p className="text-xs text-muted-foreground">
                  {formatShiftTime()}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shift Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shift Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleStartShift}
                  disabled={shiftActive}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Shift
                </Button>
                <Button
                  onClick={handleEndShift}
                  disabled={!shiftActive}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Shift
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <Ban className="h-6 w-6 mb-2" />
                  Ban Member
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <UserX className="h-6 w-6 mb-2" />
                  Kick Member
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Clear Messages
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Issue Warning
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : moderationLogs.length > 0 ? (
                  moderationLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {log.action_type === 'warn' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {log.action_type === 'ban' && <Ban className="h-4 w-4 text-red-500" />}
                        {log.action_type === 'kick' && <UserX className="h-4 w-4 text-orange-500" />}
                        {log.action_type === 'clear_messages' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                        {log.action_type === 'timeout' && <Clock className="h-4 w-4 text-purple-500" />}
                        <span className="text-sm font-medium">
                          {log.action_type} - {log.target_user}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent moderation actions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Server Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Server Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Active Members</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serverStats.memberCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total server members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Today's Actions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serverStats.todayModerations}</div>
                    <p className="text-xs text-muted-foreground">Moderation actions today</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Moderators</span>
                  <div className="text-2xl font-bold">{serverStats.activeModerators}</div>
                    <p className="text-xs text-muted-foreground">Currently on shift</p>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Shift Time</span>
                  <div className="text-2xl font-bold">
                    {Math.floor(serverStats.totalShiftTime / 60)}h {serverStats.totalShiftTime % 60}m
                  </div>
                    <p className="text-xs text-muted-foreground">Total today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Actions */}
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-500">Emergency Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Server Lockdown
              </Button>
              <Button variant="destructive" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Enable Raid Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Panel;