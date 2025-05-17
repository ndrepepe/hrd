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

interface Decision {
  id: string;
  created_at: string;
  candidate_id: string;
  status: string;
  start_date: string | null;
  rejection_reason: string | null;
  candidates?: { name: string } | null; // To fetch candidate name
}

interface DecisionListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const DecisionList = ({ refreshTrigger }: DecisionListProps) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchDecisions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("decisions")
      .select("*, candidates(name)") // Select decision data and join with candidates to get name
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching decisions:", error);
      showError("Gagal memuat data keputusan: " + error.message);
    } else {
      setDecisions(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar keputusan...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Keputusan</h3>
      {decisions.length === 0 ? (
        <p>Belum ada data keputusan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kandidat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Alasan Penolakan</TableHead>
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell>{decision.candidates?.name || "-"}</TableCell>
                  <TableCell>{decision.status}</TableCell>
                  <TableCell>{decision.start_date ? format(new Date(decision.start_date), "dd-MM-yyyy") : "-"}</TableCell>
                  <TableCell>{decision.rejection_reason || "-"}</TableCell>
                  <TableCell>{new Date(decision.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DecisionList;