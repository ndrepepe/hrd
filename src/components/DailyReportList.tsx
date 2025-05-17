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

interface DailyReport {
  id: string;
  created_at: string;
  report_date: string;
  // Removed reporter_name field
  employee_id: string | null; // Add employee_id
  activity: string;
  notes: string | null;
  employees?: { name: string } | null; // Add joined employees data
}

interface DailyReportListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const DailyReportList = ({ refreshTrigger }: DailyReportListProps) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*, employees(name)") // Select all columns and join with employees to get name
      .order("report_date", { ascending: false })
      .order("created_at", { ascending: false }); // Order by creation time for reports on the same day

    if (error) {
      console.error("Error fetching daily reports:", error);
      showError("Gagal memuat data laporan harian: " + error.message);
      setReports([]); // Clear reports on error
    } else {
      console.log("Fetched daily reports data:", data);
      setReports(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat laporan harian...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Laporan Harian</h3>
      {reports.length === 0 ? (
        <p>Belum ada laporan harian yang ditambahkan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelapor</TableHead> {/* Keep header label */}
                <TableHead>Aktivitas</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{format(new Date(report.report_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{report.employees?.name || report.reporter_name || "-"}</TableCell> {/* Display employee name from join, fallback to old reporter_name if exists */}
                  <TableCell>{report.activity}</TableCell>
                  <TableCell>{report.notes || "-"}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DailyReportList;