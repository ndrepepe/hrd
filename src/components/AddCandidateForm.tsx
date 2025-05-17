"use client";

import { useState, useEffect } from "react";
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
  place_of_birth: z.string().optional(),
  date_of_birth: z.date().optional(),
  phone: z.string().optional(),
  address_ktp: z.string().optional(),
  last_education: z.string().optional(),
  major: z.string().optional(),
  skills: z.string().optional(),
});

interface Position {
  id: string;
  title: string;
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

  useEffect(() => {
    fetchPositions();
  }, [refreshPositionsTrigger]); // Depend on refreshPositionsTrigger

  const fetchPositions = async () => {
    setLoadingPositions(true);
    const { data, error } = await supabase
      .from("positions")
      .select("id, title")
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
                <Select onValueChange={field.onChange} value={field.value}> {/* Changed defaultValue to value */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingPositions ? (
                      <SelectItem disabled>Memuat posisi...</SelectItem>
                    ) : positions.length === 0 ? (
                       <SelectItem disabled>Belum ada posisi</SelectItem>
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
           </div>
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
            name="address_ktp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat KTP (Opsional)</FormLabel>
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
          <Button type="submit">Simpan Kandidat</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddCandidateForm;