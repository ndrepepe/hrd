"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Removed unused imports: format, CalendarIcon, cn, Calendar, Popover, PopoverContent, PopoverTrigger, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue

import { Button } from "@/components/ui/button";
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
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select, // Added Select import
  SelectContent, // Added SelectContent import
  SelectItem, // Added SelectItem import
  SelectTrigger, // Added SelectTrigger import
  SelectValue, // Added SelectValue import
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Keep Textarea for optional fields if needed, but removing notes field

// Updated formSchema to include user_id
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
  status: z.enum(['Active', 'Inactive', 'Terminated'], {
    required_error: "Status wajib dipilih.",
    invalid_type_error: "Status tidak valid.",
  }),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Format email tidak valid." }).optional().nullable(),
  user_id: z.string().uuid({ message: "Format User ID tidak valid (harus UUID)." }).optional().nullable(), // Added user_id field
});

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void; // Callback to notify parent
}

const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Updated defaultValues to include user_id
    defaultValues: {
      employee_id: "",
      name: "",
      position: "",
      status: "Active", // Default status to Active
      phone: "",
      email: "",
      user_id: "", // Default for optional string
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new employee:", values);

    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          employee_id: values.employee_id,
          name: values.name,
          position: values.position,
          status: values.status,
          phone: values.phone || null,
          email: values.email || null,
          user_id: values.user_id || null, // Include user_id, convert "" to null
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting employee:", error);
      showError("Gagal menyimpan data karyawan: " + error.message);
    } else {
      console.log("Employee inserted successfully:", data);
      showSuccess("Data karyawan berhasil disimpan!");
      form.reset({ // Reset form to initial default values
         employee_id: "",
         name: "",
         position: "",
         status: "Active", // Reset status to default
         phone: "",
         email: "",
         user_id: "", // Reset user_id
      });
      onEmployeeAdded(); // Call callback
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Data Karyawan Baru</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee ID Field */}
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
                <FormItem>
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
            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: nama@example.com" {...field} value={field.value || ""} />
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
                <FormItem>
                  <FormLabel>ID Akun Pengguna Supabase (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan User ID (UUID) dari Supabase Auth" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Hubungkan karyawan ini dengan akun pengguna Supabase Auth yang sudah ada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button type="submit">Simpan Karyawan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;