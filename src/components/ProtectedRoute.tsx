import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null); // Use 'any' for session type for simplicity

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate('/login');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    // Optionally render a loading spinner or placeholder
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!session) {
    // This case should ideally not be reached often due to the navigate call,
    // but as a fallback, we can return null or a message.
    return null;
  }

  // Changed from <> to <div> for debugging
  return <div>{children}</div>;
};

export default ProtectedRoute;