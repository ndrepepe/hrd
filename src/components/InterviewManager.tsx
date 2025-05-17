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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Interview {
  id: string;
  created_at: string;
  candidate_id: string;
  stage: string;
  interview_date: string;
  result: string;
  notes: string | null;
  candidates?: { name: string } | null; // To fetch candidate name
}

const InterviewManager = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

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
    fetchInterviews();
  }, []);

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

  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    const { data, error } = await supabase
      .from("interviews")
      .select("*, candidates(name)") // Select interview data and join with candidates to get name
      .order("interview_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching interviews:", error);
      showError("Gagal memuat data wawancara: " + error.message);
    } else {
      setInterviews(data || []);
    }
    setLoadingInterviews(false);
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
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting interview:", error);
      showError("Gagal menyimpan data wawancara: " + error.message);
    } else {
      console.log("Interview inserted successfully:", data);
      showSuccess("Data wawancara berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      fetchInterviews(); // Refresh the list
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="w-full max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Riwayat Wawancara</h3>
        {loadingInterviews ? (
          <p>Memuat riwayat wawancara...</p>
        ) : interviews.length === 0 ? (
          <p>Belum ada data wawancara.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kandidat</TableHead>
                  <TableHead>Tahapan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Dibuat Pada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>{interview.candidates?.name || "-"}</TableCell>
                    <TableCell>{interview.stage}</TableCell>
                    <TableCell>{format(new Date(interview.interview_date), "dd-MM-yyyy")}</TableCell>
                    <TableCell>{interview.result}</TableCell>
                    <TableCell>{interview.notes || "-"}</TableCell>
                    <TableCell>{new Date(interview.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewManager;