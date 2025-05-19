"use client"; // Added "use client" directive

import { useEffect } from 'react';
// Removed useNavigate as we are removing the redirect logic
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react'; // Import Auth component
import { ThemeSupa } from '@supabase/auth-ui-shared'; // Import ThemeSupa theme

const Login = () => {
  // Removed useEffect for auth state change and initial session check

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16">
      <div className="w-full max-w-md">
        {/* Render the Supabase Auth component */}
        {/* The Auth component itself might still redirect on successful login based on its props,
            but this page will no longer force redirects based on session state check here. */}
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
          redirectTo={window.location.origin + '/'} // Keep redirect to home after login via the Auth component itself
        />
      </div>
    </div>
  );
};

export default Login;