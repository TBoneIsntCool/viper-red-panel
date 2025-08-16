import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ViperButton } from "@/components/ui/button-variants";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="glass-card p-8">
          <div className="w-20 h-20 bg-gradient-red rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-white" size={32} />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-foreground-muted mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <ViperButton asChild variant="viper" size="lg">
            <a href="/" className="inline-flex items-center gap-2">
              <Home size={20} />
              Back to Home
            </a>
          </ViperButton>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
