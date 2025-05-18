"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast"; // Import showSuccess
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input"; // Import Input component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Label } from "@/components/ui/label"; // Import Label component
import { Button } from "@/components/ui/button"; // Import Button component
import { format, differenceInYears, parseISO } from "date-fns"; // Import format, differenceInYears, and parseISO
import EditCandidateDialog from "./EditCandidateDialog"; // Import the new dialog component

interface Candidate {
  id: string;
  created_at: string;
  position_id: string | null;
  name: string;
  place_of_birth: string | null;
  date_of_birth: string | null; // Date is string from DB
  phone: string | null;
  address_ktp: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
  positions?: { title: string } | null; // To fetch position title
  // Keep decisions type as it's still fetched in the query
  decisions?: { status: string, created_at: string }[] | null;
}

interface CandidateListProps {
  refreshTrigger: number; // Prop to trigger refresh (e.g., when candidate added)
  refreshDecisionsTrigger: number; // New prop to trigger refresh when decision added/changed
  onCandidateDeleted: () => void; // New callback for candidate deletion
  onCandidateUpdated: () => void; // New callback for candidate update
}

// Define searchable fields with their labels and database column names
const searchableFields = [
  { label: "Nama", value: "name" },
  { label: "Posisi Dilamar", value: "positions.title" }, // Special value for joined column
  { label: "Tempat Lahir", value: "place_of_birth" },
  { label: "No HP", value: "phone" },
  { label: "Pendidikan Terakhir", value: "last_education" },
  { label: "Skill", value: "skills" },
];

const CandidateList = ({ refreshTrigger, refreshDecisionsTrigger, onCandidateDeleted, onCandidateUpdated }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [searchField, setSearchField] = useState(searchableFields[0].value); // State for selected search field, default to 'Nama'

  const [selectedCandidateForEdit, setSelectedCandidateForEdit] = useState<Candidate | null>(null); // State for the candidate being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State to control dialog visibility


  useEffect(() => {
    fetchCandidates();
  }, [refreshTrigger, refreshDecisionsTrigger, searchTerm, searchField]); // Depend on ALL relevant triggers and filters

  const fetchCandidates = async () => {
    setLoading(true);
    console.log("Fetching candidates with search term:", searchTerm, "in field:", searchField);

    let query = supabase
      .from("candidates")
      // Select candidate data, left join positions for title, and left join decisions for status and created_at
      .select("*, positions!left(title), decisions!left(status, created_at)")
      .order("created_at", { ascending: false });

    // Apply filter based on selected field and search term
    if (searchTerm && searchField) {
      const searchPattern = `%${searchTerm}%`;
      if (searchField === 'positions.title') {
         // Filter on the joined table's column using the filter method
         console.log(`Applying filter: positions.title ilike ${searchPattern}`);
         query = query.filter('positions.title', 'ilike', searchPattern);
      } else {
         // Filter on a direct column in the candidates table
         console.log(`Applying filter: ${searchField} ilike ${searchPattern}`);
         query = query.ilike(searchField, searchPattern);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching candidates:", error);
      showError("Gagal memuat data kandidat: " + error.message);
      setCandidates([]); // Clear candidates on error
    } else {
      console.log("Fetched candidates data:", data);
      setCandidates(data || []);
    }
    setLoading(false);
  };

  // Function to find the latest decision status
  const getLatestDecisionStatus = (decisions: Candidate['decisions']): string => {
    // Check if decisions is an array and is not empty
    if (!Array.isArray(decisions) || decisions.length === 0) {
      return "Proses"; // Default status if no decisions
    }
    // Sort decisions by created_at descending to find the latest
    const sortedDecisions = [...decisions].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    // console.log("Decisions for candidate:", sortedDecisions); // Keep for debugging if needed
    return sortedDecisions[0].status;
  };

  // Function to calculate age
  const calculateAge = (dobString: string | null): number | null => {
    if (!dobString) return null;
    try {
        const dob = parseISO(dobString);
        if (isNaN(dob.getTime())) return null; // Check for invalid date
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
      .select("id") // We only need to know if any exist
      .eq("candidate_id", id)
      .limit(1); // Stop after finding the first one

    if (interviewsError) {
      console.error("Error checking for linked interviews:", interviewsError);
      showError("Gagal memeriksa riwayat wawancara terkait: " + interviewsError.message);
      return; // Stop the delete process
    }

    if (interviewsData && interviewsData.length > 0) {
      console.log("Found linked interviews, preventing deletion.");
      showError("Kandidat ini tidak dapat dihapus karena sudah memiliki riwayat wawancara.");
      return; // Stop the delete process
    }
    // --- End Validation Check ---

    // --- Start Validation Check: Check for linked decisions ---
     console.log("Checking for decisions linked to candidate ID:", id);
     const { data: decisionsData, error: decisionsError } = await supabase
       .from("decisions")
       .select("id") // We only need to know if any exist
       .eq("candidate_id", id)
       .limit(1); // Stop after finding the first one

     if (decisionsError) {
       console.error("Error checking for linked decisions:", decisionsError);
       showError("Gagal memeriksa data keputusan terkait: " + decisionsError.message);
       return; // Stop the delete process
     }

     if (decisionsData && decisionsData.length > 0) {
       console.log("Found linked decisions, preventing deletion.");
       showError("Kandidat ini tidak dapat dihapus karena sudah memiliki data keputusan.");
       return; // Stop the delete process
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
        fetchCandidates(); // Refresh the list in this component
        onCandidateDeleted(); // Notify parent (RecruitmentPage) to refresh other lists/forms
      }
    }
  };

  const handleEditClick = (candidate: Candidate) => {
    setSelectedCandidateForEdit(candidate); // Set the candidate data
    setIsEditDialogOpen(true); // Open the dialog
  };

  const handleEditDialogClose = () => {
    setSelectedCandidateForEdit(null); // Clear the selected candidate data
    setIsEditDialogOpen(false); // Close the dialog
  };

  const handleCandidateUpdated = () => {
    fetchCandidates(); // Refresh the list after a candidate is updated
    onCandidateUpdated(); // Notify parent (RecruitmentPage) to refresh other lists/forms
  };


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
                <TableHead>Status Keputusan</TableHead> {/* Added Status Keputusan Header */}
                <TableHead>Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead> {/* New Action Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => {
                const latestStatus = getLatestDecisionStatus(candidate.decisions);
                let textColorClass = '';
                if (latestStatus === 'Accepted') {
                  textColorClass = 'text-green-600 font-medium'; // Tailwind green
                } else if (latestStatus === 'Rejected') {
                  textColorClass = 'text-red-600 font-medium'; // Tailwind red
                }

                // Calculate age for display
                const age = calculateAge(candidate.date_of_birth);
                const dobDisplay = candidate.date_of_birth ? format(parseISO(candidate.date_of_birth), "dd-MM-yyyy") : "-";
                const placeAndDob = `${candidate.place_of_birth || "-"}, ${dobDisplay}`;
                const placeAndDobWithAge = age !== null ? `${placeAndDob} (${age} tahun)` : placeAndDob;


                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      {/* Apply the color class to the name */}
                      <span className={textColorClass}>{candidate.name}</span>
                    </TableCell>
                    <TableCell>{candidate.positions?.title || "-"}</TableCell>
                    <TableCell>{placeAndDobWithAge}</TableCell> {/* Display place, DOB, and age */}
                    <TableCell>{candidate.phone || "-"}</TableCell>
                    <TableCell>{candidate.last_education || "-"}</TableCell>
                    <TableCell>{candidate.skills || "-"}</TableCell>
                    <TableCell>{latestStatus}</TableCell> {/* Display Status Keputusan */}
                    <TableCell>{new Date(candidate.created_at).toLocaleString()}</TableCell>
                    <TableCell className="flex space-x-2"> {/* New Action Cell */}
                      {/* Call handleEditClick with the candidate data */}
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(candidate)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(candidate.id)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Render the EditCandidateDialog */}
      <EditCandidateDialog
        candidate={selectedCandidateForEdit}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onCandidateUpdated={handleCandidateUpdated}
      />
    </div>
  );
};

export default CandidateList;