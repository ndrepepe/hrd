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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Employee {
  id: string;
  created_at: string;
  employee_id: string;
  name: string;
  position: string;
  hire_date: string;
  status: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
  notes: string | null;
}

interface EmployeeListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

// Define searchable fields
const searchableFields = [
  { label: "Nama", value: "name" },
  { label: "ID Karyawan", value: "employee_id" },
  { label: "Posisi", value: "position" },
  { label: "Nomor HP", value: "phone" },
  { label: "Email", value: "email" },
];

const EmployeeList = ({ refreshTrigger }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [searchField, setSearchField] = useState(searchableFields[0].value); // State for selected search field, default to 'Nama'
  const [filterStatus, setFilterStatus] = useState("All"); // State for status filter, default to 'All'

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger, searchTerm, searchField, filterStatus]); // Depend on ALL relevant triggers and filters

  const fetchEmployees = async () => {
    setLoading(true);
    console.log("Fetching employees with search term:", searchTerm, "in field:", searchField, "and status filter:", filterStatus);

    let query = supabase
      .from("employees")
      .select("*")
      .order("hire_date", { ascending: false }) // Order by hire date
      .order("created_at", { ascending: false }); // Secondary order

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
      setEmployees(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar karyawan...</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto"> {/* Increased max-width */}
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
               <SelectItem value="On Leave">On Leave</SelectItem>
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
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                {/* Add more columns as needed */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{format(new Date(employee.hire_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>{employee.phone || "-"}</TableCell>
                  <TableCell>{employee.email || "-"}</TableCell>
                  <TableCell>{new Date(employee.created_at).toLocaleString()}</TableCell>
                  {/* Add more cells for other fields */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;