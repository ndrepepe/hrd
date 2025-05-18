"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears, parseISO } from "date-fns"; // Import parseISO
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2

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
  }).nullable(), // Make nullable for edit mode
  name: z.string().min(2, {
    message: "Nama kandidat harus minimal 2 karakter.",
  }),
  place_of_birth: z.string().min(1, {
    message: "Tempat lahir wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  date_of_birth: z.date({
    required_error: "Tanggal lahir wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  phone: z.string().min(1, {
    message: "Nomor HP wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  address_ktp: z.string().min(1, {
    message: "Alamat KTP wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  last_education: z.string().min(1, {
    message: "Pendidikan terakhir wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  major: z.string().min(1, {
    message: "Jurusan wajib diisi.",
  }).nullable(), // Make nullable for edit mode
  skills: z.string().optional().nullable(), // Kept optional and nullable
});

interface Position {
  id: string;
  title: string;
  status: string;
}

interface AddCandidateFormProps {
  onCandidateAdded: () => void;
  refreshPositionsTrigger: number;
  editingCandidateId: string | null; // ID of the candidate being edited
  setEditingCandidateId: (id: string | null) => void; // Function to clear editing state
}

const AddCandidateForm = ({ onCandidateAdded, refreshPositionsTrigger, editingCandidateId, setEditingCandidateId }: AddCandidateFormProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingCandidateData, setLoadingCandidateData] = useState(false); // State for loading candidate data for edit
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading


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

  // Effect to fetch positions for the select dropdown
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

  // Effect to load candidate data when editingCandidateId changes
  useEffect(() => {
    if (editingCandidateId) {
      const fetchCandidate = async () => {
        setLoadingCandidateData(true);
        console.log("Fetching candidate data for edit:", editingCandidateId);
        const { data, error } = await supabase
          .from("candidates")
          .select("*") // Fetch all fields needed for the form
          .eq("id", editingCandidateId)
          .single();

        setLoadingCandidateData(false);

        if (error) {
          console.error("Error fetching candidate for edit:", error);
          showError("Gagal memuat data kandidat untuk diedit: " + error.message);
          setEditingCandidateId(null); // Clear editing state on error
        } else if (data) {
          console.log("Candidate data fetched:", data);
          // Populate the form with fetched data
          form.reset({
            ...data,
            // Convert date string to Date object for the date picker
            date_of_birth: data.date_of_birth ? parseISO(data.date_of_birth) : undefined,
            // Ensure optional fields are handled correctly if null
            position_id: data.position_id || "", // Use "" for null in select
            place_of_birth: data.place_of_birth || "",
            phone: data.phone || "",
            address_ktp: data.address_ktp || "",
            last_education: data.last_education || "",
            major: data.major || "",
            skills: data.skills || "",
          });
        } else {
           // Handle case where ID is not found (shouldn't happen if ID comes from list)
           console.warn("Candidate data not found for ID:", editingCandidateId);
           showError("Data kandidat tidak ditemukan.");
           setEditingCandidateId(null); // Clear editing state
        }
      };
      fetchCandidate();
    } else {
      // Reset form when not editing (e.g., switching back to add mode or after submission)
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
  }, [editingCandidateId, form, setEditingCandidateId]); // Depend on editingCandidateId, form, and setEditingCandidateId

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true); // Start loading

    console.log("Submitting candidate form:", values, "Editing ID:", editingCandidateId);

    // Prepare data, converting empty strings/undefined to null for optional fields
    const candidateData = {
      position_id: values.position_id || null, // Convert "" from select to null
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
      // Update existing candidate
      result = await supabase
        .from("candidates")
        .update(candidateData)
        .eq("id", editingCandidateId)
        .select();
    } else {
      // Add new candidate
      result = await supabase
        .from("candidates")
        .insert([candidateData])
        .select();
    }

    const { data, error } = result;

    setIsSubmitting(false); // End loading

    if (error) {
      console.error(`Error ${editingCandidateId ? 'updating' : 'inserting'} candidate data:`, error);
      showError(`Gagal ${editingCandidateId ? 'memperbarui' : 'menyimpan'} data kandidat: ` + error.message);
    } else {
      console.log(`Candidate data ${editingCandidateId ? 'updated' : 'inserted'} successfully:`, data);
      showSuccess(`Data kandidat berhasil di${editingCandidateId ? 'perbarui' : 'simpan'}!`);
      form.reset(); // Reset form after successful submission
      setEditingCandidateId(null); // Clear editing state
      onCandidateAdded(); // Call the callback (now handles both add and update)
    }
  }

  // Function to handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingCandidateId(null); // Clear editing state
    form.reset({ // Reset form to initial default values
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


  // Calculate year range for date picker
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100;
  const toYear = currentYear;


  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">
        {editingCandidateId ? "Edit Data Kandidat" : "Tambah Kandidat Baru"} {/* Dynamic title */}
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
                        <SelectItem disabled value="">Memuat posisi...</SelectItem>
                      ) : positions.length === 0 ? (
                         <SelectItem disabled value="">Belum ada posisi yang terbuka</SelectItem>
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
                 {editingCandidateId ? "Simpan Perubahan" : "Simpan Kandidat"} {/* Dynamic button text */}
              </Button>
              {editingCandidateId && ( // Show cancel button only in edit mode
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