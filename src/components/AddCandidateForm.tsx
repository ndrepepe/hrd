"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears } from "date-fns"; // Import differenceInYears
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
}
from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  position_id: z.string({
    required_error: "Posisi wajib dipilih.",
  }),
  name: z.string().min(2, {
    message: "Nama kandidat harus minimal 2 karakter.",
  }),
  place_of_birth: z.string().min(1, { // Made required
    message: "Tempat lahir wajib diisi.",
  }),
  date_of_birth: z.date({ // Made required
    required_error: "Tanggal lahir wajib diisi.",
  }),
  phone: z.string().min(1, { // Made required
    message: "Nomor HP wajib diisi.",
  }),
  address_ktp: z.string().min(1, { // Made required
    message: "Alamat KTP wajib diisi.",
  }),
  last_education: z.string().min(1, { // Made required
    message: "Pendidikan terakhir wajib diisi.",
  }),
  major: z.string().min(1, { // Made required
    message: "Jurusan wajib diisi.",
  }),
  skills: z.string().optional(), // Kept optional
});

interface Position {
  id: string;
  title: string;
  status: string; // Add status to Position interface
}

interface AddCandidateFormProps {
  onCandidateAdded: () => void; // Callback to notify parent
  refreshPositionsTrigger: number; // Prop to trigger refresh of positions list in select
}

const AddCandidateForm = ({ onCandidateAdded, refreshPositionsTrigger }: AddCandidateFormProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position_id: "",
      name: "",
      place_of_birth: "",
      date_of_birth: undefined,
      phone: "",
      address_ktp: "",
      last_education: "",
      major: "",
      skills: "",
    },
  });

  // Watch the date_of_birth field to react to changes
  const dateOfBirth = form.watch('date_of_birth');

  // Function to calculate age
  const calculateAge = (dob: Date | undefined): number | null => {
    if (!dob || isNaN(dob.getTime())) { // Check if dob is a valid Date object
      return null;
    }
    const today = new Date();
    return differenceInYears(today, dob);
  };

  const calculatedAge = calculateAge(dateOfBirth);


  useEffect(() => {
    fetchPositions();
  }, [refreshPositionsTrigger]); // Depend on refreshPositionsTrigger

  const fetchPositions = async () => {
    setLoadingPositions(true);
    const { data, error } = await supabase
      .from("positions")
      .select("id, title, status") // Select status
      .eq("status", "Open") // Filter by status 'Open'
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching positions:", error);
      showError("Gagal memuat daftar posisi: " + error.message);
    } else {
      setPositions(data || []);
    }
    setLoadingPositions(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new candidate:", values);

    const { data, error } = await supabase
      .from("candidates")
      .insert([
        {
          position_id: values.position_id,
          name: values.name,
          place_of_birth: values.place_of_birth,
          date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
          phone: values.phone,
          address_ktp: values.address_ktp,
          last_education: values.last_education,
          major: values.major,
          skills: values.skills,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting candidate:", error);
      showError("Gagal menyimpan data kandidat: " + error.message);
    } else {
      console.log("Candidate inserted successfully:", data);
      showSuccess("Data kandidat berhasil disimpan!");
      form.reset();
      onCandidateAdded(); // Call callback
    }
  }

  // Calculate year range for date picker
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100; // Allow selecting years up to 100 years ago
  const toYear = currentYear; // Allow selecting up to the current year


  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Kandidat Baru</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="position_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Melamar Posisi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingPositions ? (
                      <SelectItem disabled>Memuat posisi...</SelectItem>
                    ) : positions.length === 0 ? (
                       <SelectItem disabled>Belum ada posisi yang terbuka</SelectItem> // Updated message
                    ) : (
                      positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                  <Input placeholder="Nama kandidat" {...field} />
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
                      <FormLabel>Tempat Lahir</FormLabel>
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
                      <FormLabel>
                          Tanggal Lahir
                          {/* Display calculated age */}
                          {calculatedAge !== null && (
                              <span className="ml-2 text-sm text-gray-600">({calculatedAge} tahun)</span>
                          )}
                      </FormLabel>
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor HP</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address_ktp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat KTP</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alamat sesuai KTP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="last_education"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Pendidikan Terakhir</FormLabel>
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
                      <FormLabel>Jurusan</FormLabel>
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
          <Button type="submit">Simpan Kandidat</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddCandidateForm;