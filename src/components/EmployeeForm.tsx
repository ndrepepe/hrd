"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  employee_id: z.string().min(2, {
    message: "ID Karyawan harus minimal 2 karakter.",
  }),
  name: z.string().min(2, {
    message: "Nama karyawan harus minimal 2 karakter.",
  }),
  position: z.string().min(2, {
    message: "Jabatan harus minimal 2 karakter.",
  }),
  hire_date: z.date({
    required_error: "Tanggal masuk wajib diisi.",
  }),
  status: z.enum(["Active", "Inactive", "On Leave"], {
    required_error: "Status wajib dipilih.",
  }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Format email tidak valid." }).optional().or(z.literal("")),
  address: z.string().optional(),
  date_of_birth: z.date().optional(),
  place_of_birth: z.string().optional(),
  last_education: z.string().optional(),
  major: z.string().optional(),
  skills: z.string().optional(),
  notes: z.string().optional(),
});

interface EmployeeFormProps {
  onEmployeeSubmitted: () => void;
  editingEmployeeId: string | null;
  setEditingEmployeeId: (id: string | null) => void;
  onCancelEdit: () => void;
}

const EmployeeForm = ({ onEmployeeSubmitted, editingEmployeeId, setEditingEmployeeId, onCancelEdit }: EmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (editingEmployeeId) {
      const fetchEmployee = async () => {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .eq("id", editingEmployeeId)
          .single();

        if (error) {
          console.error("Error fetching employee for edit:", error);
          showError("Gagal memuat data karyawan untuk diedit: " + error.message);
          setEditingEmployeeId(null);
        } else if (data) {
          form.reset({
            ...data,
            hire_date: data.hire_date ? parseISO(data.hire_date) : undefined,
            date_of_birth: data.date_of_birth ? parseISO(data.date_of_birth) : undefined,
            email: data.email || "", // Ensure email is not null for form
            phone: data.phone || "",
            address: data.address || "",
            place_of_birth: data.place_of_birth || "",
            last_education: data.last_education || "",
            major: data.major || "",
            skills: data.skills || "",
            notes: data.notes || "",
          });
        } else {
          showError("Data karyawan tidak ditemukan.");
          setEditingEmployeeId(null);
        }
      };
      fetchEmployee();
    } else {
      form.reset({
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
    }
  }, [editingEmployeeId, form, setEditingEmployeeId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedHireDate = values.hire_date ? format(values.hire_date, "yyyy-MM-dd") : null;
    const formattedDateOfBirth = values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null;

    const employeeData = {
      employee_id: values.employee_id,
      name: values.name,
      position: values.position,
      hire_date: formattedHireDate,
      status: values.status,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      date_of_birth: formattedDateOfBirth,
      place_of_birth: values.place_of_birth || null,
      last_education: values.last_education || null,
      major: values.major || null,
      skills: values.skills || null,
      notes: values.notes || null,
    };

    let result;
    if (editingEmployeeId) {
      result = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", editingEmployeeId)
        .select();
    } else {
      result = await supabase
        .from("employees")
        .insert([employeeData])
        .select();
    }

    const { error } = result;

    if (error) {
      console.error(`Error ${editingEmployeeId ? 'updating' : 'inserting'} employee data:`, error);
      showError(`Gagal ${editingEmployeeId ? 'memperbarui' : 'menyimpan'} data karyawan: ` + error.message);
    } else {
      showSuccess(`Data karyawan berhasil di${editingEmployeeId ? 'perbarui' : 'simpan'}!`);
      form.reset();
      setEditingEmployeeId(null);
      onEmployeeSubmitted();
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">{editingEmployeeId ? "Edit Data Karyawan" : "Input Data Karyawan"}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Karyawan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: HRD001" {...field} />
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
                <FormLabel>Nama Karyawan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Budi Santoso" {...field} />
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
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Staff HRD" {...field} />
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
                    <SelectItem value="Active">Aktif</SelectItem>
                    <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="On Leave">Cuti</SelectItem>
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
                <FormLabel>Telepon (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 081234567890" {...field} />
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
                  <Input type="email" placeholder="Contoh: budi@example.com" {...field} />
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
                  <Textarea placeholder="Alamat lengkap..." {...field} />
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
            name="place_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <Input placeholder="Contoh: Ilmu Komputer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterampilan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Contoh: Microsoft Office, Komunikasi" {...field} />
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
                  <Textarea placeholder="Catatan tambahan tentang karyawan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit">{editingEmployeeId ? "Simpan Perubahan" : "Simpan Karyawan"}</Button>
            {editingEmployeeId && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Batal Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeForm;