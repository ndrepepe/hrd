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
        {session && (
          <div className="flex flex-col sm:flex-row sm:space-x-2 md:space-x-4 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0"> {/* Adjusted for responsiveness */}
            <Link to="/car-rental">
              <Button variant="ghost" className="text-white hover:bg-gray-700 w-full sm:w-auto">Peminjaman Mobil</Button>
            </Link>
            {/* <Link to="/recruitment">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Rekrutmen Karyawan</Button>
            </Link> */}
            <Link to="/daily-report">
              <Button variant="ghost" className="text-white hover:bg-gray-700 w-full sm:w-auto">Laporan Harian</Button>
            </Link>
            <Link to="/employees">
              <Button variant="ghost" className="text-white hover:bg-gray-700 w-full sm:w-auto">Data Karyawan</Button>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-gray-700 w-full sm:w-auto" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;