"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Car {
  id: string;
  created_at: string;
  name: string;
}

interface CarListProps {
  refreshTrigger: number; // Prop to trigger refresh
  onCarDeleted: () => void; // Callback to notify parent when a car is deleted
  onEditClick: (carId: string) => void; // New callback for edit button click
}

const CarList = ({ refreshTrigger, onCarDeleted, onEditClick }: CarListProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("name", { ascending: true }); // Order by name

    if (error) {
      console.error("Error fetching cars:", error);
      showError("Gagal memuat daftar mobil: " + error.message);
    } else {
      setCars(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus mobil ini? Rekap peminjaman yang terkait tidak akan terhapus, namun nama mobil akan hilang dari rekap tersebut.")) {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting car:", error);
        showError("Gagal menghapus mobil: " + error.message);
      } else {
        showSuccess("Mobil berhasil dihapus!");
        fetchCars(); // Refresh the list in this component
        onCarDeleted(); // Notify parent (CarRentalPage) to refresh the form's car list and clear editing state
      }
    }
  };

  const handleEdit = (car: Car) => {
    console.log("Edit button clicked for car ID:", car.id);
    onEditClick(car.id); // Call the parent's edit handler
  };

  if (loading) {
    return <p>Memuat daftar mobil...</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Nama Mobil</h3>
      {cars.length === 0 ? (
        <p>Belum ada nama mobil yang ditambahkan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Mobil</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{new Date(car.created_at).toLocaleString()}</TableCell>
                  <TableCell className="flex space-x-2">
                    {/* Use car.id for editing */}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(car.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CarList;