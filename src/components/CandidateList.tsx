"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, differenceInYears, parseISO } from "date-fns";
// Removed import for EditCandidateDialog

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
  positions?: { title: string } | null;
  decisions?: { status: string, created_at: string }[] | null;
}

interface CandidateListProps {
  refreshTrigger: number;
  refreshDecisionsTrigger: number;
  onCandidateDeleted: () => void;
  onCandidateUpdated: () => void;
  onEditClick: (candidateId: string) => void; // New prop: callback for edit button click
}

const searchableFields = [
  { label: "Nama", value: "name" },
  { label: "Posisi Dilamar", value: "positions.title" },
  { label: "Tempat Lahir", value: "place_of_birth" },
  { label: "No HP", value: "phone" },
  { label: "Pendidikan Terakhir", value: "last_education" },
  { label: "Skill", value: "skills" },
];

const CandidateList = ({ refreshTrigger, refreshDecisionsTrigger, onCandidateDeleted, onCandidateUpdated, onEditClick }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState(searchableFields[0].value);

  // Removed state for selectedCandidateForEdit and isEditDialogOpen

  useEffect(() => {
    fetchCandidates();
  }, [refreshTrigger, refreshDecisionsTrigger, searchTerm, searchField]);

  const fetchCandidates = async () => {
    setLoading(true);
    console.log("Fetching candidates with search term:", searchTerm, "in field:", searchField);

    let query = supabase
      .from("candidates")
      .select("*, positions!left(title), decisions!left(status, created_at)")
      .order("created_at", { ascending: false });

    if (searchTerm && searchField) {
      const searchPattern = `%${searchTerm}%`;
      if (searchField === 'positions.title') {
         console.log(`Applying filter: positions.title ilike ${searchPattern}`);
         query = query.filter('positions.title', 'ilike', searchPattern);
      } else {
         console.log(`Applying filter: ${searchField} ilike ${searchPattern}`);
         query = query.ilike(searchField, searchPattern);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching candidates:", error);
      showError("Gagal memuat data kandidat: " + error.message);
      setCandidates([]);
    } else {
      console.log("Fetched candidates data:", data);
      setCandidates(data || []);
    }
    setLoading(false);
  };

  const getLatestDecisionStatus = (decisions: Candidate['decisions']): string => {
    if (!Array.isArray(decisions) || decisions.length === 0) {
      return "Proses";
    }
    const sortedDecisions = [...decisions].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedDecisions[0].status;
  };

  const calculateAge = (dobString: string | null): number | null => {
    if (!dobString) return null;
    try {
        const dob = parseISO(dobString);
        if (isNaN(dob.getTime())) return null;
        const today = new Date();
        return differenceInYears(today, dob);
    } catch (e) {
        console.error("Error parsing date for age calculation:", e);
        return null;
    }
  };


  const handleDelete = async (id: string) => {
    // --- Start Validation Check: Check for linked interviews ---
    console.log("Checking for interviews linked to candidate ID:", id);
    const { data: interviewsData, error: interviewsError } = await supabase
      .from("interviews")
      .select("id")
      .eq("candidate_id", id)
      .limit(1);

    if (interviewsError) {
      console.error("Error checking for linked interviews:", interviewsError);
      showError("Gagal memeriksa riwayat wawancara terkait: " + interviewsError.message);
      return;
    }

    if (interviewsData && interviewsData.length > 0) {
      console.log("Found linked interviews, preventing deletion.");
      showError("Kandidat ini tidak dapat dihapus karena sudah memiliki riwayat wawancara.");
      return;
    }
    // --- End Validation Check ---

    // --- Start Validation Check: Check for linked decisions ---
     console.log("Checking for decisions linked to candidate ID:", id);
     const { data: decisionsData, error: decisionsError } = await supabase
       .from("decisions")
       .select("id")
       .eq("candidate_id", id)
       .limit(1);

     if (decisionsError) {
       console.error("Error checking for linked decisions:", decisionsError);
       showError("Gagal memeriksa data keputusan terkait: " + decisionsError.message);
       return;
     }

     if (decisionsData && decisionsData.length > 0) {
       console.log("Found linked decisions, preventing deletion.");
       showError("Kandidat ini tidak dapat dihapus karena sudah memiliki data keputusan.");
       return;
     }
     // --- End Validation Check ---


    if (window.confirm("Apakah Anda yakin ingin menghapus data kandidat ini?")) {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting candidate:", error);
        showError("Gagal menghapus data kandidat: " + error.message);
      } else {
        showSuccess("Data kandidat berhasil dihapus!");
        fetchCandidates();
        onCandidateDeleted();
      }
    }
  };

  // Modified handleEditClick to call the prop
  const handleEditClick = (candidateId: string) => {
    console.log("Edit button clicked for candidate ID:", candidateId);
    onEditClick(candidateId); // Call the parent's edit handler
  };

  // Removed handleEditDialogClose and handleCandidateUpdated (handled by parent)


  if (loading) {
    return <p>Memuat daftar kandidat...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Kandidat</h3>

      {/* Search Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <Label htmlFor="search-field" className="shrink-0">Cari Berdasarkan:</Label>
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger id="search-field" className="w-full md:w-[200px]">
            <SelectValue placeholder="Pilih field" />
          </SelectTrigger>
          <SelectContent>
            {searchableFields.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={`Cari ${searchableFields.find(f => f.value === searchField)?.label || 'kandidat'}...`}
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
                <TableHead>Status Keputusan</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => {
                const latestStatus = getLatestDecisionStatus(candidate.decisions);
                let textColorClass = '';
                if (latestStatus === 'Accepted') {
                  textColorClass = 'text-green-600 font-medium';
                } else if (latestStatus === 'Rejected') {
                  textColorClass = 'text-red-600 font-medium';
                }

                const age = calculateAge(candidate.date_of_birth);
                const dobDisplay = candidate.date_of_birth ? format(parseISO(candidate.date_of_birth), "dd-MM-yyyy") : "-";
                const placeAndDob = `${candidate.place_of_birth || "-"}, ${dobDisplay}`;
                const placeAndDobWithAge = age !== null ? `${placeAndDob} (${age} tahun)` : placeAndDob;


                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <span className={textColorClass}>{candidate.name}</span>
                    </TableCell>
                    <TableCell>{candidate.positions?.title || "-"}</TableCell>
                    <TableCell>{placeAndDobWithAge}</TableCell>
                    <TableCell>{candidate.phone || "-"}</TableCell>
                    <TableCell>{candidate.last_education || "-"}</TableCell>
                    <TableCell>{candidate.skills || "-"}</TableCell>
                    <TableCell>{latestStatus}</TableCell>
                    <TableCell>{new Date(candidate.created_at).toLocaleString()}</TableCell>
                    <TableCell className="flex space-x-2">
                      {/* Call handleEditClick with the candidate ID */}
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(candidate.id)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(candidate.id)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Removed rendering of EditCandidateDialog */}
    </div>
  );
};

export default CandidateList;