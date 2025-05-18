"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import CarForm from "@/components/CarForm";
import CarList from "@/components/CarList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0);
  const [refreshRentals, setRefreshRentals] = useState(0);
  const [activeTab, setActiveTab] = useState("add-rental"); // State to manage active tab

  // State for editing rental (edit car is now handled within CarList)
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);

  // This callback is used by CarForm (add) and CarList (delete/edit dialog)
  const handleCarAddedOrDeleted = () => {
    setRefreshCars(prev => prev + 1);
    // No need to clear editingCarId here anymore, it's managed in CarList
  };

  const handleRentalSubmitted = () => {
    setRefreshRentals(prev => prev + 1);
    // Clear editing state after submission (add or edit)
    setEditingRentalId(null);
    // Optionally switch back to list view after adding/editing
    // setActiveTab("list-rentals");
  };

  // Removed handleCarEditClick

  const handleRentalEditClick = (rentalId: string) => {
    setEditingRentalId(rentalId);
    setActiveTab("add-rental"); // Switch to the form tab
  };

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Peminjaman Mobil</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola daftar mobil dan catat peminjamannya di sini.
      </p>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6"> {/* Added mb-6 for spacing below tabs */}
          <TabsTrigger value="add-car">Tambah Nama Mobil</TabsTrigger>
          <TabsTrigger value="list-cars">Daftar Nama Mobil</TabsTrigger>
          <TabsTrigger value="add-rental">Input Peminjaman Mobil</TabsTrigger>
          <TabsTrigger value="list-rentals">Rekap Peminjaman Mobil</TabsTrigger>
        </TabsList>

        {/* TabsContent area - Removed the extra div wrapper */}
        <TabsContent value="add-car" className="mt-0">
          <CarForm onCarAdded={handleCarAddedOrDeleted} />
        </TabsContent>

        <TabsContent value="list-cars" className="mt-0">
          <CarList
            refreshTrigger={refreshCars}
            onCarDeleted={handleCarAddedOrDeleted}
          />
        </TabsContent>

        <TabsContent value="add-rental" className="mt-0">
          <CarRentalForm
            refreshCarsTrigger={refreshCars}
            onRentalSubmitted={handleRentalSubmitted}
            editingRentalId={editingRentalId}
            setEditingRentalId={setEditingRentalId}
          />
        </TabsContent>

        <TabsContent value="list-rentals" className="mt-0">
          <CarRentalList
            refreshTrigger={refreshRentals}
            onEditClick={handleRentalEditClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarRentalPage;