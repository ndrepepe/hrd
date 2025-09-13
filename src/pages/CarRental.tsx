"use client";

import { useState } from "react";
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";

const CarRental = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);

  const handleRentalSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingRentalId(null); // Clear editing state after submission
  };

  const handleEditClick = (rentalId: string) => {
    setEditingRentalId(rentalId);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manajemen Peminjaman Mobil</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CarRentalForm
          refreshCarsTrigger={refreshTrigger} // Pass refresh trigger to form
          onRentalSubmitted={handleRentalSubmitted}
          editingRentalId={editingRentalId}
          setEditingRentalId={setEditingRentalId}
        />
        <CarRentalList
          refreshTrigger={refreshTrigger}
          onEditClick={handleEditClick}
        />
      </div>
    </div>
  );
};

export default CarRental;