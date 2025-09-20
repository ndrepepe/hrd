"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  report_date: z.date({
    required_error: "Tanggal laporan wajib diisi.",
  }),
  employee_id: z.string({ // Changed to required
    required_error: "Karyawan wajib dipilih.",
  }),
  reporter_name: z.string().min(2, {
    message: "Nama pelapor harus minimal 2 karakter.",
  }),
  activity: z.string().min(5, {
    message: "Aktivitas harus minimal 5 karakter.",
  }),
  hours_worked: z.coerce.number().min(0.1, {
    message: "Jam kerja harus lebih dari 0.",
  }).max(24, {
    message: "Jam kerja tidak boleh lebih dari 24.",
  }),
  notes: z.string().optional().nullable(),
});

interface Employee {
  id: string;
  name: string;
}

interface DailyReportFormProps {
  refreshReportsTrigger: number;
  onReportSubmitted: () => void;
  editingReportId: string | null;
  setEditingReportId: (id: string | null) => void;
}

const DailyReportForm = ({ refreshReportsTrigger, onReportSubmitted, editingReportId, setEditingReportId }: DailyReportFormProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: undefined,
      employee_id: "",
      reporter_name: "",
      activity: "",
      hours_worked: 0,
      notes: "",
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, [refreshReportsTrigger]);

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
            report_date: data.report_date ? parseISO(data.report_date) : undefined,
            hours_worked: parseFloat(data.hours_worked as string),
            notes: data.notes || "",
          });
        } else {
          showError("Data laporan tidak ditemukan.");
          setEditingReportId(null);
        }
      };
      fetchReport();
    } else {
      form.reset({
        report_date: undefined,
        employee_id: "",
        reporter_name: "",
        activity: "",
        hours_worked: 0,
        notes: "",
      });
    }
  }, [editingReportId, form, setEditingReportId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedReportDate = format(values.report_date, "yyyy-MM-dd");

    // --- Check for existing report for this employee on this date ---
    let existingReportQuery = supabase
      .from("daily_reports")
      .select("id")
      .eq("employee_id", values.employee_id)
      .eq("report_date", formattedReportDate);

    if (editingReportId) {
      existingReportQuery = existingReportQuery.neq("id", editingReportId);
    }

    const { data: existingReports, error: checkError } = await existingReportQuery;

    if (checkError) {
      console.error("Error checking for existing daily report:", checkError);
      showError("Gagal memeriksa laporan harian yang sudah ada: " + checkError.message);
      return;
    }

    if (existingReports && existingReports.length > 0) {
      showError("Karyawan ini sudah memiliki laporan harian untuk tanggal yang dipilih. Silakan edit laporan yang sudah ada atau pilih tanggal/karyawan lain.");
      return;
    }
    // --- End check for existing report ---

    const reportData = {
      report_date: formattedReportDate,
      employee_id: values.employee_id,
      reporter_name: values.reporter_name,
      activity: values.activity,
      hours_worked: values.hours_worked,
      notes: values.notes || null,
    };

    let result;
    if (editingReportId) {
      result = await supabase
        .from("daily_reports")
        .update(reportData)
        .eq("id", editingReportId)
        .select();
    } else {
      result = await supabase
        .from("daily_reports")
        .insert([reportData])
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error(`Error ${editingReportId ? 'updating' : 'inserting'} daily report data:`, error);
      showError(`Gagal ${editingReportId ? 'memperbarui' : 'menyimpan'} laporan harian: ` + error.message);
    } else {
      showSuccess(`Laporan harian berhasil di${editingReportId ? 'perbarui' : 'simpan'}!`);
      form.reset();
      setEditingReportId(null);
      onReportSubmitted();
    }
  }

  const handleCancelEdit = () => {
    setEditingReportId(null);
    form.reset({
      report_date: undefined,
      employee_id: "",
      reporter_name: "",
      activity: "",
      hours_worked: 0,
      notes: "",
    });
  };

  return (
    <div className="w-[90%] mx-auto">
      <h3 className="text-xl font-semibold mb-4">{editingReportId ? "Edit Laporan Harian" : "Input Laporan Harian"}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="report_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
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

          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Karyawan</FormLabel>
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
            name="reporter_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pelapor</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Budi Santoso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktivitas</FormLabel>
                <FormControl>
                  <Textarea placeholder="Contoh: Mengembangkan fitur baru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hours_worked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Kerja</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Contoh: 8.5" {...field} />
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
                  <Textarea placeholder="Catatan tambahan..." {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit">{editingReportId ? "Simpan Perubahan" : "Simpan Laporan"}</Button>
            {editingReportId && (
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
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