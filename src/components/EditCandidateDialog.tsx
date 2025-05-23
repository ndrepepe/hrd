"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, differenceInYears } from "date-fns"; // Import parseISO and differenceInYears
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2

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

// Define the schema for the form fields (matching AddCandidateForm but optional for edit)
const formSchema = z.object({
  position_id: z.string().optional().nullable(), // Make optional and nullable for edit
  name: z.string().min(2, {
    message: "Nama kandidat harus minimal 2 karakter.",
  }),
  place_of_birth: z.string().optional().nullable(),
  date_of_birth: z.date().optional().nullable(),
  phone: z.string().optional().nullable(),
  address_ktp: z.string().optional().nullable(),
  last_education: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
});

// Define the type for the data passed to the dialog
interface CandidateData {
  id: string;
  position_id: string | null;
  name: string;
  place_of_birth: string | null;
  date_of_birth: string | null; // Date is string from DB
  phone: string | null;
  address_ktp: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
}

interface Position {
  id: string;
  title: string;
  status: string; // Include status to filter 'Open' positions
}

interface EditCandidateDialogProps {
  candidate: CandidateData | null; // The candidate data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onCandidateUpdated: () => void; // Callback to notify parent after update
}

const EditCandidateDialog = ({ candidate, isOpen, onClose, onCandidateUpdated }: EditCandidateDialogProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position_id: "", // Default for select
      name: "",
      place_of_birth: "",
      date_of_birth: undefined, // Default for date
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
  const calculateAge = (dob: Date | undefined | null): number | null => {
    if (!dob || isNaN(dob.getTime())) {
      return null;
    }
    const today = new Date();
    return differenceInYears(today, dob);
  };

  const calculatedAge = calculateAge(dateOfBirth);

  // Fetch positions for the dropdown
  useEffect(() => {
    const fetchPositions = async () => {
      setLoadingPositions(true);
      const { data, error } = await supabase
        .from("positions")
        .select("id, title, status")
        .eq("status", "Open") // Only show 'Open' positions
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching positions for edit dialog:", error);
        showError("Gagal memuat daftar posisi: " + error.message);
      } else {
        setPositions(data || []);
      }
      setLoadingPositions(false);
    };
    fetchPositions();
  }, []); // Fetch positions only once when the component mounts

  // Effect to populate the form when the 'candidate' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (candidate) {
      form.reset({
        position_id: candidate.position_id || "", // Use "" for null/undefined in select
        name: candidate.name,
        place_of_birth: candidate.place_of_birth || "",
        // Convert date string to Date object for the date picker
        date_of_birth: candidate.date_of_birth ? parseISO(candidate.date_of_birth) : undefined,
        phone: candidate.phone || "",
        address_ktp: candidate.address_ktp || "",
        last_education: candidate.last_education || "",
        major: candidate.major || "",
        skills: candidate.skills || "",
      });
    } else {
      // Reset form when dialog is closed or candidate is null
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
  }, [candidate, form]); // Depend on 'candidate' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!candidate) return; // Should not happen if dialog is open, but safety check

    setIsSubmitting(true); // Start loading

    console.log("Submitting edit candidate form:", values, "Candidate ID:", candidate.id);

    // Prepare update data, converting empty strings/undefined to null for optional fields
    const updateData = {
      position_id: values.position_id || null, // Convert "" to null
      name: values.name,
      place_of_birth: values.place_of_birth || null,
      date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
      phone: values.phone || null,
      address_ktp: values.address_ktp || null,
      last_education: values.last_education || null,
      major: values.major || null,
      skills: values.skills || null,
    };

    const { data, error } = await supabase
      .from("candidates")
      .update(updateData)
      .eq("id", candidate.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    setIsSubmitting(false); // End loading

    if (error) {
      console.error("Error updating candidate:", error);
      showError("Gagal memperbarui data kandidat: " + error.message);
    } else if (data) {
      console.log("Candidate data updated successfully:", data);
      showSuccess("Data kandidat berhasil diperbarui!");
      onCandidateUpdated(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${candidate.id}, but no data returned.`);
       showSuccess("Data kandidat berhasil diperbarui!"); // Still show success even if no data returned
       onCandidateUpdated(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  // Calculate year range for date picker
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100; // Allow selecting years up to 100 years ago
  const toYear = currentYear; // Allow selecting up to the current year


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Kandidat</DialogTitle>
          <DialogDescription>
            Ubah detail kandidat di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Posisi Dilamar Field */}
            <FormField
              control={form.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Melamar Posisi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}> {/* Use value and handle null/undefined with "" */}
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
            {/* Nama Lengkap Field */}
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
             {/* Tempat Lahir and Tanggal Lahir */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="place_of_birth"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                        <FormControl>
                        <Input placeholder="Kota" {...field} value={field.value || ""} /> {/* Handle null/undefined */}
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
                                {/* WRAP CONTENT IN SPAN */}
                                <span className="flex justify-between items-center w-full">
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </span>
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
            {/* Nomor HP Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 0812..." {...field} value={field.value || ""} /> {/* Handle null/undefined */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Alamat KTP Field */}
            <FormField
              control={form.control}
              name="address_ktp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat KTP (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat sesuai KTP" {...field} value={field.value || ""} /> {/* Handle null/undefined */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Pendidikan Terakhir and Jurusan */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="last_education"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pendidikan Terakhir (Opsional)</FormLabel>
                        <FormControl>
                        <Input placeholder="Contoh: S1 Teknik Informatika" {...field} value={field.value || ""} /> {/* Handle null/undefined */}
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
                        <Input placeholder="Contoh: Teknik Informatika" {...field} value={field.value || ""} /> {/* Handle null/undefined */}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>
            {/* Kemampuan Tambahan Field */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kemampuan Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contoh: React, Node.js, SQL" {...field} value={field.value || ""} /> {/* Handle null/undefined */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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

export default EditCandidateDialog;