import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function GoogleCalendarSignIn() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check for auth success in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_auth') === 'success') {
      setIsConnected(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '651059695176-rfmg5lm71h5ou0mupes8j0i5cntudhs5.apps.googleusercontent.com';
    const redirectUri = window.location.origin;
    const scope = 'https://www.googleapis.com/auth/calendar';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-[#4285F4]">
        <GoogleIcon />
      </span>
      <div className="flex-1">
        <h3 className="font-display text-lg text-foreground">
          {isConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isConnected
            ? 'Events will automatically be added to your Google Calendar'
            : 'Sign in once to auto-add all Piratage events to your Google Calendar.'}
        </p>
        {!isConnected ? (
          <Button
            variant="ghost"
            className="mt-3 gap-2 text-xs uppercase tracking-[0.24em]"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-neon-teal">
            <Check className="h-4 w-4" />
            Connected
          </div>
        )}
      </div>
    </div>
  );
}
