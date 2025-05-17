"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

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

interface InterviewListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const InterviewList = ({ refreshTrigger }: InterviewListProps) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchInterviews = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat riwayat wawancara...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Riwayat Wawancara</h3>
      {interviews.length === 0 ? (
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
  );
};

export default InterviewList;