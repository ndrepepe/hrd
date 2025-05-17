"use client";

import { useEffect, useState } from "react";
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
import { format } from "date-fns";
import { CalendarIcon, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label"; // Import Label component

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
  refreshTrigger: number;
}

const CarRentalList = ({ refreshTrigger }: CarRentalListProps) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, [refreshTrigger, dateRange]);

  const fetchRentals = async () => {
    setLoading(true);
    let query = supabase
      .from("rentals")
      .select("*, cars(name)")
      .order("rent_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (dateRange?.from) {
      if (dateRange.to) {
        query = query.gte("rent_date", format(dateRange.from, "yyyy-MM-dd"))
                     .lte("rent_date", format(dateRange.to, "yyyy-MM-dd"));
      } else {
        query = query.eq("rent_date", format(dateRange.from, "yyyy-MM-dd"));
      }
    }

    const { data, error } = await query;

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
        fetchRentals();
      }
    }
  };

  const handleEdit = (rental: Rental) => {
    console.log("Edit button clicked for rental ID:", rental.id);
    showError("Fitur edit belum diimplementasikan.");
  };

  const handleClearFilter = () => {
    setDateRange(undefined);
    setIsCalendarOpen(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat rekap peminjaman...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Rekap Peminjaman Mobil</h3>

      {/* Date Filter Section */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Label className="mr-2">Filter Tanggal:</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pilih tanggal atau rentang</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                 setDateRange(range);
                 if (range?.from && range?.to) {
                    setIsCalendarOpen(false);
                 }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {dateRange?.from && (
          <Button variant="ghost" size="icon" onClick={handleClearFilter}>
            <XCircle className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Clear date filter</span>
          </Button>
        )}
      </div>

      {/* Rental List Table */}
      {rentals.length === 0 ? (
        <p>Belum ada data peminjaman untuk tanggal yang dipilih.</p>
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
                <TableHead>Aksi</TableHead>
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
                  <TableCell className="flex space-x-2">
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