"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import AddCarForm from "@/components/AddCarForm";
import CarList from "@/components/CarList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0);
  const [refreshRentals, setRefreshRentals] = useState(0);
  const [activeTab, setActiveTab] = useState("add-rental"); // State to manage active tab

  const handleCarAddedOrDeleted = () => {
    setRefreshCars(prev => prev + 1);
  };

  const handleRentalSubmitted = () => {
    setRefreshRentals(prev => prev + 1);
  };

  // Estimate the height of the fixed header (title, description, tabs list, padding)
  // This is an approximation, adjust mt- value below if needed
  const fixedHeaderHeightEstimate = 'mt-56'; // Roughly 14rem or 224px

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      {/* Fixed header container */}
      <div className="fixed top-16 left-0 right-0 z-50 w-full bg-white shadow-md">
        <div className="container mx-auto p-4"> {/* Inner container to match page width */}
          <h1 className="text-3xl font-bold mb-2 text-center">Modul Peminjaman Mobil</h1>
          <p className="text-center text-gray-600 mb-4">
            Kelola daftar mobil dan catat peminjamannya di sini.
          </p>
          {/* Tabs component for the fixed header (only TabsList visible here) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="add-car">Tambah Nama Mobil</TabsTrigger>
              <TabsTrigger value="list-cars">Daftar Nama Mobil</TabsTrigger>
              <TabsTrigger value="add-rental">Input Peminjaman Mobil</TabsTrigger>
              <TabsTrigger value="list-rentals">Rekap Peminjaman Mobil</TabsTrigger>
            </TabsList>
            {/* TabsContent components are NOT rendered here, they are rendered below */}
          </Tabs>
        </div>
      </div>

      {/* Scrolling content area */}
      {/* Add top margin to push content down below the fixed header */}
      <div className={`${fixedHeaderHeightEstimate}`}>
        {/* Conditionally render content based on activeTab state */}
        {activeTab === "add-car" && (
          <TabsContent value="add-car" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            <AddCarForm onCarAdded={handleCarAddedOrDeleted} />
          </TabsContent>
        )}
        {activeTab === "list-cars" && (
          <TabsContent value="list-cars" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            <CarList refreshTrigger={refreshCars} onCarDeleted={handleCarAddedOrDeleted} />
          </TabsContent>
        )}
        {activeTab === "add-rental" && (
          <TabsContent value="add-rental" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            <CarRentalForm refreshCarsTrigger={refreshCars} onRentalSubmitted={handleRentalSubmitted} />
          </TabsContent>
        )}
        {activeTab === "list-rentals" && (
          <TabsContent value="list-rentals" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            <CarRentalList refreshTrigger={refreshRentals} />
          </TabsContent>
        )}
      </div>
    </div>
  );
};

export default CarRentalPage;