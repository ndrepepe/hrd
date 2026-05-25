"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession } from '@/components/SessionContextProvider';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      console.log("User already authenticated, redirecting from /login to /");
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="app-shell flex items-center justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/70 bg-white shadow-xl shadow-slate-200/80 md:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-slate-950 p-8 text-white md:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-bold leading-tight">Masuk ke HRD ANDI OFFSET</h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Akses modul peminjaman mobil, laporan harian, dan data karyawan dengan akun yang terdaftar.
          </p>
          <div className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/40">
            <img
              src="/images/hrd-login-visual.png"
              alt="Ilustrasi dashboard HRD"
              className="h-56 w-full object-cover sm:h-64 md:h-72"
            />
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
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
                      brandAccent: 'hsl(var(--primary))',
                      inputBackground: '#ffffff',
                      inputBorder: 'hsl(var(--input))',
                      inputBorderFocus: 'hsl(var(--primary))',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      inputBorderRadius: '8px',
                    },
                    space: {
                      inputPadding: '12px',
                      buttonPadding: '12px 16px',
                    },
                  },
                },
                className: {
                  container: 'auth-container',
                  button: 'auth-button',
                  input: 'auth-input',
                  label: 'auth-label',
                },
              }}
              theme="light"
              // Diubah agar mengarah ke halaman login
              redirectTo={window.location.origin + '/login'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
