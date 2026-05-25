"use client";

import React, { useState } from 'react';
import CarRentalForm from "@/components/CarRentalForm";
import CarRentalList from "@/components/CarRentalList";
import CarForm from "@/components/CarForm";
import CarList from "@/components/CarList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car } from "lucide-react";

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
    <div className="app-shell">
      <div className="app-container">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
              <Car className="h-5 w-5" />
            </span>
            <div>
              <p className="page-kicker">Operasional Kendaraan</p>
              <h1 className="page-title">Modul Peminjaman Mobil</h1>
            </div>
          </div>
          <p className="page-description">
            Kelola daftar mobil dan catat peminjamannya di sini.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6 flex justify-center">
          <TabsList className="grid h-auto w-full max-w-4xl grid-cols-2 gap-2 p-1.5 sm:grid-cols-4"> {/* Use responsive grid for tidy submenu alignment */}
            <TabsTrigger value="add-car" className="w-full">Tambah Mobil</TabsTrigger>
            <TabsTrigger value="list-cars" className="w-full">Daftar Mobil</TabsTrigger>
            <TabsTrigger value="add-rental" className="w-full">Input Peminjaman</TabsTrigger>
            <TabsTrigger value="list-rentals" className="w-full">Rekap Peminjaman</TabsTrigger>
          </TabsList>
        </div>

        <div> {/* Simple wrapper for content */}
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
    </div>
  );
};

export default CarRentalPage;
