"use client";

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
  employee_id: z.string().min(1, {
    message: "ID Karyawan wajib diisi.",
  }),
  name: z.string().min(2, {
    message: "Nama lengkap wajib diisi minimal 2 karakter.",
  }),
  position: z.string().min(2, {
    message: "Posisi wajib diisi minimal 2 karakter.",
  }),
  hire_date: z.date({
    required_error: "Tanggal masuk wajib diisi.",
  }),
  status: z.enum(['Active', 'Inactive', 'On Leave'], {
    required_error: "Status wajib dipilih.",
    invalid_type_error: "Status tidak valid.",
  }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Format email tidak valid." }).optional().or(z.literal('')), // Allow empty string or valid email
  address: z.string().optional(),
  date_of_birth: z.date().optional().nullable(), // Optional and can be null
  place_of_birth: z.string().optional(),
  last_education: z.string().optional(),
  major: z.string().optional(),
  skills: z.string().optional(),
  notes: z.string().optional(),
});

interface AddEmployeeFormProps {
  onEmployeeAdded: () => void; // Callback to notify parent
}

const AddEmployeeForm = ({ onEmployeeAdded }: AddEmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      name: "",
      position: "",
      hire_date: undefined,
      status: "Active", // Default status
      phone: "",
      email: "",
      address: "",
      date_of_birth: undefined,
      place_of_birth: "",
      last_education: "",
      major: "",
      skills: "",
      notes: "",
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
          hire_date: format(values.hire_date, "yyyy-MM-dd"),
          status: values.status,
          phone: values.phone || null, // Save empty string as null
          email: values.email || null, // Save empty string as null
          address: values.address || null, // Save empty string as null
          date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
          place_of_birth: values.place_of_birth || null, // Save empty string as null
          last_education: values.last_education || null, // Save empty string as null
          major: values.major || null, // Save empty string as null
          skills: values.skills || null, // Save empty string as null
          notes: values.notes || null, // Save empty string as null
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting employee:", error);
      showError("Gagal menyimpan data karyawan: " + error.message);
    } else {
      console.log("Employee inserted successfully:", data);
      showSuccess("Data karyawan berhasil disimpan!");
      form.reset({ // Reset form, keep default status
         employee_id: "",
         name: "",
         position: "",
         hire_date: undefined,
         status: "Active",
         phone: "",
         email: "",
         address: "",
         date_of_birth: undefined,
         place_of_birth: "",
         last_education: "",
         major: "",
         skills: "",
         notes: "",
      });
      onEmployeeAdded(); // Call callback
    }
  }

  // Calculate year range for date picker
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100; // Allow selecting years up to 100 years ago
  const toYear = currentYear; // Allow selecting up to the current year


  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Data Karyawan Baru</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor HP (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opsional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Contoh: nama@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alamat lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="place_of_birth"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                      <FormControl>
                      <Input placeholder="Kota" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                          selected={field.value || undefined} // Handle null/undefined
                          onSelect={field.onChange}
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={fromYear} // Set the start year for the dropdown
                          toYear={toYear} // Set the end year for the dropdown
                          />
                      </PopoverContent>
                      </Popover>
                      <FormMessage />
                  </FormItem>
                  )}
              />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="last_education"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Pendidikan Terakhir (Opsional)</FormLabel>
                      <FormControl>
                      <Input placeholder="Contoh: S1 Teknik Informatika" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Jurusan (Opsional)</FormLabel>
                      <FormControl>
                      <Input placeholder="Contoh: Teknik Informatika" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
           </div>
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kemampuan Tambahan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Contoh: React, Node.js, SQL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button type="submit">Simpan Karyawan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;