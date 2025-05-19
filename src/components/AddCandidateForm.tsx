"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

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
  }).nullable(),
  name: z.string().min(2, {
    message: "Nama kandidat harus minimal 2 karakter.",
  }),
  place_of_birth: z.string().min(1, {
    message: "Tempat lahir wajib diisi.",
  }).nullable(),
  date_of_birth: z.date({
    required_error: "Tanggal lahir wajib diisi.",
  }).nullable(),
  phone: z.string().min(1, {
    message: "Nomor HP wajib diisi.",
  }).nullable(),
  address_ktp: z.string().min(1, {
    message: "Alamat KTP wajib diisi.",
  }).nullable(),
  last_education: z.string().min(1, {
    message: "Pendidikan terakhir wajib diisi.",
  }).nullable(),
  major: z.string().min(1, {
    message: "Jurusan wajib diisi.",
  }).nullable(),
  skills: z.string().optional().nullable(),
});

interface Position {
  id: string;
  title: string;
  status: string;
}

interface AddCandidateFormProps {
  onCandidateAdded: () => void;
  refreshPositionsTrigger: number;
  editingCandidateId: string | null;
  setEditingCandidateId: (id: string | null) => void;
}

const AddCandidateForm = ({ onCandidateAdded, refreshPositionsTrigger, editingCandidateId, setEditingCandidateId }: AddCandidateFormProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingCandidateData, setLoadingCandidateData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


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

  const dateOfBirth = form.watch('date_of_birth');

  const calculateAge = (dob: Date | undefined | null): number | null => {
    if (!dob || isNaN(dob.getTime())) {
      return null;
    }
    const today = new Date();
    return differenceInYears(today, dob);
  };

  const calculatedAge = calculateAge(dateOfBirth);

  useEffect(() => {
    fetchPositions();
  }, [refreshPositionsTrigger]);

  const fetchPositions = async () => {
    setLoadingPositions(true);
    const { data, error } = await supabase
      .from("positions")
      .select("id, title, status")
      .eq("status", "Open")
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching positions:", error);
      showError("Gagal memuat daftar posisi: " + error.message);
    } else {
      setPositions(data || []);
    }
    setLoadingPositions(false);
  };

  useEffect(() => {
    if (editingCandidateId) {
      const fetchCandidate = async () => {
        setLoadingCandidateData(true);
        console.log("Fetching candidate data for edit:", editingCandidateId);
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", editingCandidateId)
          .single();

        setLoadingCandidateData(false);

        if (error) {
          console.error("Error fetching candidate for edit:", error);
          showError("Gagal memuat data kandidat untuk diedit: " + error.message);
          setEditingCandidateId(null);
        } else if (data) {
          console.log("Candidate data fetched:", data);
          form.reset({
            ...data,
            date_of_birth: data.date_of_birth ? parseISO(data.date_of_birth) : undefined,
            position_id: data.position_id || "",
            place_of_birth: data.place_of_birth || "",
            phone: data.phone || "",
            address_ktp: data.address_ktp || "",
            last_education: data.last_education || "",
            major: data.major || "",
            skills: data.skills || "",
          });
        } else {
           console.warn("Candidate data not found for ID:", editingCandidateId);
           showError("Data kandidat tidak ditemukan.");
           setEditingCandidateId(null);
        }
      };
      fetchCandidate();
    } else {
      console.log("Resetting candidate form to default values.");
      form.reset({
        position_id: "",
        name: "",
        place_of_birth: "",
        date_of_birth: undefined,
        phone: "",
        address_ktp: "",
        last_education: "",
        major: "",
        skills: "",
      });
    }
  }, [editingCandidateId, form, setEditingCandidateId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    console.log("Submitting candidate form:", values, "Editing ID:", editingCandidateId);

    const candidateData = {
      position_id: values.position_id || null,
      name: values.name,
      place_of_birth: values.place_of_birth || null,
      date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
      phone: values.phone || null,
      address_ktp: values.address_ktp || null,
      last_education: values.last_education || null,
      major: values.major || null,
      skills: values.skills || null,
    };

    let result;
    if (editingCandidateId) {
      result = await supabase
        .from("candidates")
        .update(candidateData)
        .eq("id", editingCandidateId)
        .select();
    } else {
      result = await supabase
        .from("candidates")
        .insert([candidateData])
        .select();
    }

    const { data, error } = result;

    setIsSubmitting(false);

    if (error) {
      console.error(`Error ${editingCandidateId ? 'updating' : 'inserting'} candidate data:`, error);
      showError(`Gagal ${editingCandidateId ? 'memperbarui' : 'menyimpan'} data kandidat: ` + error.message);
    } else {
      console.log(`Candidate data ${editingCandidateId ? 'updated' : 'inserted'} successfully:`, data);
      showSuccess(`Data kandidat berhasil di${editingCandidateId ? 'perbarui' : 'simpan'}!`);
      form.reset();
      setEditingCandidateId(null);
      onCandidateAdded();
    }
  }

  const handleCancelEdit = () => {
    setEditingCandidateId(null);
    form.reset({
      position_id: "",
      name: "",
      place_of_birth: "",
      date_of_birth: undefined,
      phone: "",
      address_ktp: "",
      last_education: "",
      major: "",
      skills: "",
    });
  };


  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100;
  const toYear = currentYear;


  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">
        {editingCandidateId ? "Edit Data Kandidat" : "Tambah Kandidat Baru"}
      </h3>
      {loadingCandidateData ? (
         <p>Memuat data kandidat...</p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Melamar Posisi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih posisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingPositions ? (
                        // Removed value="" from disabled SelectItem
                        <SelectItem disabled>Memuat posisi...</SelectItem>
                      ) : positions.length === 0 ? (
                         // Removed value="" from disabled SelectItem
                         <SelectItem disabled>Belum ada posisi yang terbuka</SelectItem>
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
                        <Input placeholder="Kota" {...field} value={field.value || ""} />
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
                            Tanggal Lahir (Opsional)
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
             </div>
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
            <FormField
              control={form.control}
              name="address_ktp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat KTP (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat sesuai KTP" {...field} value={field.value || ""} />
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
                        <Input placeholder="Contoh: S1 Teknik Informatika" {...field} value={field.value || ""} />
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
                        <Input placeholder="Contoh: Teknik Informatika" {...field} value={field.value || ""} />
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
                    <Textarea placeholder="Contoh: React, Node.js, SQL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {editingCandidateId ? "Simpan Perubahan" : "Simpan Kandidat"}
              </Button>
              {editingCandidateId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default AddCandidateForm;