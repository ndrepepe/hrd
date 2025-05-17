"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input"; // Import Input component
import { format } from "date-fns";

interface Candidate {
  id: string;
  created_at: string;
  position_id: string | null;
  name: string;
  place_of_birth: string | null;
  date_of_birth: string | null;
  phone: string | null;
  address_ktp: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
  positions?: { title: string } | null; // To fetch position title
}

interface CandidateListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const CandidateList = ({ refreshTrigger }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  useEffect(() => {
    fetchCandidates();
  }, [refreshTrigger, searchTerm]); // Depend on refreshTrigger and searchTerm

  const fetchCandidates = async () => {
    setLoading(true);
    let query = supabase
      .from("candidates")
      .select("*, positions(title)")
      .order("created_at", { ascending: false });

    // Add search filter if searchTerm is not empty
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(
        `name.ilike.${searchPattern},positions.title.ilike.${searchPattern},place_of_birth.ilike.${searchPattern},phone.ilike.${searchPattern},last_education.ilike.${searchPattern},skills.ilike.${searchPattern}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching candidates:", error);
      showError("Gagal memuat data kandidat: " + error.message);
    } else {
      setCandidates(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Memuat daftar kandidat...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Kandidat</h3>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Cari kandidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Candidate List Table */}
      {candidates.length === 0 ? (
        <p>{searchTerm ? "Tidak ada kandidat yang cocok dengan pencarian Anda." : "Belum ada kandidat yang ditambahkan."}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi Dilamar</TableHead>
                <TableHead>Tempat/Tgl Lahir</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.positions?.title || "-"}</TableCell>
                  <TableCell>
                      {candidate.place_of_birth || "-"}
                      {candidate.place_of_birth && candidate.date_of_birth ? ", " : ""}
                      {candidate.date_of_birth ? format(new Date(candidate.date_of_birth), "dd-MM-yyyy") : "-"}
                  </TableCell>
                  <TableCell>{candidate.phone || "-"}</TableCell>
                  <TableCell>{candidate.last_education || "-"}</TableCell>
                  <TableCell>{candidate.skills || "-"}</TableCell>
                  <TableCell>{new Date(candidate.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CandidateList;