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
import { Input } from "@/components/ui/input"; // Keep Input for potential future search, though not used for now
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button for clear filter
import { CalendarIcon, XCircle } from "lucide-react"; // Import icons
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
import { cn } from "@/lib/utils"; // Import cn for class merging
import { DateRange } from "react-day-picker"; // Import DateRange type

interface DailyReport {
  id: string;
  created_at: string;
  report_date: string;
  employee_id: string | null;
  activity: string;
  notes: string | null;
  employees?: { name: string } | null;
}

interface Employee {
  id: string;
  name: string;
}

interface DailyReportListProps {
  refreshTrigger: number; // Prop to trigger refresh
  onEditClick: (reportId: string) => void; // New callback for edit button click
}

const DailyReportList = ({ refreshTrigger, onEditClick }: DailyReportListProps) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]); // State for employees dropdown
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All"); // State for employee filter, default 'All'
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); // State for date range filter
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to control calendar popover

  useEffect(() => {
    fetchEmployees(); // Fetch employees when component mounts
  }, []);

  useEffect(() => {
    fetchReports(); // Fetch reports when refreshTrigger, employee filter, or date filter changes
  }, [refreshTrigger, selectedEmployeeId, dateRange]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching employees for filter:", error);
      showError("Gagal memuat daftar karyawan untuk filter: " + error.message);
      setEmployees([]);
    } else {
      console.log("Fetched employees for filter:", data);
      setEmployees(data || []);
    }
    setLoadingEmployees(false);
  };


  const fetchReports = async () => {
    setLoadingReports(true);
    console.log("Fetching daily reports with filters - Employee:", selectedEmployeeId, "Date Range:", dateRange);

    let query = supabase
      .from("daily_reports")
      .select("*, employees(name)")
      .order("report_date", { ascending: false })
      .order("created_at", { ascending: false });

    // Apply employee filter if not 'All'
    if (selectedEmployeeId !== "All") {
      console.log(`Applying employee filter: employee_id eq ${selectedEmployeeId}`);
      query = query.eq("employee_id", selectedEmployeeId);
    }

    // Apply date range filter
    if (dateRange?.from) {
      if (dateRange.to) {
        console.log(`Applying date filter: report_date between ${format(dateRange.from, "yyyy-MM-dd")} and ${format(dateRange.to, "yyyy-MM-dd")}`);
        query = query.gte("report_date", format(dateRange.from, "yyyy-MM-dd"))
                     .lte("report_date", format(dateRange.to, "yyyy-MM-dd"));
      } else {
        console.log(`Applying date filter: report_date eq ${format(dateRange.from, "yyyy-MM-dd")}`);
        query = query.eq("report_date", format(dateRange.from, "yyyy-MM-dd"));
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching daily reports:", error);
      showError("Gagal memuat data laporan harian: " + error.message);
      setReports([]);
    } else {
      console.log("Fetched daily reports data:", data);
      setReports(data || []);
    }
    setLoadingReports(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan harian ini?")) {
      const { error } = await supabase
        .from("daily_reports")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting daily report:", error);
        showError("Gagal menghapus laporan harian: " + error.message);
      } else {
        showSuccess("Laporan harian berhasil dihapus!");
        fetchReports(); // Refresh the list
      }
    }
  };

  const handleEdit = (report: DailyReport) => {
    console.log("Edit button clicked for report ID:", report.id);
    onEditClick(report.id); // Call the parent's edit handler
  };

  const handleClearDateFilter = () => {
    setDateRange(undefined);
    setIsCalendarOpen(false);
  };


  if (loadingReports || loadingEmployees) {
    return <div className="container mx-auto p-4">Memuat laporan harian...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Laporan Harian</h3>

      {/* Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        {/* Employee Filter */}
        <div className="flex items-center gap-2">
           <Label htmlFor="employee-filter" className="shrink-0">Pelapor:</Label>
           <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
             <SelectTrigger id="employee-filter" className="w-full md:w-[200px]">
               <SelectValue placeholder="Semua Pelapor" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="All">Semua Pelapor</SelectItem>
               {employees.map((employee) => (
                 <SelectItem key={employee.id} value={employee.id}>
                   {employee.name}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
           <Label className="shrink-0">Tanggal:</Label>
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
                    // Close calendar if both start and end dates are selected
                    if (range?.from && range?.to) {
                       setIsCalendarOpen(false);
                    }
                 }}
                 numberOfMonths={2}
               />
             </PopoverContent>
           </Popover>
           {dateRange?.from && (
             <Button variant="ghost" size="icon" onClick={handleClearDateFilter}>
               <XCircle className="h-5 w-5 text-gray-500" />
               <span className="sr-only">Clear date filter</span>
             </Button>
           )}
        </div>
      </div>


      {/* Daily Report List Table */}
      {reports.length === 0 ? (
        <p>Belum ada laporan harian yang cocok dengan filter Anda.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead> {/* New Action Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{format(new Date(report.report_date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{report.employees?.name || "-"}</TableCell> {/* Display employee name from join */}
                  <TableCell>{report.activity}</TableCell>
                  <TableCell>{report.notes || "-"}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                  <TableCell className="flex space-x-2"> {/* New Action Cell */}
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