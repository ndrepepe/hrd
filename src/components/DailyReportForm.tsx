"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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

const formSchema = z.object({
  report_date: z.date({
    required_error: "Tanggal laporan wajib diisi.",
  }),
  employee_id: z.string({
    required_error: "Nama pelapor wajib dipilih.",
  }),
  activity: z.string().min(10, {
    message: "Deskripsi aktivitas harus minimal 10 karakter.",
  }),
  notes: z.string().optional(),
});

interface Employee {
  id: string;
  name: string;
}

interface DailyReportFormProps {
  onReportSubmitted: () => void;
}

const DailyReportForm = ({ onReportSubmitted }: DailyReportFormProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: undefined,
      employee_id: "",
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


  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting daily report:", values);

    const { data, error } = await supabase
      .from("daily_reports")
      .insert([
        {
          report_date: format(values.report_date, "yyyy-MM-dd"),
          employee_id: values.employee_id,
          activity: values.activity,
          notes: values.notes,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting daily report:", error);
      showError("Gagal menyimpan laporan harian: " + error.message);
    } else {
      console.log("Daily report inserted successfully:", data);
      showSuccess("Laporan harian berhasil disimpan!");
      form.reset({
        report_date: undefined,
        employee_id: "",
        activity: "",
        notes: "",
      });
      onReportSubmitted();
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Input Laporan Harian</h3>
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
                        {/* WRAP CONTENT IN SPAN */}
                        <span className="flex justify-between items-center w-full">
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </span>
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
                      // Removed value="" from disabled SelectItem
                      <SelectItem disabled>Memuat karyawan...</SelectItem>
                    ) : employees.length === 0 ? (
                       // Removed value="" from disabled SelectItem
                       <SelectItem disabled>Belum ada data karyawan</SelectItem>
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
          {/* Aktivitas Harian Field */}
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktivitas Harian</FormLabel>
                <FormControl>
                  <Textarea placeholder="Jelaskan aktivitas yang dilakukan hari ini..." {...field} />
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
                  <Textarea placeholder="Catatan tambahan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Simpan Laporan</Button>
        </form>
      </Form>
    </div>
  );
};

export default DailyReportForm;