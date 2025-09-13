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
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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
  refreshTrigger: number;
  onEditClick: (employeeId: string) => void;
}

const EmployeeList = ({ refreshTrigger, onEditClick }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      showError("Gagal memuat data karyawan: " + error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting employee:", error);
        showError("Gagal menghapus data karyawan: " + error.message);
      } else {
        showSuccess("Data karyawan berhasil dihapus!");
        fetchEmployees();
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    onEditClick(employee.id);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat data karyawan...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Karyawan</h3>
      {employees.length === 0 ? (
        <p>Belum ada data karyawan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Karyawan</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>{format(new Date(employee.hire_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(employee.id)}>Hapus</Button>
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

export default EmployeeList;