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
  FormDescription, // Added FormDescription import
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
  employee_id: z.string().min(1, {
    message: "ID Karyawan wajib diisi.",
  }),
  name: z.string().min(2, {
    message: "Nama lengkap wajib diisi minimal 2 karakter.",
  }),
  position: z.string().min(2, {
    message: "Posisi wajib diisi minimal 2 karakter.",
  }),
  hire_date: z.date().optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Terminated'], {
    required_error: "Status wajib dipilih.",
    invalid_type_error: "Status tidak valid.",
  }),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Format email tidak valid." }).optional().nullable(),
  place_of_birth: z.string().optional().nullable(), // Added back optional fields
  date_of_birth: z.date().optional().nullable(), // Added back optional fields
  last_education: z.string().optional().nullable(), // Added back optional fields
  major: z.string().optional().nullable(), // Added back optional fields
  skills: z.string().optional().nullable(), // Added back optional fields
  notes: z.string().optional().nullable(), // Added back optional fields
  user_id: z.string().uuid({ message: "Format User ID tidak valid (harus UUID)." }).optional().nullable(), // Add user_id field, optional and nullable UUID
});

// Define the type for the data passed to the dialog
interface EmployeeData {
  id: string;
  created_at: string;
  employee_id: string;
  name: string;
  position: string;
  hire_date: string | null;
  status: string;
  phone: string | null;
  email: string | null;
  place_of_birth: string | null;
  date_of_birth: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
  notes: string | null;
  user_id: string | null; // Add user_id
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
      hire_date: undefined,
      status: undefined, // Default for enum
      phone: "",
      email: "",
      place_of_birth: "",
      date_of_birth: undefined,
      last_education: "",
      major: "",
      skills: "",
      notes: "",
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
        // Convert date string to Date object for the date picker
        hire_date: employee.hire_date ? parseISO(employee.hire_date) : undefined,
        status: employee.status as z.infer<typeof formSchema>['status'], // Cast to correct enum type
        phone: employee.phone || "", // Handle null/undefined
        email: employee.email || "", // Handle null/undefined
        place_of_birth: employee.place_of_birth || "",
        date_of_birth: employee.date_of_birth ? parseISO(employee.date_of_birth) : undefined,
        last_education: employee.last_education || "",
        major: employee.major || "",
        skills: employee.skills || "",
        notes: employee.notes || "",
        user_id: employee.user_id || "", // Handle null/undefined
      });
    } else {
      // Reset form when dialog is closed or employee is null
      form.reset({
        employee_id: "",
        name: "",
        position: "",
        hire_date: undefined,
        status: undefined,
        phone: "",
        email: "",
        place_of_birth: "",
        date_of_birth: undefined,
        last_education: "",
        major: "",
        skills: "",
        notes: "",
        user_id: "",
      });
    }
  }, [employee, form]); // Depend on 'employee' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!employee) return; // Should not happen if dialog is open, but safety check

    setIsSubmitting(true); // Start loading

    console.log("Submitting edit employee form:", values, "Employee ID:", employee.id);

    // Prepare update data, converting empty strings/undefined to null for optional fields
    const updateData = {
      employee_id: values.employee_id,
      name: values.name,
      position: values.position,
      hire_date: values.hire_date ? format(values.hire_date, "yyyy-MM-dd") : null,
      status: values.status,
      phone: values.phone || null,
      email: values.email || null,
      place_of_birth: values.place_of_birth || null,
      date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
      last_education: values.last_education || null,
      major: values.major || null,
      skills: values.skills || null,
      notes: values.notes || null,
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

  // Calculate year range for date picker
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100; // Allow selecting years up to 100 years ago
  const toYear = currentYear; // Allow selecting up to the current year


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg"> {/* Adjusted max-width */}
        <DialogHeader>
          <DialogTitle>Edit Data Karyawan</DialogTitle>
          <DialogDescription>
            Ubah detail karyawan di sini. Anda juga bisa menghubungkan akun pengguna Supabase.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
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
            {/* Hire Date Field */}
            <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                <FormItem className="flex flex-col md:col-span-1">
                    <FormLabel>Tanggal Masuk (Opsional)</FormLabel>
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
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={currentYear - 50} // Adjust year range as needed
                        toYear={currentYear + 5}
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
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
             {/* Place of Birth Field */}
             <FormField
                control={form.control}
                name="place_of_birth"
                render={({ field }) => (
                <FormItem className="md:col-span-1">
                    <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                    <FormControl>
                    <Input placeholder="Kota" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {/* Date of Birth Field */}
            <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                <FormItem className="flex flex-col md:col-span-1">
                    <FormLabel>Tanggal Lahir (Opsional)</FormLabel>
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
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={fromYear}
                        toYear={toYear}
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
             {/* Last Education Field */}
            <FormField
                control={form.control}
                name="last_education"
                render={({ field }) => (
                <FormItem className="md:col-span-1">
                    <FormLabel>Pendidikan Terakhir (Opsional)</FormLabel>
                    <FormControl>
                    <Input placeholder="Contoh: S1 Teknik Informatika" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {/* Major Field */}
            <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                <FormItem className="md:col-span-1">
                    <FormLabel>Jurusan (Opsional)</FormLabel>
                    <FormControl>
                    <Input placeholder="Contoh: Teknik Informatika" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {/* Skills Field */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Span across two columns */}
                  <FormLabel>Kemampuan Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contoh: React, Node.js, SQL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Span across two columns */}
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan tambahan..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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