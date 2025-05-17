"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast"; // Import showSuccess
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Import Button
import { format } from "date-fns";

interface Rental {
  id: string;
  created_at: string;
  car_id: string | null; // Now references car_id
  car_name: string | null; // Keep for potential old data, but prefer cars.name
  borrower_name: string;
  driver_name: string | null;
  rent_date: string;
  start_time: string;
  end_time: string;
  cars?: { name: string } | null; // To fetch car name from the 'cars' table
}

interface CarRentalListProps {
  refreshTrigger: number; // New prop to trigger refresh
}

const CarRentalList = ({ refreshTrigger }: CarRentalListProps) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchRentals = async () => {
    setLoading(true);
    // Select rental data and join with 'cars' table to get the car name
    const { data, error } = await supabase
      .from("rentals")
      .select("*, cars(name)")
      .order("rent_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching rentals:", error);
      showError("Gagal memuat data rekap peminjaman: " + error.message);
    } else {
      setRentals(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data peminjaman ini?")) {
      const { error } = await supabase
        .from("rentals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting rental:", error);
        showError("Gagal menghapus data peminjaman: " + error.message);
      } else {
        showSuccess("Data peminjaman berhasil dihapus!");
        fetchRentals(); // Refresh the list after deletion
      }
    }
  };

  const handleEdit = (rental: Rental) => {
    console.log("Edit button clicked for rental ID:", rental.id);
    // TODO: Implement edit functionality (e.g., populate form)
    showError("Fitur edit belum diimplementasikan."); // Placeholder message
  };


  if (loading) {
    return <div className="container mx-auto p-4">Memuat rekap peminjaman...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Rekap Peminjaman Mobil</h2>
      {rentals.length === 0 ? (
        <p>Belum ada data peminjaman.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Nama Mobil</TableHead> {/* Display name from joined table */}
                <TableHead>Peminjam</TableHead>
                <TableHead>Sopir</TableHead>
                <TableHead>Aksi</TableHead> {/* New column header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{format(new Date(rental.rent_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{`${rental.start_time} - ${rental.end_time}`}</TableCell>
                  <TableCell>{rental.cars?.name || rental.car_name || "-"}</TableCell> {/* Use cars.name, fallback to car_name if exists */}
                  <TableCell>{rental.borrower_name}</TableCell>
                  <TableCell>{rental.driver_name || "-"}</TableCell>
                  <TableCell className="flex space-x-2"> {/* New column for buttons */}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rental)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(rental.id)}>Hapus</Button>
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

export default CarRentalList;