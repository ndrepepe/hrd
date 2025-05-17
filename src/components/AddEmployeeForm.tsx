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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

// Updated formSchema to only include required fields
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
  // Removed other fields from schema
});

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void; // Callback to notify parent
}

const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Updated defaultValues to only include required fields
    defaultValues: {
      employee_id: "",
      name: "",
      position: "",
      // Removed other default values
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
          // Only include the required fields in the insert data
          // Other columns in the database will use their default values or be null
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
      });
      onEmployeeAdded(); // Call callback
    }
  }

  // Removed year range calculation as date fields are removed

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
          {/* Removed other FormField components */}

          <Button type="submit">Simpan Karyawan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;