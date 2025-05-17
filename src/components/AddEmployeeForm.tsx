"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns"; // Import format
import { CalendarIcon } from "lucide-react"; // Import CalendarIcon

import { cn } from "@/lib/utils"; // Import cn
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover components
// Removed unused imports: Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

// Updated formSchema to include required hire_date
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
  hire_date: z.date({ // Added hire_date back and made it required
    required_error: "Tanggal masuk wajib diisi.",
  }),
  // Removed other fields from schema
});

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void; // Callback to notify parent
}

const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Updated defaultValues to include hire_date
    defaultValues: {
      employee_id: "",
      name: "",
      position: "",
      hire_date: undefined, // Default value for date picker
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
          hire_date: format(values.hire_date, "yyyy-MM-dd"), // Include hire_date in insert data
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
         hire_date: undefined, // Reset date field
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
           {/* Hire Date Field (Added back) */}
          <FormField
            control={form.control}
            name="hire_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Masuk</FormLabel>
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
          {/* Removed other FormField components */}

          <Button type="submit">Simpan Karyawan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;