"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast"; // Import showSuccess
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
import { Edit, Trash2 } from "lucide-react"; // Import icons

interface Rental {
  id: string;
  created_at: string;
  car_id: string | null;
  car_name: string | null;
  borrower_name: string;
  driver_name: string | null;
  rent_date: string;
  start_time: string;
  end_time: string;
  cars?: { name: string } | null;
}

interface CarRentalListProps {
  refreshTrigger: number; // Prop to trigger refresh from parent
  onEditClick: (rental: Rental) => void; // Callback for edit button click
}

const CarRentalList = ({ refreshTrigger, onEditClick }: CarRentalListProps) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchRentals = async () => {
    setLoading(true);
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

  const handleDelete = async (rentalId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data peminjaman ini?")) {
      const { error } = await supabase
        .from("rentals")
        .delete()
        .eq("id", rentalId);

      if (error) {
        console.error("Error deleting rental:", error);
        showError("Gagal menghapus data peminjaman: " + error.message);
      } else {
        showSuccess("Data peminjaman berhasil dihapus!");
        fetchRentals(); // Refresh the list after deletion
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat rekap peminjaman...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Rekap Peminjaman Mobil</h3>
      {rentals.length === 0 ? (
        <p>Belum ada data peminjaman.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Nama Mobil</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>Sopir</TableHead>
                <TableHead>Aksi</TableHead> {/* Add Actions column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{format(new Date(rental.rent_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{`${rental.start_time} - ${rental.end_time}`}</TableCell>
                  <TableCell>{rental.cars?.name || rental.car_name || "-"}</TableCell>
                  <TableCell>{rental.borrower_name}</TableCell>
                  <TableCell>{rental.driver_name || "-"}</TableCell>
                  <TableCell className="flex space-x-2"> {/* Actions cell */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(rental)} // Call onEditClick
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(rental.id)} // Call handleDelete
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Hapus
                    </Button>
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