import { useEffect, ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

interface ProtectedRouteProps {
  component: ElementType; // Component to render if authenticated
}

const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { session } = useSession(); // Get session from context
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute useEffect: session changed to", session); // Log untuk melacak perubahan sesi
    // Jika session adalah null, itu berarti SessionContextProvider telah selesai memuat
    // dan menentukan tidak ada sesi aktif.
    if (session === null) {
      console.log("ProtectedRoute: No session found, navigating to /login");
      navigate('/login');
    }
    // Tidak perlu status loading lokal di sini, karena SessionContextProvider menanganinya.
  }, [session, navigate]);

  // Jika session adalah null, itu berarti navigasi ke /login telah dipicu.
  // Kita mengembalikan null untuk mencegah rendering komponen yang dilindungi.
  if (session === null) {
     return null;
  }

  // Jika session ada, render komponen yang dilindungi.
  return <Component />;
};

export default ProtectedRoute;