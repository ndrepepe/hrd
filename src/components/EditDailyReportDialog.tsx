"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns"; // Import parseISO
import { CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";

// Define the schema for the form fields
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
  notes: z.string().optional().nullable(), // Make notes optional and nullable
});

// Define the type for the data passed to the dialog
interface DailyReportData {
  id: string;
  report_date: string; // Date is string from DB
  employee_id: string | null;
  activity: string;
  notes: string | null;
}

interface Employee {
  id: string;
  name: string;
}

interface EditDailyReportDialogProps {
  report: DailyReportData | null; // The report data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onReportUpdated: () => void; // Callback to notify parent after update
  employees: Employee[]; // List of employees for the dropdown
}

const EditDailyReportDialog = ({ report, isOpen, onClose, onReportUpdated, employees }: EditDailyReportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: undefined, // Default for date
      employee_id: "", // Default for select
      activity: "",
      notes: "", // Default for optional string
    },
  });

  // Effect to populate the form when the 'report' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (report) {
      form.reset({
        // Convert date string to Date object for the date picker
        report_date: report.report_date ? parseISO(report.report_date) : undefined,
        employee_id: report.employee_id || "", // Use "" for null/undefined in select
        activity: report.activity,
        notes: report.notes || "", // Handle null/undefined
      });
    } else {
      // Reset form when dialog is closed or report is null
      form.reset({
        report_date: undefined,
        employee_id: "",
        activity: "",
        notes: "",
      });
    }
  }, [report, form]); // Depend on 'report' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!report) return; // Should not happen if dialog is open, but safety check

    setIsSubmitting(true); // Start loading

    console.log("Submitting edit daily report form:", values, "Report ID:", report.id);

    // Prepare update data, converting empty strings/undefined to null for optional fields
    const updateData = {
      report_date: format(values.report_date, "yyyy-MM-dd"), // Date is required by schema
      employee_id: values.employee_id || null, // Convert "" to null
      activity: values.activity, // Activity is required by schema
      notes: values.notes || null, // Convert "" to null
    };

    const { data, error } = await supabase
      .from("daily_reports")
      .update(updateData)
      .eq("id", report.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    setIsSubmitting(false); // End loading

    if (error) {
      console.error("Error updating daily report:", error);
      showError("Gagal memperbarui laporan harian: " + error.message);
    } else if (data) {
      console.log("Daily report data updated successfully:", data);
      showSuccess("Laporan harian berhasil diperbarui!");
      onReportUpdated(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${report.id}, but no data returned.`);
       showSuccess("Laporan harian berhasil diperbarui!"); // Still show success even if no data returned
       onReportUpdated(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Laporan Harian</DialogTitle>
          <DialogDescription>
            Ubah detail laporan harian di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
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
                        selected={field.value || undefined} // Handle null/undefined
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
                  <Select onValueChange={field.onChange} value={field.value}> {/* Use value */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih nama karyawan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.length === 0 ? (
                         <SelectItem disabled value="">Memuat karyawan...</SelectItem>
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
                    <Textarea placeholder="Catatan tambahan..." {...field} value={field.value || ""} /> {/* Handle null/undefined */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDailyReportDialog;