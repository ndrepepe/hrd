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

interface DecisionWithCandidate {
  id: string;
  created_at: string;
  candidate_id: string;
  status: string;
  start_date: string | null;
  rejection_reason: string | null;
  candidates?: { // Joined candidate data
    id: string;
    name: string;
    place_of_birth: string | null;
    date_of_birth: string | null;
    phone: string | null;
    address_ktp: string | null;
    last_education: string | null;
    major: string | null;
    skills: string | null;
  } | null;
}

interface BriefingListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const BriefingList = ({ refreshTrigger }: BriefingListProps) => {
  const [acceptedCandidates, setAcceptedCandidates] = useState<DecisionWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedCandidates();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchAcceptedCandidates = async () => {
    setLoading(true);
    console.log("Fetching accepted candidates for briefing list...");

    // Fetch decisions with status 'Accepted' and join with candidates table
    const { data, error } = await supabase
      .from("decisions")
      .select(`
        id,
        created_at,
        candidate_id,
        status,
        start_date,
        rejection_reason,
        candidates (
          id,
          name,
          place_of_birth,
          date_of_birth,
          phone,
          address_ktp,
          last_education,
          major,
          skills
        )
      `)
      .eq("status", "Accepted") // Filter by Accepted status
      .order("created_at", { ascending: false }); // Order by decision creation date

    if (error) {
      console.error("Error fetching accepted candidates:", error);
      showError("Gagal memuat data kandidat diterima: " + error.message);
      setAcceptedCandidates([]); // Clear data on error
    } else {
      console.log("Fetched accepted candidates data:", data);
      // Filter out any entries where candidate data might be null (shouldn't happen with foreign key)
      const validData = data?.filter(item => item.candidates !== null) as DecisionWithCandidate[] || [];
      setAcceptedCandidates(validData);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar kandidat diterima...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Kandidat Diterima (Pembekalan)</h3>
      {acceptedCandidates.length === 0 ? (
        <p>Belum ada kandidat dengan status 'Diterima'.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tempat/Tgl Lahir</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Keputusan Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acceptedCandidates.map((decision) => (
                <TableRow key={decision.id}> {/* Use decision ID as key */}
                  <TableCell>{decision.candidates?.name || "-"}</TableCell>
                  <TableCell>{decision.start_date ? format(new Date(decision.start_date), "dd-MM-yyyy") : "-"}</TableCell>
                   <TableCell>
                        {decision.candidates?.place_of_birth || "-"}
                        {decision.candidates?.place_of_birth && decision.candidates?.date_of_birth ? ", " : ""}
                        {decision.candidates?.date_of_birth ? format(new Date(decision.candidates.date_of_birth), "dd-MM-yyyy") : "-"}
                    </TableCell>
                    <TableCell>{decision.candidates?.phone || "-"}</TableCell>
                    <TableCell>{decision.candidates?.last_education || "-"}</TableCell>
                    <TableCell>{decision.candidates?.skills || "-"}</TableCell>
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

export default BriefingList;