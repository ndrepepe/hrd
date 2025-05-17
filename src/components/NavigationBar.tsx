"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavigationBar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-xl font-bold mr-4">
          HRD ANDI OFFSET
        </Link>
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
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;