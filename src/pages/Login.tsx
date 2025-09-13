"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate for Auth component's redirect
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const Login = () => {
  const { session } = useSession(); // Get session from context
  const navigate = useNavigate();

  // Redirect authenticated users from login page to home
  useEffect(() => {
    if (session) {
      console.log("User already authenticated, redirecting from /login to /");
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16">
      <div className="w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'}
        />
      </div>
    </div>
  );
};

export default Login;