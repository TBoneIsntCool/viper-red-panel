import { ViperButton } from "@/components/ui/button-variants";
import { Bot, Shield, Zap, Users } from "lucide-react";

interface HomeProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
  onLogin?: () => void;
}

const Home = ({ user, onLogin }: HomeProps) => {
  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Header */}
      <header className="border-b border-glass-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-red rounded-xl flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Viper Bot</h1>
              <p className="text-sm text-foreground-muted">Advanced Discord Moderation</p>
            </div>
          </div>
          
          {!user && (
            <ViperButton onClick={onLogin} variant="viper" size="lg">
              Log In with Discord
            </ViperButton>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-foreground-muted bg-clip-text text-transparent">
              Welcome to Viper
            </h1>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Professional Discord moderation with ER:LC integration. 
              Streamline your server management with powerful tools and intuitive controls.
            </p>
          </div>

          {user ? (
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
                  alt={user.username}
                  className="w-16 h-16 discord-avatar"
                />
                <div className="text-left">
                  <h2 className="text-2xl font-semibold">Welcome back, {user.username}!</h2>
                  <p className="text-foreground-muted">Ready to manage your servers?</p>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <ViperButton variant="viper" size="xl">
                  View Servers
                </ViperButton>
                <ViperButton variant="viper-outline" size="xl">
                  Quick Panel
                </ViperButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ViperButton onClick={onLogin} variant="viper" size="xl" className="text-lg px-12">
                Get Started - Login with Discord
              </ViperButton>
              <p className="text-sm text-foreground-muted">
                Secure OAuth2 authentication • No bot permissions required
              </p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-red rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-red-glow transition-all duration-300">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Moderation</h3>
            <p className="text-foreground-muted">
              Comprehensive moderation tools with ER:LC integration for seamless server management.
            </p>
          </div>

          <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-red rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-red-glow transition-all duration-300">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-foreground-muted">
              Quick response times and efficient processing for real-time moderation actions.
            </p>
          </div>

          <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-red rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-red-glow transition-all duration-300">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">User Friendly</h3>
            <p className="text-foreground-muted">
              Intuitive interface designed for both new and experienced moderators.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="text-center mt-20">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-foreground-muted mb-6">
                Join thousands of Discord servers using Viper for professional moderation.
              </p>
              <ViperButton onClick={onLogin} variant="viper" size="xl">
                Login with Discord
              </ViperButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;