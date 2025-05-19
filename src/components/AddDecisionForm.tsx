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
  status: z.enum(['Accepted', 'Rejected'], {
    required_error: "Status keputusan wajib dipilih.",
    invalid_type_error: "Status keputusan tidak valid.",
  }),
  start_date: z.date().optional(),
  rejection_reason: z.string().optional(),
});

interface Candidate {
  id: string;
  name: string;
  position_id: string | null; // Add position_id to Candidate interface
  // Add decisions to check if the candidate already has a decision
  decisions?: { id: string }[] | null;
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
      status: undefined, // Default status is undefined for enum
      start_date: undefined,
      rejection_reason: "",
    },
  });

  useEffect(() => {
    fetchCandidates();
  }, [refreshCandidatesTrigger]); // Depend on refreshCandidatesTrigger

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    // Select candidates and left join decisions (only need the id to check existence)
    const { data, error } = await supabase
      .from("candidates")
      .select("id, name, position_id, decisions!left(id)") // Select position_id and left join decisions
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching candidates:", error);
      showError("Gagal memuat daftar kandidat: " + error.message);
      setCandidates([]); // Clear candidates on error
    } else {
      // Filter candidates who do NOT have any decisions
      const candidatesWithoutDecisions = data?.filter(candidate =>
        !candidate.decisions || candidate.decisions.length === 0
      );
      console.log("Fetched candidates for decision form (filtered):", candidatesWithoutDecisions);
      setCandidates(candidatesWithoutDecisions || []);
    }
    setLoadingCandidates(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit function called with values:", values);

    // Insert the decision first
    const { data: decisionData, error: decisionError } = await supabase
      .from("decisions")
      .insert([
        {
          candidate_id: values.candidate_id,
          status: values.status, // This will be 'Accepted' or 'Rejected'
          start_date: values.status === 'Accepted' && values.start_date ? format(values.start_date, "yyyy-MM-dd") : null, // Only save start_date if status is Accepted
          rejection_reason: values.status === 'Rejected' ? values.rejection_reason : null, // Only save rejection_reason if status is Rejected
        },
      ])
      .select();

    if (decisionError) {
      console.error("Error inserting decision:", decisionError);
      showError("Gagal menyimpan data keputusan: " + decisionError.message);
      return; // Stop if decision insertion fails
    }

    console.log("Decision inserted successfully:", decisionData);
    showSuccess("Data keputusan berhasil disimpan!");

    // If the status is 'Accepted', find the candidate's position and update it
    if (values.status === 'Accepted') {
        const selectedCandidate = candidates.find(c => c.id === values.candidate_id);
        if (selectedCandidate?.position_id) {
            console.log(`Candidate ${selectedCandidate.name} accepted, updating position ${selectedCandidate.position_id} status to 'Filled'`);
            const { error: positionUpdateError } = await supabase
                .from("positions")
                .update({ status: 'Filled' })
                .eq("id", selectedCandidate.position_id);

            if (positionUpdateError) {
                console.error("Error updating position status:", positionUpdateError);
                showError("Gagal memperbarui status posisi: " + positionUpdateError.message);
            } else {
                console.log("Position status updated successfully.");
                // Optionally show a success toast for position update
                // showSuccess("Status posisi berhasil diperbarui!");
            }
        } else {
            console.warn("Accepted candidate has no position_id or position not found in state.");
        }
    }


    form.reset();
    onDecisionAdded(); // Call callback to refresh lists (Decisions and potentially Positions/Candidates)
    // Re-fetch candidates for the dropdown after adding a decision
    // This is important because the candidate who just received a decision should no longer appear
    fetchCandidates();
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Data Keputusan</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Candidate Field */}
          <FormField
            control={form.control}
            name="candidate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kandidat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kandidat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCandidates ? (
                      <SelectItem disabled>Memuat kandidat...</SelectItem>
                    ) : candidates.length === 0 ? (
                       <SelectItem disabled>Tidak ada kandidat yang tersedia untuk keputusan</SelectItem>
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

          {/* Status Field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Keputusan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Accepted">Diterima</SelectItem>
                    <SelectItem value="Rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional Start Date Field */}
          {form.watch("status") === "Accepted" && (
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
          )}

          {/* Conditional Rejection Reason Field */}
          {form.watch("status") === "Rejected" && (
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
          )}

          <Button type="submit">Simpan Keputusan</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddDecisionForm;