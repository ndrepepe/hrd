"use client";

import { useState } from "react";
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
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  report_date: z.date({
    required_error: "Tanggal laporan wajib diisi.",
  }),
  reporter_name: z.string().min(2, {
    message: "Nama pelapor harus minimal 2 karakter.",
  }),
  activity: z.string().min(10, {
    message: "Deskripsi aktivitas harus minimal 10 karakter.",
  }),
  // Removed hours_worked field
  notes: z.string().optional(),
});

interface DailyReportFormProps {
  onReportSubmitted: () => void; // Callback to refresh list after submission
}

const DailyReportForm = ({ onReportSubmitted }: DailyReportFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: undefined,
      reporter_name: "",
      activity: "",
      // Removed hours_worked default value
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting daily report:", values);

    const { data, error } = await supabase
      .from("daily_reports")
      .insert([
        {
          report_date: format(values.report_date, "yyyy-MM-dd"),
          reporter_name: values.reporter_name,
          activity: values.activity,
          // Removed hours_worked from insert data
          notes: values.notes,
        },
      ])
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting daily report:", error);
      showError("Gagal menyimpan laporan harian: " + error.message);
    } else {
      console.log("Daily report inserted successfully:", data);
      showSuccess("Laporan harian berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      onReportSubmitted(); // Call callback to refresh list
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Input Laporan Harian</h3>
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
            name="reporter_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pelapor</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Anda" {...field} />
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
                <FormLabel>Aktivitas Harian</FormLabel>
                <FormControl>
                  <Textarea placeholder="Jelaskan aktivitas yang dilakukan hari ini..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           {/* Removed FormField for hours_worked */}
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