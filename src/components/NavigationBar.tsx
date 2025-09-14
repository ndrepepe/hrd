"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { Menu, X } from "lucide-react";

const NavigationBar = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    console.log("Attempting to log out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("User logged out successfully. Redirecting to /login.");
      setIsMenuOpen(false); // Close menu on logout
      navigate('/login');
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        <Link to="/" className="text-xl font-bold" onClick={closeMenu}>
          HRD ANDI OFFSET
        </Link>

        {/* Hamburger Menu Button */}
        {session && (
          <div className="block sm:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        )}

        {/* Navigation Links */}
        {session && (
          <div
            className={`w-full sm:flex sm:items-center sm:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}
          >
            <div className="flex flex-col sm:flex-row sm:space-x-2 md:space-x-4 mt-4 sm:mt-0">
              <Link to="/car-rental" onClick={closeMenu}>
                <Button variant="ghost" className="text-white hover:bg-gray-700 w-full justify-start sm:w-auto sm:justify-center">Peminjaman Mobil</Button>
              </Link>
              <Link to="/daily-report" onClick={closeMenu}>
                <Button variant="ghost" className="text-white hover:bg-gray-700 w-full justify-start sm:w-auto sm:justify-center">Laporan Harian</Button>
              </Link>
              <Link to="/employees" onClick={closeMenu}>
                <Button variant="ghost" className="text-white hover:bg-gray-700 w-full justify-start sm:w-auto sm:justify-center">Data Karyawan</Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-gray-700 w-full justify-start sm:w-auto sm:justify-center" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;