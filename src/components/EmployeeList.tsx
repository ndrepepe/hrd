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
// Removed unused import: format

interface Employee {
  id: string;
  created_at: string;
  employee_id: string;
  name: string;
  position: string;
  // Removed hire_date, status, phone, email, address, date_of_birth, place_of_birth, last_education, major, skills, notes
}

interface EmployeeListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

// Define searchable fields
const searchableFields = [
  { label: "Nama", value: "name" },
  { label: "ID Karyawan", value: "employee_id" },
  { label: "Posisi", value: "position" },
  // Removed No HP and Email from searchable fields
];

const EmployeeList = ({ refreshTrigger }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [searchField, setSearchField] = useState(searchableFields[0].value); // State for selected search field, default to 'Nama'
  // Removed filterStatus state

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger, searchTerm, searchField]); // Depend on relevant triggers and filters

  const fetchEmployees = async () => {
    setLoading(true);
    console.log("Fetching employees with search term:", searchTerm, "in field:", searchField);

    let query = supabase
      .from("employees")
      .select("id, created_at, employee_id, name, position") // Select only the fields needed
      .order("created_at", { ascending: false }); // Order by creation date

    // Apply search filter if searchTerm is not empty
    if (searchTerm && searchField) {
      const searchPattern = `%${searchTerm}%`;
      console.log(`Applying filter: ${searchField} ilike ${searchPattern}`);
      query = query.ilike(searchField, searchPattern);
    }

    // Removed status filter logic

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
    <div className="w-full max-w-4xl mx-auto"> {/* Adjusted max-width */}
      <h3 className="text-xl font-semibold mb-4">Daftar Karyawan</h3>

      {/* Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
         {/* Removed Status Filter */}
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
        <p>{searchTerm ? "Tidak ada karyawan yang cocok dengan pencarian Anda." : "Belum ada data karyawan yang ditambahkan."}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Karyawan</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                {/* Removed TableHead for Tanggal Masuk, Status, No HP, Email */}
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
                  {/* Removed TableCell for hire_date, status, phone, email */}
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