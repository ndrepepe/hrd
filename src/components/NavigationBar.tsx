"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { BarChart3, Car, LogOut, Menu, Users, X } from "lucide-react";

const navItems = [
  { to: "/car-rental", label: "Peminjaman Mobil", icon: Car },
  { to: "/daily-report", label: "Laporan Harian", icon: BarChart3 },
  { to: "/employees", label: "Data Karyawan", icon: Users },
];

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
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-white/20 bg-slate-950/90 text-white shadow-lg shadow-slate-900/10 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 py-3" onClick={closeMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-black shadow-sm shadow-primary/30">
            HR
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white/60">Dashboard</span>
            <span className="text-base font-bold tracking-wide">HRD ANDI OFFSET</span>
          </span>
        </Link>

        {/* Hamburger Menu Button */}
        {session && (
          <div className="block sm:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon" className="text-white hover:bg-white/10">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        )}

        {/* Navigation Links */}
        {session && (
          <div
            className={`w-full pb-4 sm:flex sm:w-auto sm:items-center sm:pb-0 ${isMenuOpen ? 'block' : 'hidden'}`}
          >
            <div className="mt-2 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white/85 hover:bg-white/10 hover:text-white sm:w-auto sm:justify-center">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button variant="ghost" className="w-full justify-start text-white/85 hover:bg-red-500/15 hover:text-white sm:w-auto sm:justify-center" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
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
