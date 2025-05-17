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
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  candidate_id: z.string({
    required_error: "Kandidat wajib dipilih.",
  }),
  stage: z.string().min(2, {
    message: "Tahapan wawancara harus minimal 2 karakter.",
  }),
  interview_date: z.date({
    required_error: "Tanggal wawancara wajib diisi.",
  }),
  result: z.string({
    required_error: "Hasil wawancara wajib dipilih.",
  }),
  notes: z.string().optional(),
});

interface Candidate {
  id: string;
  name: string;
}

interface AddInterviewFormProps {
  onInterviewAdded: () => void; // Callback to notify parent
  refreshCandidatesTrigger: number; // Prop to trigger refresh of candidates list in select
}

const AddInterviewForm = ({ onInterviewAdded, refreshCandidatesTrigger }: AddInterviewFormProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidate_id: "",
      stage: "",
      interview_date: undefined,
      result: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchCandidates();
  }, [refreshCandidatesTrigger]); // Depend on refreshCandidatesTrigger

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching candidates:", error);
      showError("Gagal memuat daftar kandidat: " + error.message);
    } else {
      setCandidates(data || []);
    }
    setLoadingCandidates(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new interview:", values);

    const { data, error } = await supabase
      .from("interviews")
      .insert([
        {
          candidate_id: values.candidate_id,
          stage: values.stage,
          interview_date: format(values.interview_date, "yyyy-MM-dd"),
          result: values.result,
          notes: values.notes,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting interview:", error);
      showError("Gagal menyimpan data wawancara: " + error.message);
    } else {
      console.log("Interview inserted successfully:", data);
      showSuccess("Data wawancara berhasil disimpan!");
      form.reset();
      onInterviewAdded(); // Call callback
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Data Wawancara</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="candidate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kandidat</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kandidat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCandidates ? (
                      <SelectItem disabled>Memuat kandidat...</SelectItem> {/* Removed value="" */}
                    ) : candidates.length === 0 ? (
                       <SelectItem disabled>Belum ada kandidat</SelectItem> {/* Removed value="" */}
                    ) : (
                      candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name}
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
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahapan Wawancara</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Wawancara HRD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interview_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Wawancara</FormLabel>
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
            name="result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasil Wawancara</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hasil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Lolos">Lolos</SelectItem>
                    <SelectItem value="Tidak Lolos">Tidak Lolos</SelectItem>
                    <SelectItem value="Pertimbangkan">Pertimbangkan</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
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
          <Button type="submit">Simpan Wawancara</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddInterviewForm;