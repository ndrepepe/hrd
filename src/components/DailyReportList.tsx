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
import { CalendarIcon, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DailyReport {
  id: string;
  created_at: string;
  employee_id: string;
  report_date: string;
  activity: string;
  hours_worked: number;
  notes: string | null;
  employees?: { name: string } | null; // To fetch employee name
}

interface DailyReportListProps {
  refreshTrigger: number;
  onEditClick: (reportId: string) => void;
}

const DailyReportList = ({ refreshTrigger, onEditClick }: DailyReportListProps) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from("daily_reports")
      .select("*, employees(name)")
      .order("report_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (dateRange?.from) {
      if (dateRange.to) {
        query = query.gte("report_date", format(dateRange.from, "yyyy-MM-dd"))
                     .lte("report_date", format(dateRange.to, "yyyy-MM-dd"));
      } else {
        query = query.eq("report_date", format(dateRange.from, "yyyy-MM-dd"));
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching daily reports:", error);
      showError("Gagal memuat data laporan harian: " + error.message);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan harian ini?")) {
      const { error } = await supabase
        .from("daily_reports")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting report:", error);
        showError("Gagal menghapus laporan harian: " + error.message);
      } else {
        showSuccess("Laporan harian berhasil dihapus!");
        fetchReports();
      }
    }
  };

  const handleEdit = (report: DailyReport) => {
    onEditClick(report.id);
  };

  const handleClearFilter = () => {
    setDateRange(undefined);
    setIsCalendarOpen(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat laporan harian...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Rekap Laporan Harian</h3>

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

      {reports.length === 0 ? (
        <p>Belum ada laporan harian untuk tanggal yang dipilih.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Karyawan</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Jam Kerja</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{format(new Date(report.report_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{report.employees?.name || "N/A"}</TableCell>
                  <TableCell>{report.activity}</TableCell>
                  <TableCell>{report.hours_worked}</TableCell>
                  <TableCell>{report.notes || "-"}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(report.id)}>Hapus</Button>
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

export default DailyReportList;