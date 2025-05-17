"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import AddCarForm from "@/components/AddCarForm"; // Import AddCarForm
import CarList from "@/components/CarList"; // Import CarList

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0); // State to trigger car list refresh in form and list
  const [refreshRentals, setRefreshRentals] = useState(0); // State to trigger rental list refresh

  const handleCarAddedOrDeleted = () => {
    // Increment state to trigger refresh in CarRentalForm and CarList
    setRefreshCars(prev => prev + 1);
  };

  const handleRentalSubmitted = () => {
    // Increment state to trigger refresh in CarRentalList
    setRefreshRentals(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Peminjaman Mobil</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola daftar mobil dan catat peminjamannya di sini.
      </p>

      <Tabs defaultValue="add-rental" className="w-full"> {/* Default tab */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4"> {/* Responsive grid */}
          <TabsTrigger value="add-car">Tambah Nama Mobil</TabsTrigger>
          <TabsTrigger value="list-cars">Daftar Nama Mobil</TabsTrigger>
          <TabsTrigger value="add-rental">Input Peminjaman Mobil</TabsTrigger>
          <TabsTrigger value="list-rentals">Rekap Peminjaman Mobil</TabsTrigger>
        </TabsList>

        <TabsContent value="add-car" className="mt-6">
          <AddCarForm onCarAdded={handleCarAddedOrDeleted} /> {/* Use AddCarForm */}
        </TabsContent>

        <TabsContent value="list-cars" className="mt-6">
          <CarList refreshTrigger={refreshCars} onCarDeleted={handleCarAddedOrDeleted} /> {/* Use CarList */}
        </TabsContent>

        <TabsContent value="add-rental" className="mt-6">
          <CarRentalForm refreshCarsTrigger={refreshCars} onRentalSubmitted={handleRentalSubmitted} /> {/* Keep CarRentalForm */}
        </TabsContent>

        <TabsContent value="list-rentals" className="mt-6">
          <CarRentalList refreshTrigger={refreshRentals} /> {/* Keep CarRentalList */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarRentalPage;