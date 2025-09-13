"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale
import { Edit, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

interface DailyReport {
  id: string;
  created_at: string;
  report_date: string;
  employee_id: string;
  activity: string;
  notes: string | null;
  employees: {
    name: string;
  } | null;
}

interface DailyReportListProps {
  refreshTrigger: number;
  onEditClick: (reportId: string) => void;
}

const DailyReportList = ({ refreshTrigger, onEditClick }: DailyReportListProps) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyReports();
  }, [refreshTrigger]);

  const fetchDailyReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select(`
        id,
        created_at,
        report_date,
        employee_id,
        activity,
        notes,
        employees (name)
      `)
      .order("report_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching daily reports:", error);
      showError("Gagal memuat daftar laporan harian: " + error.message);
    } else {
      // Use double cast to explicitly tell TypeScript the shape of the data
      setReports((data as unknown as DailyReport[]) || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      return;
    }

    const { error } = await supabase
      .from("daily_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting report:", error);
      showError("Gagal menghapus laporan: " + error.message);
    } else {
      showSuccess("Laporan berhasil dihapus!");
      fetchDailyReports(); // Refresh the list
    }
  };

  if (loading) {
    return <div className="text-center py-8">Memuat laporan harian...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-center py-8">Belum ada laporan harian.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Laporan Harian</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Karyawan</TableHead>
            <TableHead>Aktivitas</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{format(parseISO(report.report_date), "dd MMMM yyyy", { locale: id })}</TableCell>
              <TableCell>{report.employees?.name || "N/A"}</TableCell>
              <TableCell dangerouslySetInnerHTML={{ __html: report.activity }} />
              <TableCell>{report.notes || "-"}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEditClick(report.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(report.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailyReportList;