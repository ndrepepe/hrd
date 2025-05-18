import { useEffect, useState, ElementType } from 'react'; // Import ElementType
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  component: ElementType; // Component to render if authenticated
  path?: string; // Path is not strictly needed here but good practice
}

const ProtectedRoute = ({ component: Component, path }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null); // Use 'any' for session type for simplicity

  useEffect(() => {
    const checkSession = async () => {
      console.log("ProtectedRoute: Checking session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("ProtectedRoute: Initial session check result:", session);
      setSession(session);
      setLoading(false);
      if (!session) {
        console.log("ProtectedRoute: No session found, navigating to /login");
        navigate('/login');
      } else {
        console.log("ProtectedRoute: Session found.");
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("ProtectedRoute: Auth state changed:", _event, session);
      setSession(session);
      if (!session) {
        console.log("ProtectedRoute: Auth state change: No session, navigating to /login");
        navigate('/login');
      } else {
         console.log("ProtectedRoute: Auth state change: Session found.");
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      console.log("ProtectedRoute: Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, [navigate]); // Depend on navigate

  if (loading) {
    // Optionally render a loading spinner or placeholder while checking session
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  // If not loading and no session, navigate has already been called in useEffect.
  // We can return null or a simple message while navigation happens.
  if (!session) {
     console.log("ProtectedRoute: Not authenticated, rendering null.");
     return null;
  }

  // If authenticated, render the protected component
  console.log("ProtectedRoute: Authenticated, rendering component.");
  return <Component />;
};

export default ProtectedRoute;