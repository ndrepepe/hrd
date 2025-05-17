"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input"; // Import Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Label } from "@/components/ui/label"; // Import Label

interface Position {
  id: string;
  created_at: string;
  title: string;
  status: string; // Add status to Position interface
}

interface PositionListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const PositionList = ({ refreshTrigger }: PositionListProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for name search
  const [filterStatus, setFilterStatus] = useState("All"); // State for status filter, default to 'All'

  useEffect(() => {
    fetchPositions();
  }, [refreshTrigger, searchTerm, filterStatus]); // Depend on refreshTrigger, searchTerm, and filterStatus

  const fetchPositions = async () => {
    setLoading(true);
    console.log("Fetching positions with search term:", searchTerm, "and status filter:", filterStatus);

    let query = supabase
      .from("positions")
      .select("*") // Select all columns, including status
      .order("created_at", { ascending: false });

    // Apply name search filter if searchTerm is not empty
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      console.log(`Applying name filter: title ilike ${searchPattern}`);
      query = query.ilike("title", searchPattern);
    }

    // Apply status filter if filterStatus is not 'All'
    if (filterStatus !== "All") {
      console.log(`Applying status filter: status eq ${filterStatus}`);
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching positions:", error);
      showError("Gagal memuat data posisi: " + error.message);
    } else {
      console.log("Fetched positions:", data);
      setPositions(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar posisi...</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Posisi</h3>

      {/* Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
           <Label htmlFor="status-filter" className="shrink-0">Status:</Label>
           <Select value={filterStatus} onValueChange={setFilterStatus}>
             <SelectTrigger id="status-filter" className="w-full md:w-[150px]">
               <SelectValue placeholder="Pilih status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="All">Semua</SelectItem>
               <SelectItem value="Open">Open</SelectItem>
               <SelectItem value="Filled">Filled</SelectItem>
             </SelectContent>
           </Select>
        </div>
        {/* Name Search Input */}
        <div className="flex-grow"> {/* Allow input to take available space */}
            <Input
              placeholder="Cari nama posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
        </div>
      </div>


      {/* Position List Table */}
      {positions.length === 0 ? (
        <p>{(searchTerm || filterStatus !== "All") ? "Tidak ada posisi yang cocok dengan filter Anda." : "Belum ada posisi yang ditambahkan."}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Posisi</TableHead>
                <TableHead>Status</TableHead> {/* Add Status column header */}
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>{position.title}</TableCell>
                  <TableCell>{position.status}</TableCell> {/* Display status */}
                  <TableCell>{new Date(position.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PositionList;