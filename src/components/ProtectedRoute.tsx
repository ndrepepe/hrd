import { useEffect, useState, ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

interface ProtectedRouteProps {
  component: ElementType; // Component to render if authenticated
}

const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { session } = useSession(); // Get session from context
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Once session is loaded (from SessionContextProvider), check if user is authenticated
    if (session === null) { // If session is explicitly null, user is not authenticated
      console.log("ProtectedRoute: No session found, navigating to /login");
      navigate('/login');
    } else {
      console.log("ProtectedRoute: Session found, user authenticated.");
    }
    setLoading(false); // Set loading to false once session status is determined
  }, [session, navigate]); // Depend on session and navigate

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  // If not loading and no session, navigation has already been triggered.
  // We return null to prevent rendering the protected component.
  if (!session) {
     return null;
  }

  // If authenticated, render the protected component
  return <Component />;
};

export default ProtectedRoute;