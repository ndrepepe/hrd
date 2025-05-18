import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Login Dinonaktifkan</h1>
        <p className="text-gray-600">
          Login menggunakan email dan password telah dinonaktifkan.
        </p>
        {/* Anda bisa menambahkan instruksi lain di sini jika ada metode login alternatif */}
      </div>
    </div>
  );
};

export default Login;