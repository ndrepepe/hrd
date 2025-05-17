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

      {/* Tabs component wraps the sidebar and content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Flex container for sidebar (TabsList) and main content (TabsContent) */}
        <div className="flex flex-col md:flex-row gap-6"> {/* Use flex-col on small screens, flex-row on medium+ */}
          {/* Vertical TabsList (Sidebar) - Fixed on medium screens and up */}
          <TabsList className="flex flex-col w-full md:w-64 space-y-1 bg-gray-100 p-2 rounded-md flex-shrink-0
                              md:fixed md:top-16 md:bottom-0 md:left-0 md:overflow-y-auto md:z-40"> {/* Added fixed positioning classes */}
            <TabsTrigger value="add-car" className="justify-start">Tambah Nama Mobil</TabsTrigger> {/* Align text left */}
            <TabsTrigger value="list-cars" className="justify-start">Daftar Nama Mobil</TabsTrigger>
            <TabsTrigger value="add-rental" className="justify-start">Input Peminjaman Mobil</TabsTrigger>
            <TabsTrigger value="list-rentals" className="justify-start">Rekap Peminjaman Mobil</TabsTrigger>
          </TabsList>

          {/* Main content area - Add left margin on medium screens and up */}
          <div className="flex-grow md:ml-64"> {/* Takes remaining horizontal space, added md:ml-64 */}
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
        </div>
      </Tabs>
    </div>
  );
};

export default CarRentalPage;