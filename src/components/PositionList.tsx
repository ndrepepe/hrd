"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button
import EditPositionDialog from "./EditPositionDialog"; // Import the new dialog component

interface Position {
  id: string;
  created_at: string;
  title: string;
  status: string;
}

interface PositionListProps {
  refreshTrigger: number; // Prop to trigger refresh
  onPositionDeleted: () => void; // New callback for position deletion
  onPositionUpdated: () => void; // New callback for position update
}

// Define searchable fields
const searchableFields = [
  { label: "Nama Posisi", value: "title" }, // Changed label
];

const PositionList = ({ refreshTrigger, onPositionDeleted, onPositionUpdated }: PositionListProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState(searchableFields[0].value);
  const [filterStatus, setFilterStatus] = useState("All");

  const [selectedPositionForEdit, setSelectedPositionForEdit] = useState<Position | null>(null); // State for the position being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State to control dialog visibility

  useEffect(() => {
    fetchPositions();
  }, [refreshTrigger, searchTerm, searchField, filterStatus]);

  const fetchPositions = async () => {
    setLoading(true);
    console.log("Fetching positions with search term:", searchTerm, "in field:", searchField, "and status filter:", filterStatus);

    let query = supabase
      .from("positions")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply search filter if searchTerm is not empty
    if (searchTerm && searchField) {
      const searchPattern = `%${searchTerm}%`;
      console.log(`Applying filter: ${searchField} ilike ${searchPattern}`);
      query = query.ilike(searchField, searchPattern);
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
      setPositions([]);
    } else {
      console.log("Fetched positions:", data);
      setPositions(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus posisi ini? Ini tidak akan menghapus kandidat yang terkait, tetapi posisi ini tidak akan lagi muncul di dropdown posisi.")) {
      const { error } = await supabase
        .from("positions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting position:", error);
        showError("Gagal menghapus posisi: " + error.message);
      } else {
        showSuccess("Posisi berhasil dihapus!");
        fetchPositions(); // Refresh the list in this component
        onPositionDeleted(); // Notify parent (RecruitmentPage) to refresh candidate/interview/decision forms
      }
    }
  };

  const handleEditClick = (position: Position) => {
    setSelectedPositionForEdit(position); // Set the position data
    setIsEditDialogOpen(true); // Open the dialog
  };

  const handleEditDialogClose = () => {
    setSelectedPositionForEdit(null); // Clear the selected position data
    setIsEditDialogOpen(false); // Close the dialog
  };

  const handlePositionUpdated = () => {
    fetchPositions(); // Refresh the list after a position is updated
    onPositionUpdated(); // Notify parent (RecruitmentPage) to refresh candidate/interview/decision forms
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
        <div className="flex-grow">
            <Input
              placeholder={`Cari ${searchableFields.find(f => f.value === searchField)?.label || 'posisi'}...`}
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
                <TableHead>Status</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead> {/* New Action Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>{position.title}</TableCell>
                  <TableCell>{position.status}</TableCell>
                  <TableCell>{new Date(position.created_at).toLocaleString()}</TableCell>
                  <TableCell className="flex space-x-2"> {/* New Action Cell */}
                    {/* Call handleEditClick with the position data */}
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(position)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(position.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Render the EditPositionDialog */}
      <EditPositionDialog
        position={selectedPositionForEdit}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onPositionUpdated={handlePositionUpdated}
      />
    </div>
  );
};

export default PositionList;