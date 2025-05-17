"use client";

import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";

const CarRentalPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Peminjaman Mobil</h1>
      <CarRentalForm />
      <div className="mt-8">
        <CarRentalList />
      </div>
    </div>
  );
};

export default CarRentalPage;