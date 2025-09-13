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
    }
  }, [editingReportId, form, setEditingReportId]);

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

    const { error } = result;

    if (error) {
      console.error(`Error ${editingReportId ? 'updating' : 'inserting'} report data:`, error);
      showError(`Gagal ${editingReportId ? 'memperbarui' : 'menyimpan'} laporan: ` + error.message);
    } else {
      showSuccess(`Laporan berhasil di${editingReportId ? 'perbarui' : 'simpan'}!`);
      form.reset();
      setEditingReportId(null);
      onReportSubmitted();
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
                <FormItem> {/* Removed className="flex flex-col" */}
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
          </div> {/* End of horizontal wrapper */}

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
            <Button type="submit">{editingReportId ? "Simpan Perubahan" : "Simpan Laporan"}</Button>
            {editingReportId && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
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