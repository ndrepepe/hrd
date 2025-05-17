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
  status: z.string({
    required_error: "Status keputusan wajib dipilih.",
  }),
  start_date: z.date().optional(),
  rejection_reason: z.string().optional(),
});

interface Candidate {
  id: string;
  name: string;
}

interface AddDecisionFormProps {
  onDecisionAdded: () => void; // Callback to notify parent
  refreshCandidatesTrigger: number; // Prop to trigger refresh of candidates list in select
}

const AddDecisionForm = ({ onDecisionAdded, refreshCandidatesTrigger }: AddDecisionFormProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidate_id: "",
      status: "",
      start_date: undefined,
      rejection_reason: "",
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
    console.log("Submitting new decision:", values);

    const { data, error } = await supabase
      .from("decisions")
      .insert([
        {
          candidate_id: values.candidate_id,
          status: values.status,
          start_date: values.start_date ? format(values.start_date, "yyyy-MM-dd") : null,
          rejection_reason: values.rejection_reason,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting decision:", error);
      showError("Gagal menyimpan data keputusan: " + error.message);
    } else {
      console.log("Decision inserted successfully:", data);
      showSuccess("Data keputusan berhasil disimpan!");
      form.reset();
      onDecisionAdded(); // Call callback
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Data Keputusan</h3>
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
                      <SelectItem disabled>Memuat kandidat...</SelectItem>
                    ) : candidates.length === 0 ? (
                       <SelectItem disabled>Belum ada kandidat</SelectItem>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Keputusan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Diterima">Diterima</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                      <SelectItem value="Ditawarkan">Ditawarkan</SelectItem>
                      <SelectItem value="Arsip">Arsip</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("status") === "Diterima" || form.watch("status") === "Ditawarkan" ? (
                <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai (Opsional)</FormLabel>
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
            ) : null}

            {form.watch("status") === "Ditolak" ? (
                <FormField
                control={form.control}
                name="rejection_reason"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alasan Penolakan (Opsional)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Jelaskan alasan penolakan..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            ) : null}

          <Button type="submit">Simpan Keputusan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddDecisionForm;