"use client";

import { useEffect } from "react";
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
  end_date: z.date().optional().nullable(), // Optional and can be null
  briefing_result: z.enum(['dikontrak', 'dihentikan', 'mengundurkan diri']).optional().nullable(), // Changed to enum with specific values, optional and nullable
});

// Define the type for the data passed to the dialog
interface BriefingDecisionData {
  id: string;
  end_date: string | null;
  briefing_result: 'dikontrak' | 'dihentikan' | 'mengundurkan diri' | null; // Update type to match enum
}

interface EditBriefingDialogProps {
  decision: BriefingDecisionData | null; // The decision data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onUpdateSuccess: () => void; // Callback to notify parent after update
}

const EditBriefingDialog = ({ decision, isOpen, onClose, onUpdateSuccess }: EditBriefingDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      end_date: undefined,
      briefing_result: undefined, // Default for optional enum is undefined
    },
  });

  // Effect to populate the form when the 'decision' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (decision) {
      form.reset({
        // Convert date string to Date object for the date picker
        end_date: decision.end_date ? parseISO(decision.end_date) : undefined,
        // Set the value for the select dropdown, use undefined for null
        briefing_result: decision.briefing_result || undefined,
      });
    } else {
      // Reset form when dialog is closed or decision is null
      form.reset({
        end_date: undefined,
        briefing_result: undefined,
      });
    }
  }, [decision, form]); // Depend on 'decision' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!decision) return; // Should not happen if dialog is open, but safety check

    console.log("Submitting edit briefing form:", values, "Decision ID:", decision.id);

    // Prepare update data, converting undefined/empty string from select to null
    const updateData = {
      end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd") : null,
      briefing_result: values.briefing_result || null, // Save undefined/empty string as null
    };

    const { data, error } = await supabase
      .from("decisions")
      .update(updateData)
      .eq("id", decision.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    if (error) {
      console.error("Error updating briefing data:", error);
      showError("Gagal memperbarui data pembekalan: " + error.message);
    } else if (data) {
      console.log("Briefing data updated successfully:", data);
      showSuccess("Data pembekalan berhasil diperbarui!");
      onUpdateSuccess(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${decision.id}, but no data returned.`);
       showSuccess("Data pembekalan berhasil diperbarui!"); // Still show success even if no data returned
       onUpdateSuccess(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Pembekalan</DialogTitle>
          <DialogDescription>
            Ubah tanggal berakhir dan hasil pembekalan di sini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tanggal Berakhir Field */}
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Berakhir (Opsional)</FormLabel>
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
                        selected={field.value || undefined} // Pass undefined if null
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hasil Pembekalan Field (Select Dropdown) */}
            <FormField
              control={form.control}
              name="briefing_result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasil Pembekalan (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}> {/* Use value and handle null/undefined with undefined */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hasil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Use value={undefined} for clearing the value */}
                      <SelectItem value={undefined}>- Pilih Hasil -</SelectItem>
                      <SelectItem value="dikontrak">Dikontrak</SelectItem>
                      <SelectItem value="dihentikan">Dihentikan</SelectItem>
                      <SelectItem value="mengundurkan diri">Mengundurkan Diri</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBriefingDialog;