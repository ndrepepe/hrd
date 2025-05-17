"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext"; // Import useUser hook

const NavigationBar = () => {
  const { role, loading } = useUser(); // Get user role and loading state

  // Don't render navigation until loading is complete
  if (loading) {
    return null; // Or a loading indicator if preferred
  }

  // Define which roles can see which links
  const canViewRecruitment = role === 'admin' || role === 'hr';
  const canViewCarRental = role === 'admin' || role === 'hr' || role === 'employee'; // Example: all roles can see car rental
  const canViewDailyReport = role === 'admin' || role === 'hr' || role === 'employee'; // Example: all roles can see daily report

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-xl font-bold mr-4">
          HRD ANDI OFFSET
        </Link>
        <div className="flex flex-wrap space-x-4">
          {canViewCarRental && (
            <Link to="/car-rental">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Peminjaman Mobil</Button>
            </Link>
          )}
          {canViewRecruitment && (
            <Link to="/recruitment">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Rekrutmen Karyawan</Button>
            </Link>
          )}
           {canViewDailyReport && (
            <Link to="/daily-report">
              <Button variant="ghost" className="text-white hover:bg-gray-700">Laporan Harian</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;