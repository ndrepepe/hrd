"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns"; // Import parseISO
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "./RichTextEditor"; // Import the new RichTextEditor

const formSchema = z.object({
  report_date: z.date({
    required_error: "Tanggal laporan wajib diisi.",
  }),
  employee_id: z.string({
    required_error: "Nama pelapor wajib dipilih.",
  }),
  activity: z.string().min(10, { // Activity now expects HTML string
    message: "Deskripsi aktivitas harus minimal 10 karakter.",
  }),
  notes: z.string().optional().nullable(), // Make notes optional and nullable
});

interface Employee {
  id: string;
  name: string;
}

interface DailyReportFormProps {
  onReportSubmitted: () => void;
  editingReportId: string | null; // ID of the report being edited, or null for adding
  setEditingReportId: (id: string | null) => void; // Function to clear editing state
  onCancelEdit: () => void; // Callback to cancel edit mode
}

const DailyReportForm = ({ onReportSubmitted, editingReportId, setEditingReportId, onCancelEdit }: DailyReportFormProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: undefined,
      employee_id: "",
      activity: "", // Default to empty string for RichTextEditor
      notes: "",
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Effect to load report data when editingReportId changes
  useEffect(() => {
    if (editingReportId) {
      const fetchReport = async () => {
        const { data, error } = await supabase
          .from("daily_reports")
          .select("*") // Fetch all fields needed for the form
          .eq("id", editingReportId)
          .single();

        if (error) {
          console.error("Error fetching report for edit:", error);
          showError("Gagal memuat data laporan untuk diedit: " + error.message);
          setEditingReportId(null); // Clear editing state on error
        } else if (data) {
          // Populate the form with fetched data
          form.reset({
            ...data,
            // Convert date string to Date object for the date picker
            report_date: data.report_date ? parseISO(data.report_date) : undefined,
            // Ensure optional fields are handled correctly if null
            notes: data.notes || "",
            // Ensure employee_id is a string, even if null from DB
            employee_id: data.employee_id || "",
            // Activity content for RichTextEditor
            activity: data.activity || "",
          });
        } else {
           // Handle case where ID is not found
           showError("Data laporan tidak ditemukan.");
           setEditingReportId(null); // Clear editing state
        }
      };
      fetchReport();
    } else {
      // Reset form when not editing (e.g., switching back to add mode or after submission)
      form.reset({
        report_date: undefined,
        employee_id: "",
        activity: "",
        notes: "",
      });
    }
  }, [editingReportId, form, setEditingReportId]); // Depend on editingReportId and form/setEditingReportId

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      showError("Gagal memuat daftar karyawan: " + error.message);
      setEmployees([]);
    } else {
      console.log("Fetched employees:", data);
      setEmployees(data || []);
    }
    setLoadingEmployees(false);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true); // Start loading

    console.log("Submitting daily report:", values, "Editing ID:", editingReportId);

    const reportData = {
      report_date: format(values.report_date, "yyyy-MM-dd"),
      employee_id: values.employee_id,
      activity: values.activity, // activity now contains HTML string
      notes: values.notes || null, // Save empty string as null
    };

    let result;
    if (editingReportId) {
      // Update existing report
      result = await supabase
        .from("daily_reports")
        .update(reportData)
        .eq("id", editingReportId)
        .select();
    } else {
      // Add new report
      result = await supabase
        .from("daily_reports")
        .insert([reportData])
        .select();
    }

    const { data, error } = result;

    setIsSubmitting(false); // End loading

    if (error) {
      console.error(`Error ${editingReportId ? 'updating' : 'inserting'} daily report:`, error);
      showError(`Gagal ${editingReportId ? 'memperbarui' : 'menyimpan'} laporan harian: ` + error.message);
    } else {
      console.log(`Daily report ${editingReportId ? 'updated' : 'inserted'} successfully:`, data);
      showSuccess(`Laporan harian berhasil di${editingReportId ? 'perbarui' : 'simpan'}!`);
      form.reset(); // Reset form after successful submission
      setEditingReportId(null); // Clear editing state
      onReportSubmitted(); // Call the callback here
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">{editingReportId ? "Edit Laporan Harian" : "Input Laporan Harian"}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Tanggal Laporan Field */}
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
          {/* Nama Pelapor Field (Dropdown) */}
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pelapor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nama karyawan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingEmployees ? (
                      <SelectItem disabled value="_loading_employees_">Memuat karyawan...</SelectItem>
                    ) : employees.length === 0 ? (
                       <SelectItem disabled value="_no_employees_">Belum ada data karyawan</SelectItem>
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
          {/* Aktivitas Harian Field (RichTextEditor) */}
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktivitas Harian</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Jelaskan aktivitas yang dilakukan hari ini..."
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           {/* Catatan Field */}
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
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {editingReportId ? "Simpan Perubahan" : "Simpan Laporan"}
            </Button>
            {editingReportId && (
              <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isSubmitting}>
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