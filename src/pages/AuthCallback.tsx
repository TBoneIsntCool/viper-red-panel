import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AuthCallbackProps {
  onLogin: (user: any) => void;
}

const AuthCallback = ({ onLogin }: AuthCallbackProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Discord OAuth error:', error);
        navigate('/?error=auth_failed');
        return;
      }

      if (!code) {
        navigate('/?error=no_code');
        return;
      }

      try {
        const response = await fetch('/functions/v1/discord-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'callback', 
            code: code 
          })
        });

        const data = await response.json();

        if (data.user) {
          onLogin(data.user);
          navigate('/servers');
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Authentication callback failed:', error);
        navigate('/?error=auth_callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="text-foreground">Authenticating with Discord...</div>
      </div>
    </div>
  );
};

export default AuthCallback;