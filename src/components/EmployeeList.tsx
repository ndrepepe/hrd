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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns"; // Keep format for date display
import { Button } from "@/components/ui/button"; // Import Button
import EditEmployeeDialog from "./EditEmployeeDialog"; // Import the new dialog component

interface Employee {
  id: string;
  created_at: string;
  employee_id: string;
  name: string;
  position: string;
  // Removed hire_date, place_of_birth, date_of_birth, last_education, major, skills, notes
  status: string;
  phone: string | null;
  email: string | null;
  user_id: string | null;
}

interface EmployeeListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

// Define searchable fields - Keep only fields that make sense for searching
const searchableFields = [
  { label: "Nama", value: "name" },
  { label: "ID Karyawan", value: "employee_id" },
  { label: "Posisi", value: "position" },
  { label: "No HP", value: "phone" }, // Keep phone for searching
  { label: "Email", value: "email" }, // Keep email for searching
];

const EmployeeList = ({ refreshTrigger }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [searchField, setSearchField] = useState(searchableFields[0].value); // State for selected search field, default to 'Nama'
  const [filterStatus, setFilterStatus] = useState("All"); // Keep status filter

  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null); // State for the employee being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State to control dialog visibility


  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger, searchTerm, searchField, filterStatus]); // Depend on relevant triggers and filters

  const fetchEmployees = async () => {
    setLoading(true);
    console.log("Fetching employees with search term:", searchTerm, "in field:", searchField, "and status filter:", filterStatus);

    let query = supabase
      .from("employees")
      // Select only the fields needed for the list view and search/filter
      .select("id, created_at, employee_id, name, position, status, phone, email, user_id")
      .order("created_at", { ascending: false }); // Order by creation date

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
      console.error("Error fetching employees:", error);
      showError("Gagal memuat data karyawan: " + error.message);
      setEmployees([]); // Clear employees on error
    } else {
      console.log("Fetched employees data:", data);
      setEmployees(data as Employee[] || []); // Cast to Employee[]
    }
    setLoading(false);
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployeeForEdit(employee); // Set the employee data
    setIsEditDialogOpen(true); // Open the dialog
  };

  const handleEditDialogClose = () => {
    setSelectedEmployeeForEdit(null); // Clear the selected employee data
    setIsEditDialogOpen(false); // Close the dialog
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees(); // Refresh the list after an employee is updated
    // No need to notify parent here unless parent needs to react to *any* employee update
  };

  const handleDelete = async (id: string) => {
     // --- Start Validation Check: Check for linked daily reports ---
     console.log("Checking for daily reports linked to employee ID:", id);
     const { data: reportsData, error: reportsError } = await supabase
       .from("daily_reports")
       .select("id") // We only need to know if any exist
       .eq("employee_id", id)
       .limit(1); // Stop after finding the first one

     if (reportsError) {
       console.error("Error checking for linked daily reports:", reportsError);
       showError("Gagal memeriksa laporan harian terkait: " + reportsError.message);
       return; // Stop the delete process
     }

     if (reportsData && reportsData.length > 0) {
       console.log("Found linked daily reports, preventing deletion.");
       showError("Karyawan ini tidak dapat dihapus karena sudah memiliki laporan harian terkait.");
       return; // Stop the delete process
     }
     // --- End Validation Check ---

     // --- Start Validation Check: Check for linked user account ---
     // Note: Deleting the employee record does NOT delete the Supabase Auth user account.
     // However, we might want to prevent deleting an employee if they are linked to an active user account
     // to avoid orphaned user accounts or unexpected behavior.
     // For now, let's allow deletion even if linked, but warn the user or add a specific check if needed.
     // The current schema allows NULL user_id, so deleting the employee record is fine from a DB perspective.
     // If you wanted to prevent deletion of linked employees, you'd add a check here similar to the reports check.
     // console.log("Checking for linked user account for employee ID:", id);
     // const { data: userData, error: userError } = await supabase
     //   .from("employees")
     //   .select("user_id")
     //   .eq("id", id)
     //   .not("user_id", "is", null)
     //   .single();
     // if (userError && userError.code !== 'PGRST116') { // PGRST116 means no rows found
     //    console.error("Error checking for linked user account:", userError);
     //    showError("Gagal memeriksa akun pengguna terkait: " + userError.message);
     //    return;
     // }
     // if (userData && userData.user_id) {
     //    console.log("Found linked user account, preventing deletion.");
     //    showError("Karyawan ini tidak dapat dihapus karena sudah terhubung dengan akun pengguna.");
     //    return;
     // }
     // --- End Validation Check ---


    if (window.confirm("Apakah Anda yakin ingin menghapus data karyawan ini? Laporan harian yang terkait tidak akan terhapus.")) {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting employee:", error);
        showError("Gagal menghapus data karyawan: " + error.message);
      } else {
        showSuccess("Data karyawan berhasil dihapus!");
        fetchEmployees(); // Refresh the list
        // No need to notify parent here unless parent needs to react to deletion
      }
    }
  };


  if (loading) {
    return <p>Memuat daftar karyawan...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto"> {/* Adjusted max-width */}
      <h3 className="text-xl font-semibold mb-4">Daftar Karyawan</h3>

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
               <SelectItem value="Active">Active</SelectItem>
               <SelectItem value="Inactive">Inactive</SelectItem>
               <SelectItem value="Terminated">Terminated</SelectItem>
             </SelectContent>
           </Select>
        </div>
        {/* Search Field Select */}
        <div className="flex items-center gap-2">
           <Label htmlFor="search-field" className="shrink-0">Cari Berdasarkan:</Label>
           <Select value={searchField} onValueChange={setSearchField}>
             <SelectTrigger id="search-field" className="w-full md:w-[180px]">
               <SelectValue placeholder="Pilih field" />
             </SelectTrigger>
             <SelectContent>
               {searchableFields.map((field) => (
                 <SelectItem key={field.value} value={field.value}>
                   {field.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
        {/* Search Input */}
        <div className="flex-grow"> {/* Allow input to take available space */}
            <Input
              placeholder={`Cari ${searchableFields.find(f => f.value === searchField)?.label || 'karyawan'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
        </div>
      </div>


      {/* Employee List Table */}
      {employees.length === 0 ? (
        <p>{(searchTerm || filterStatus !== "All") ? "Tidak ada karyawan yang cocok dengan filter Anda." : "Belum ada data karyawan yang ditambahkan."}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Karyawan</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                {/* Removed Tanggal Masuk */}
                <TableHead>Status</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Email</TableHead>
                {/* Removed Tempat/Tgl Lahir */}
                {/* Removed Pendidikan */}
                {/* Removed Skill */}
                {/* Removed Catatan */}
                <TableHead>Akun Terhubung</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  {/* Removed Tanggal Masuk cell */}
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>{employee.phone || "-"}</TableCell>
                  <TableCell>{employee.email || "-"}</TableCell>
                   {/* Removed Tempat/Tgl Lahir cell */}
                   {/* Removed Pendidikan cell */}
                   {/* Removed Skill cell */}
                   {/* Removed Catatan cell */}
                  <TableCell>{employee.user_id ? "Terhubung" : "Belum Terhubung"}</TableCell>
                  <TableCell>{new Date(employee.created_at).toLocaleString()}</TableCell>
                  <TableCell className="flex space-x-2">
                     <Button variant="outline" size="sm" onClick={() => handleEditClick(employee)}>Edit</Button>
                     <Button variant="destructive" size="sm" onClick={() => handleDelete(employee.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Render the EditEmployeeDialog */}
      <EditEmployeeDialog
        employee={selectedEmployeeForEdit}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    </div>
  );
};

export default EmployeeList;