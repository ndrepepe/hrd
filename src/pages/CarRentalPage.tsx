"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import CarForm from "@/components/CarForm"; // Renamed import
import CarList from "@/components/CarList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CarRentalPage = () => {
  const [refreshCars, setRefreshCars] = useState(0);
  const [refreshRentals, setRefreshRentals] = useState(0);
  const [activeTab, setActiveTab] = useState("add-rental"); // State to manage active tab

  // State for editing
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);

  const handleCarAddedOrDeleted = () => {
    setRefreshCars(prev => prev + 1);
    // Clear editing state if a car was added/deleted while editing
    setEditingCarId(null);
  };

  const handleRentalSubmitted = () => {
    setRefreshRentals(prev => prev + 1);
    // Clear editing state after submission (add or edit)
    setEditingRentalId(null);
    // Optionally switch back to list view after adding/editing
    // setActiveTab("list-rentals");
  };

  const handleCarEditClick = (carId: string) => {
    setEditingCarId(carId);
    setActiveTab("add-car"); // Switch to the form tab
  };

  const handleRentalEditClick = (rentalId: string) => {
    setEditingRentalId(rentalId);
    setActiveTab("add-rental"); // Switch to the form tab
  };

  // Estimate the height of the fixed header (title, description, tabs list, padding)
  // This is an approximation, adjust mt- value below if needed
  const contentAreaMarginTop = 'mt-56'; // Roughly 14rem or 224px

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      {/* Tabs component wraps everything */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Fixed container for Title, Description, and TabsList */}
        <div className="fixed top-16 left-0 right-0 z-50 w-full bg-white shadow-md">
           <div className="container mx-auto p-4"> {/* Inner container */}
              <h1 className="text-3xl font-bold mb-2 text-center">Modul Peminjaman Mobil</h1>
              <p className="text-center text-gray-600 mb-4">
                Kelola daftar mobil dan catat peminjamannya di sini.
              </p>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="add-car">Tambah Nama Mobil</TabsTrigger>
                <TabsTrigger value="list-cars">Daftar Nama Mobil</TabsTrigger>
                <TabsTrigger value="add-rental">Input Peminjaman Mobil</TabsTrigger>
                <TabsTrigger value="list-rentals">Rekap Peminjaman Mobil</TabsTrigger>
              </TabsList>
           </div>
        </div>

        {/* Scrolling content area */}
        {/* Add top margin to push content down below the fixed header */}
        <div className={`${contentAreaMarginTop}`}>
          <TabsContent value="add-car" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            {/* Pass editing state and setter to CarForm */}
            <CarForm
              onCarAdded={handleCarAddedOrDeleted}
              editingCarId={editingCarId}
              setEditingCarId={setEditingCarId}
            />
          </TabsContent>

          <TabsContent value="list-cars" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            {/* Pass edit click handler to CarList */}
            <CarList
              refreshTrigger={refreshCars}
              onCarDeleted={handleCarAddedOrDeleted}
              onEditClick={handleCarEditClick}
            />
          </TabsContent>

          <TabsContent value="add-rental" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            {/* Pass editing state and setter to CarRentalForm */}
            <CarRentalForm
              refreshCarsTrigger={refreshCars}
              onRentalSubmitted={handleRentalSubmitted}
              editingRentalId={editingRentalId}
              setEditingRentalId={setEditingRentalId}
            />
          </TabsContent>

          <TabsContent value="list-rentals" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
            {/* Pass edit click handler to CarRentalList */}
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