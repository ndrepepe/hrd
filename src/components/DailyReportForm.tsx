"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // Import useRef and useCallback
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2 for loading indicator

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  employee_id: z.string({
    required_error: "Nama karyawan wajib dipilih.",
  }),
  report_date: z.date({
    required_error: "Tanggal laporan wajib diisi.",
  }),
  activity: z.string().min(5, {
    message: "Aktivitas harus minimal 5 karakter.",
  }),
  notes: z.string().optional(),
});

interface Employee {
  id: string;
  name: string;
}

interface DailyReportFormProps {
  onReportSubmitted: () => void;
  editingReportId: string | null;
  setEditingReportId: (id: string | null) => void;
  onCancelEdit: () => void;
}

const DailyReportForm = ({ onReportSubmitted, editingReportId, setEditingReportId, onCancelEdit }: DailyReportFormProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [lastSavedActivity, setLastSavedActivity] = useState(""); // State to track last saved activity content
  const [isAutoSaving, setIsAutoSaving] = useState(false); // State for auto-save loading indicator
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref for the auto-save timer

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      report_date: undefined,
      activity: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      showError("Gagal memuat daftar karyawan: " + error.message);
    } else {
      setEmployees(data || []);
    }
    setLoadingEmployees(false);
  };

  // Effect to load report data when editingReportId changes and initialize lastSavedActivity
  useEffect(() => {
    if (editingReportId) {
      const fetchReport = async () => {
        const { data, error } = await supabase
          .from("daily_reports")
          .select("*")
          .eq("id", editingReportId)
          .single();

        if (error) {
          console.error("Error fetching report for edit:", error);
          showError("Gagal memuat data laporan untuk diedit: " + error.message);
          setEditingReportId(null);
        } else if (data) {
          form.reset({
            ...data,
            employee_id: data.employee_id || "",
            report_date: data.report_date ? parseISO(data.report_date) : undefined,
            notes: data.notes || "",
            activity: data.activity || "",
          });
          setLastSavedActivity(data.activity || ""); // Initialize lastSavedActivity
        } else {
          showError("Data laporan tidak ditemukan.");
          setEditingReportId(null);
        }
      };
      fetchReport();
    } else {
      form.reset({
        employee_id: "",
        report_date: undefined,
        activity: "",
        notes: "",
      });
      setLastSavedActivity(""); // Reset for new reports
    }
  }, [editingReportId, form, setEditingReportId]);

  // Auto-save function, memoized with useCallback
  const autoSaveReport = useCallback(async () => {
    const currentValues = form.getValues();
    const currentActivity = currentValues.activity;

    // Only auto-save if activity has changed AND has content
    if (currentActivity === lastSavedActivity || !currentActivity || currentActivity.trim() === "") {
      return;
    }

    setIsAutoSaving(true);
    let result;
    const reportData = {
      employee_id: currentValues.employee_id || null,
      report_date: currentValues.report_date ? format(currentValues.report_date, "yyyy-MM-dd") : null,
      activity: currentActivity,
      notes: currentValues.notes || null,
    };

    // Validate required fields for new reports before auto-saving
    if (!editingReportId && (!reportData.employee_id || !reportData.report_date)) {
      // For auto-save, we might not want to show a strong error, just prevent saving incomplete new reports
      console.warn("Auto-save skipped: Employee and Report Date are required for new reports.");
      setIsAutoSaving(false);
      return;
    }

    if (!editingReportId) {
      // --- Validasi Duplikasi untuk Auto-save (Laporan Baru) ---
      const { data: existingReports, error: checkError } = await supabase
        .from("daily_reports")
        .select("id")
        .eq("employee_id", reportData.employee_id)
        .eq("report_date", reportData.report_date);

      if (checkError) {
        console.error("Error checking for existing reports during auto-save:", checkError);
        showError("Gagal memeriksa laporan yang sudah ada saat auto-save: " + checkError.message);
        setIsAutoSaving(false);
        return;
      }

      if (existingReports && existingReports.length > 0) {
        console.warn("Auto-save skipped: Laporan untuk karyawan dan tanggal ini sudah ada.");
        // Optionally, you could update the existing report here if that's desired for auto-save
        // For now, we'll just skip insertion to avoid duplicates.
        setIsAutoSaving(false);
        return;
      }
      // --- Akhir Validasi Duplikasi ---

      result = await supabase
        .from("daily_reports")
        .insert([reportData])
        .select();

      if (result.data && result.data.length > 0) {
        // If a new report was inserted, update editingReportId so subsequent auto-saves update it
        setEditingReportId(result.data[0].id);
      }
    } else {
      // Update existing report
      result = await supabase
        .from("daily_reports")
        .update(reportData)
        .eq("id", editingReportId)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error("Error auto-saving report:", error);
      showError("Gagal menyimpan otomatis laporan: " + error.message);
    } else {
      console.log("Report auto-saved successfully:", data);
      showSuccess("Laporan otomatis disimpan!");
      setLastSavedActivity(currentActivity); // Update last saved activity
    }
    setIsAutoSaving(false);
  }, [form, editingReportId, lastSavedActivity, setEditingReportId]); // Dependencies for useCallback

  // Effect for auto-save timer
  useEffect(() => {
    // Clear any existing timer when the component mounts or autoSaveReport dependency changes
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up a new interval for auto-save
    autoSaveTimerRef.current = setInterval(() => {
      autoSaveReport();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveReport]); // Depend on autoSaveReport (which is memoized by useCallback)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedReportDate = format(values.report_date, "yyyy-MM-dd");

    const reportData = {
      employee_id: values.employee_id,
      report_date: formattedReportDate,
      activity: values.activity,
      notes: values.notes || null,
    };

    let result;
    if (editingReportId) {
      // Jika sedang mengedit laporan yang sudah ada, langsung update
      result = await supabase
        .from("daily_reports")
        .update(reportData)
        .eq("id", editingReportId)
        .select();
    } else {
      // --- Validasi Duplikasi untuk Laporan Baru ---
      const { data: existingReports, error: checkError } = await supabase
        .from("daily_reports")
        .select("id")
        .eq("employee_id", values.employee_id)
        .eq("report_date", formattedReportDate);

      if (checkError) {
        console.error("Error checking for existing reports:", checkError);
        showError("Gagal memeriksa laporan yang sudah ada: " + checkError.message);
        return;
      }

      if (existingReports && existingReports.length > 0) {
        showError("Karyawan ini sudah memiliki laporan untuk tanggal yang sama. Silakan edit laporan yang sudah ada atau pilih tanggal lain.");
        return;
      }
      // --- Akhir Validasi Duplikasi ---

      // Jika tidak ada duplikasi, masukkan laporan baru
      result = await supabase
        .from("daily_reports")
        .insert([reportData])
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error(`Error ${editingReportId ? 'updating' : 'inserting'} report data:`, error);
      showError(`Gagal ${editingReportId ? 'memperbarui' : 'menyimpan'} laporan: ` + error.message);
    } else {
      showSuccess(`Laporan berhasil di${editingReportId ? 'perbarui' : 'simpan'}!`);
      form.reset();
      setEditingReportId(null);
      onReportSubmitted();
      setLastSavedActivity(values.activity); // Update last saved activity after manual save
    }
  }

  return (
    <div className="w-[90%] mx-auto">
      <h3 className="text-xl font-semibold mb-4">{editingReportId ? "Edit Laporan Harian" : "Input Laporan Harian"}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Karyawan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih karyawan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingEmployees ? (
                        <SelectItem disabled value="_loading_employees_">Memuat karyawan...</SelectItem>
                      ) : employees.length === 0 ? (
                         <SelectItem disabled value="_no_employees_">Belum ada karyawan</SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="report_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Laporan</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktivitas</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Deskripsikan aktivitas harian..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tambahkan catatan tambahan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" disabled={isAutoSaving}>
               {isAutoSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {editingReportId ? "Simpan Perubahan" : "Simpan Laporan"}
            </Button>
            {editingReportId && (
              <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isAutoSaving}>
                Batal Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DailyReportForm;