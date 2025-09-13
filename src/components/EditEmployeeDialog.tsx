"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns"; // Keep format, parseISO might not be needed if date fields are removed
import { CalendarIcon, Loader2 } from "lucide-react"; // Keep Loader2, CalendarIcon might not be needed

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Keep Popover components for potential future use or if other date fields exist
import { Textarea } from "@/components/ui/textarea"; // Keep Textarea for notes if it's kept
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar"; // Keep Calendar for potential future use

// Define the schema for the form fields - REMOVING UNWANTED FIELDS
const formSchema = z.object({
  employee_id: z.string().min(1, {
    message: "ID Karyawan wajib diisi.",
  }),
  name: z.string().min(2, {
    message: "Nama lengkap wajib diisi minimal 2 karakter.",
  }),
  position: z.string().min(2, {
    message: "Posisi wajib diisi minimal 2 karakter.",
  }),
  // Removed hire_date
  status: z.enum(['Active', 'Inactive', 'Terminated'], {
    required_error: "Status wajib dipilih.",
    invalid_type_error: "Status tidak valid.",
  }),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Format email tidak valid." }).optional().nullable(),
  // Removed place_of_birth
  // Removed date_of_birth
  // Removed last_education
  // Removed major
  // Removed skills
  // Removed notes
  user_id: z.string().uuid({ message: "Format User ID tidak valid (harus UUID)." }).optional().nullable(), // Keep user_id field
});

// Define the type for the data passed to the dialog - REMOVING UNWANTED FIELDS
interface EmployeeData {
  id: string;
  created_at: string;
  employee_id: string;
  name: string;
  position: string;
  status: string;
  phone: string | null;
  email: string | null;
  user_id: string | null;
}

interface EditEmployeeDialogProps {
  employee: EmployeeData | null; // The employee data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onEmployeeUpdated: () => void; // Callback to notify parent after update
}

const EditEmployeeDialog = ({ employee, isOpen, onClose, onEmployeeUpdated }: EditEmployeeDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      name: "",
      position: "",
      // Removed hire_date
      status: undefined, // Default for enum
      phone: "",
      email: "",
      // Removed place_of_birth
      // Removed date_of_birth
      // Removed last_education
      // Removed major
      // Removed skills
      // Removed notes
      user_id: "", // Default for optional string
    },
  });

  // Effect to populate the form when the 'employee' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (employee) {
      form.reset({
        employee_id: employee.employee_id,
        name: employee.name,
        position: employee.position,
        // Removed hire_date
        status: employee.status as z.infer<typeof formSchema>['status'], // Cast to correct enum type
        phone: employee.phone || "", // Handle null/undefined
        email: employee.email || "", // Handle null/undefined
        // Removed place_of_birth
        // Removed date_of_birth
        // Removed last_education
        // Removed major
        // Removed skills
        // Removed notes
        user_id: employee.user_id || "", // Handle null/undefined
      });
    } else {
      // Reset form when dialog is closed or employee is null
      form.reset({
        employee_id: "",
        name: "",
        position: "",
        // Removed hire_date
        status: undefined,
        phone: "",
        email: "",
        // Removed place_of_birth
        // Removed date_of_birth
        // Removed last_education
        // Removed major
        // Removed skills
        // Removed notes
        user_id: "",
      });
    }
  }, [employee, form]); // Depend on 'employee' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!employee) return; // Should not happen if dialog is open, but safety check

    setIsSubmitting(true); // Start loading

    console.log("Submitting edit employee form:", values, "Employee ID:", employee.id);

    // Prepare update data - REMOVING UNWANTED FIELDS
    const updateData = {
      employee_id: values.employee_id,
      name: values.name,
      position: values.position,
      // Removed hire_date
      status: values.status,
      phone: values.phone || null,
      email: values.email || null,
      // Removed place_of_birth
      // Removed date_of_birth
      // Removed last_education
      // Removed major
      // Removed skills
      // Removed notes
      user_id: values.user_id || null, // Convert "" to null for user_id
    };

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", employee.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    setIsSubmitting(false); // End loading

    if (error) {
      console.error("Error updating employee:", error);
      showError("Gagal memperbarui data karyawan: " + error.message);
    } else if (data) {
      console.log("Employee data updated successfully:", data);
      showSuccess("Data karyawan berhasil diperbarui!");
      onEmployeeUpdated(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${employee.id}, but no data returned.`);
       showSuccess("Data karyawan berhasil diperbarui!"); // Still show success even if no data returned
       onEmployeeUpdated(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  // Calculate year range for date picker - REMOVED as date fields are removed
  // const currentYear = new Date().getFullYear();
  // const fromYear = currentYear - 100;
  // const toYear = currentYear;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Adjusted max-w-lg to max-w-xl for wider dialog on medium screens and up */}
      <DialogContent className="sm:max-w-[425px] md:max-w-lg"> {/* Adjusted max-width back to lg as fewer fields */}
        <DialogHeader>
          <DialogTitle>Edit Data Karyawan</DialogTitle>
          <DialogDescription>
            Ubah detail karyawan di sini. Anda juga bisa menghubungkan akun pengguna Supabase.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Removed overflow-y-auto and max-h-[80vh] as fewer fields */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"> {/* Use grid for layout */}
            {/* Employee ID Field */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>ID Karyawan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: EMP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama karyawan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Position Field */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Posisi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Staff Admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Removed Hire Date Field */}
             {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Nomor HP (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 0812..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: nama@example.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Removed Place of Birth Field */}
            {/* Removed Date of Birth Field */}
             {/* Removed Last Education Field */}
            {/* Removed Major Field */}
            {/* Removed Skills Field */}
             {/* Removed Notes Field */}
            {/* User ID Field (for linking account) */}
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Span across two columns */}
                  <FormLabel>ID Akun Pengguna Supabase (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan User ID (UUID) dari Supabase Auth" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Hubungkan karyawan ini dengan akun pengguna Supabase Auth yang sudah ada. Kosongkan untuk memutuskan tautan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <DialogFooter className="md:col-span-2 flex justify-end space-x-2"> {/* Span and align right */}
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

export default EditEmployeeDialog;