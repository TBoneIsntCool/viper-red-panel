import { useState, useEffect } from "react";
import { ViperButton } from "@/components/ui/button-variants";
import { Crown, Shield, Settings, BarChart3, Users, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Server {
  id: string;
  name: string;
  icon?: string;
  memberCount?: number;
  userRole: string;
  hasViperBot: boolean;
  permissions?: string;
}

interface ServersProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
}

const getUserRoleFromPermissions = (permissions: string): string => {
  const perms = parseInt(permissions);
  
  // Check for specific permissions (bitwise)
  if (perms & 0x8) return "Administrator"; // ADMINISTRATOR
  if (perms & 0x20000000) return "Owner"; // MANAGE_GUILD (owner-like)
  if (perms & 0x10000000) return "Moderator"; // MANAGE_MESSAGES
  if (perms & 0x2) return "Moderator"; // KICK_MEMBERS
  if (perms & 0x4) return "Moderator"; // BAN_MEMBERS
  
  return "Member";
};

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "owner":
      return <Crown className="text-yellow-400" size={16} />;
    case "administrator":
    case "admin":
      return <Shield className="text-red-400" size={16} />;
    case "moderator":
    case "mod":
      return <Settings className="text-blue-400" size={16} />;
    default:
      return <Users className="text-gray-400" size={16} />;
  }
};

const formatMemberCount = (count: number) => {
  if (!count) return "N/A";
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const Servers = ({ user }: ServersProps) => {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserServers = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('guilds')
          .eq('discord_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (profile?.guilds && Array.isArray(profile.guilds)) {
          const mappedServers: Server[] = profile.guilds.map((guild: any) => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : undefined,
            memberCount: guild.approximate_member_count || 0,
            userRole: guild.permissions ? getUserRoleFromPermissions(guild.permissions) : "Member",
            hasViperBot: guild.hasViperBot || false,
            permissions: guild.permissions
          }));
          
          setServers(mappedServers);
        }
      } catch (error) {
        console.error('Error loading servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserServers();
  }, [user]);

  const viperServers = servers.filter(server => server.hasViperBot);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading your servers...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-foreground-muted mb-6">Please log in to view your servers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass-border bg-background-secondary/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              How is it going, {user.username}
            </h1>
            <p className="text-foreground-muted text-lg">
              Choose the server you wish to moderate.
            </p>
          </div>
        </div>
      </header>

      {/* Server List */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {viperServers.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Hash className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Servers Found</h2>
              <p className="text-foreground-muted">
                Viper bot is not present in any of your servers yet. Invite Viper to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {viperServers.map((server) => (
                <div
                  key={server.id}
                  className={`server-card ${
                    selectedServer === server.id ? "border-primary/50" : ""
                  }`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Server Icon */}
                    <div className="relative">
                      {server.icon ? (
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-background-tertiary rounded-xl flex items-center justify-center">
                          <Hash className="text-foreground-muted" size={24} />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Server Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold truncate">{server.name}</h3>
                        {getRoleIcon(server.userRole)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {formatMemberCount(server.memberCount || 0)} members
                        </span>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(server.userRole)}
                          {server.userRole}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <ViperButton
                        variant="viper-outline"
                        size="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to panel for this server
                          window.location.href = `/panel?server=${server.id}`;
                        }}
                      >
                        Panel
                      </ViperButton>
                      <ViperButton
                        variant="viper-ghost"
                        size="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to dashboard for this server
                          window.location.href = `/dashboard?server=${server.id}`;
                        }}
                      >
                        <BarChart3 size={16} className="mr-2" />
                        Dashboard
                      </ViperButton>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedServer === server.id && (
                    <div className="mt-4 pt-4 border-t border-glass-border">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground-muted uppercase tracking-wide">
                            Quick Actions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <ViperButton variant="panel" size="sm">
                              View Logs
                            </ViperButton>
                            <ViperButton variant="panel" size="sm">
                              Active Shifts
                            </ViperButton>
                            <ViperButton variant="panel" size="sm">
                              Server Stats
                            </ViperButton>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground-muted uppercase tracking-wide">
                            Server Status
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Viper Bot Online</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>ER:LC Integration Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Server Card */}
          <div className="glass-card p-6 text-center border-dashed border-2 border-glass-border hover:border-primary/30 transition-all duration-300 cursor-pointer">
            <Hash className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Add Viper to Another Server</h3>
            <p className="text-foreground-muted mb-4">
              Invite Viper bot to manage additional Discord servers
            </p>
            <ViperButton variant="viper-outline">
              Invite Viper Bot
            </ViperButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Servers;