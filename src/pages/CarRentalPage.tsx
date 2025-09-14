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
  const [activeTab, setActiveTab] = useState("add-rental");

  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);

  const handleCarAddedOrDeleted = () => {
    setRefreshCars(prev => prev + 1);
  };

  const handleRentalSubmitted = () => {
    setRefreshRentals(prev => prev + 1);
    setEditingRentalId(null);
  };

  const handleRentalEditClick = (rentalId: string) => {
    setEditingRentalId(rentalId);
    setActiveTab("add-rental");
  };

  return (
    <div className="container mx-auto px-4 pt-16 pb-8"> {/* Added pb-8 for bottom padding */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Modul Peminjaman Mobil</h1>
      <p className="text-center text-gray-600 mb-4 md:mb-8 text-sm md:text-base">
        Kelola daftar mobil dan catat peminjamannya di sini.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6"> {/* Reduced gap and mb for mobile */}
          <TabsTrigger 
            value="add-car" 
            className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2" // Smaller padding/text on mobile
          >
            Tambah Mobil
          </TabsTrigger>
          <TabsTrigger 
            value="list-cars" 
            className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
          >
            Daftar Mobil
          </TabsTrigger>
          <TabsTrigger 
            value="add-rental" 
            className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
          >
            Input Peminjaman
          </TabsTrigger>
          <TabsTrigger 
            value="list-rentals" 
            className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
          >
            Rekap Peminjaman
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[calc(100vh-280px)]"> {/* Ensure minimum height for content area */}
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
        </div>
      </Tabs>
    </div>
  );
};

export default CarRentalPage;