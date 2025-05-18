"use client"; // Added "use client" directive

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react'; // Import Auth component
import { ThemeSupa } from '@supabase/auth-ui-shared'; // Import ThemeSupa theme

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Redirect authenticated users away from login page
        console.log("Auth state changed: Session found, navigating to /");
        navigate('/');
      } else {
        console.log("Auth state changed: No session.");
      }
    });

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("Initial session check: Session found, navigating to /");
        navigate('/');
      } else {
         console.log("Initial session check: No session.");
      }
    });

    return () => {
      console.log("Unsubscribing from auth state changes");
      authListener.subscription.unsubscribe();
    };
  }, [navigate]); // Depend on navigate

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16">
      <div className="w-full max-w-md">
        {/* Render the Supabase Auth component */}
        <Auth
          supabaseClient={supabase}
          providers={[]} // Empty array means only email/password is enabled
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))', // Use primary color from Tailwind config
                  brandAccent: 'hsl(var(--primary-foreground))', // Use primary-foreground
                },
              },
            },
          }}
          theme="light" // Use light theme
          redirectTo={window.location.origin + '/'} // Redirect to home after login
        />
      </div>
    </div>
  );
};

export default Login;