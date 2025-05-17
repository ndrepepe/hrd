"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import CarManager from "@/components/CarManager";

// Define Rental interface here as well, or import if defined in a shared file
interface Rental {
  id: string;
  created_at: string;
  car_id: string | null;
  car_name: string | null; // Keep for potential old data
  borrower_name: string;
  driver_name: string | null;
  rent_date: string;
  start_time: string;
  end_time: string;
  cars?: { name: string } | null;
}


const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0); // State to trigger car list refresh in form
  const [refreshRentals, setRefreshRentals] = useState(0); // State to trigger rental list refresh
  const [editingRental, setEditingRental] = useState<Rental | null>(null); // State to hold rental data being edited

  const handleCarAdded = () => {
    // Increment state to trigger refresh in CarRentalForm
    setRefreshCars(prev => prev + 1);
  };

  const handleRentalSubmitted = () => {
    // Increment state to trigger refresh in CarRentalList
    setRefreshRentals(prev => prev + 1);
    setEditingRental(null); // Clear editing state after submission
  };

  const handleEditClick = (rental: Rental) => {
    setEditingRental(rental); // Set the rental data to be edited
  };

  const handleCancelEdit = () => {
    setEditingRental(null); // Clear editing state
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Peminjaman Mobil</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola daftar mobil dan catat peminjamannya di sini.
      </p>

      <div className="mb-10">
        <CarManager onCarAdded={handleCarAdded} />
      </div>

      {/* Pass editingRental, onRentalSubmitted, and onCancelEdit to CarRentalForm */}
      <CarRentalForm
        refreshCarsTrigger={refreshCars}
        editingRental={editingRental}
        onRentalSubmitted={handleRentalSubmitted}
        onCancelEdit={handleCancelEdit}
      />

      <div className="mt-8">
        {/* Pass refreshRentalsTrigger and onEditClick to CarRentalList */}
        <CarRentalList
          refreshTrigger={refreshRentals}
          onEditClick={handleEditClick}
        />
      </div>
    </div>
  );
};

export default CarRentalPage;