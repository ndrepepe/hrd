"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import CarManager from "@/components/CarManager"; // Import CarManager

const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0); // State to trigger car list refresh
  const [refreshRentals, setRefreshRentals] = useState(0); // New state to trigger rental list refresh

  const handleCarAdded = () => {
    // Increment state to trigger refresh in CarRentalForm
    setRefreshCars(prev => prev + 1);
  };

  const handleRentalSubmitted = () => {
    // Increment state to trigger refresh in CarRentalList
    setRefreshRentals(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Added pt-16 */}
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Peminjaman Mobil</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola daftar mobil dan catat peminjamannya di sini.
      </p>

      {/* Add CarManager component */}
      <div className="mb-10">
        <CarManager onCarAdded={handleCarAdded} />
      </div>

      {/* Pass refreshCarsTrigger and onRentalSubmitted to CarRentalForm */}
      <CarRentalForm refreshCarsTrigger={refreshCars} onRentalSubmitted={handleRentalSubmitted} />

      <div className="mt-8">
        {/* Pass refreshRentals as refreshTrigger to CarRentalList */}
        <CarRentalList refreshTrigger={refreshRentals} />
      </div>
    </div>
  );
};

export default CarRentalPage;