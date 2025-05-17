"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Rental {
  id: string;
  created_at: string;
  car_name: string;
  borrower_name: string;
  driver_name: string | null;
  rent_date: string;
  start_time: string;
  end_time: string;
}

const CarRentalList = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rentals")
      .select("*")
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
                <TableHead>Nama Mobil</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>Sopir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{format(new Date(rental.rent_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{`${rental.start_time} - ${rental.end_time}`}</TableCell>
                  <TableCell>{rental.car_name}</TableCell>
                  <TableCell>{rental.borrower_name}</TableCell>
                  <TableCell>{rental.driver_name || "-"}</TableCell>
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