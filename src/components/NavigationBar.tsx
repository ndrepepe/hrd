"use client";

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";

const NavigationBar = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Attempting to log out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      // Optionally show an error toast
    } else {
      console.log("User logged out successfully. Redirecting to /login.");
      navigate('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-xl font-bold mr-4">
          HRD ANDI OFFSET
        </Link>
        {session && ( // Hanya tampilkan menu jika ada sesi (pengguna login)
          <div className="flex flex-wrap space-x-4">
            <Link to="/car-rental">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Peminjaman Mobil</Button>
            </Link>
            <Link to="/recruitment">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Rekrutmen Karyawan</Button>
            </Link>
            <Link to="/daily-report">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Laporan Harian</Button>
            </Link>
            <Link to="/employees">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Data Karyawan</Button>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;