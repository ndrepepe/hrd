"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
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
  stage: z.string().min(2, {
    message: "Tahapan wawancara harus minimal 2 karakter.",
  }),
  interview_date: z.date({
    required_error: "Tanggal wawancara wajib diisi.",
  }),
  result: z.string({
    required_error: "Hasil wawancara wajib dipilih.",
  }),
  notes: z.string().optional().nullable(),
});

// Define the type for the data passed to the dialog
interface InterviewData {
  id: string;
  candidate_id: string; // Needed for context, though not edited
  stage: string;
  interview_date: string; // Date is string from DB
  result: string;
  notes: string | null;
  candidates?: { name: string } | null; // To display candidate name
}

interface EditInterviewDialogProps {
  interview: InterviewData | null; // The interview data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onUpdateSuccess: () => void; // Callback to notify parent after update
}

const EditInterviewDialog = ({ interview, isOpen, onClose, onUpdateSuccess }: EditInterviewDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stage: "",
      interview_date: undefined, // Default for date
      result: "",
      notes: "",
    },
  });

  // Effect to populate the form when the 'interview' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (interview) {
      form.reset({
        stage: interview.stage,
        // Convert date string to Date object for the date picker
        interview_date: interview.interview_date ? parseISO(interview.interview_date) : undefined,
        result: interview.result,
        notes: interview.notes || "", // Handle null/undefined
      });
    } else {
      // Reset form when dialog is closed or interview is null
      form.reset({
        stage: "",
        interview_date: undefined,
        result: "",
        notes: "",
      });
    }
  }, [interview, form]); // Depend on 'interview' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!interview) return; // Should not happen if dialog is open, but safety check

    setIsSubmitting(true); // Start loading

    console.log("Submitting edit interview form:", values, "Interview ID:", interview.id);

    // Prepare update data, converting empty strings/undefined to null for optional fields
    const updateData = {
      stage: values.stage,
      interview_date: format(values.interview_date, "yyyy-MM-dd"), // Date is required by schema
      result: values.result, // Result is required by schema
      notes: values.notes || null, // Convert "" to null
    };

    const { data, error } = await supabase
      .from("interviews")
      .update(updateData)
      .eq("id", interview.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    setIsSubmitting(false); // End loading

    if (error) {
      console.error("Error updating interview:", error);
      showError("Gagal memperbarui data wawancara: " + error.message);
    } else if (data) {
      console.log("Interview data updated successfully:", data);
      showSuccess("Data wawancara berhasil diperbarui!");
      onUpdateSuccess(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${interview.id}, but no data returned.`);
       showSuccess("Data wawancara berhasil diperbarui!"); // Still show success even if no data returned
       onUpdateSuccess(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Wawancara</DialogTitle>
          <DialogDescription>
            Ubah detail wawancara di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Candidate Name (Display only) */}
            {interview?.candidates?.name && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Kandidat:</span>
                    <span className="col-span-3">{interview.candidates.name}</span>
                </div>
            )}

            {/* Tahapan Wawancara Field */}
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahapan Wawancara</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Wawancara HRD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Wawancara Field */}
            <FormField
              control={form.control}
              name="interview_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Wawancara</FormLabel>
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

            {/* Hasil Wawancara Field (Select Dropdown) */}
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasil Wawancara</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}> {/* Use value */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hasil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Lolos">Lolos</SelectItem>
                      <SelectItem value="Tidak Lolos">Tidak Lolos</SelectItem>
                      <SelectItem value="Pertimbangkan">Pertimbangkan</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
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

export default EditInterviewDialog;