"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button"; // Import Button
import EditBriefingDialog from "./EditBriefingDialog"; // Import the new dialog component

interface DecisionWithCandidate {
  id: string;
  created_at: string;
  candidate_id: string;
  status: string;
  start_date: string | null;
  rejection_reason: string | null;
  end_date: string | null;
  briefing_result: string | null;
  candidates?: { // Joined candidate data
    id: string;
    name: string;
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
  const [selectedDecisionForEdit, setSelectedDecisionForEdit] = useState<DecisionWithCandidate | null>(null); // State for the decision being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State to control dialog visibility

  useEffect(() => {
    fetchAcceptedCandidates();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchAcceptedCandidates = async () => {
    setLoading(true);
    console.log("Fetching accepted candidates for briefing list...");

    const { data, error } = await supabase
      .from("decisions")
      .select(`
        id,
        created_at,
        candidate_id,
        status,
        start_date,
        rejection_reason,
        end_date,
        briefing_result,
        candidates (
          id,
          name,
          phone,
          address_ktp,
          last_education,
          major,
          skills
        )
      `)
      .eq("status", "Accepted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching accepted candidates:", error);
      showError("Gagal memuat data kandidat diterima: " + error.message);
      setAcceptedCandidates([]);
    } else {
      console.log("Fetched accepted candidates data:", data);
      const validData = data?.filter(item => item.candidates !== null) as DecisionWithCandidate[] || [];
      setAcceptedCandidates(validData);
    }
    setLoading(false);
  };

  const handleEditClick = (decision: DecisionWithCandidate) => {
    setSelectedDecisionForEdit(decision); // Set the decision data
    setIsEditDialogOpen(true); // Open the dialog
  };

  const handleEditDialogClose = () => {
    setSelectedDecisionForEdit(null); // Clear the selected decision data
    setIsEditDialogOpen(false); // Close the dialog
  };

  const handleBriefingUpdated = () => {
    fetchAcceptedCandidates(); // Refresh the list after a decision is updated
  };

  if (loading) {
    return <div className="container mx-auto p-4">Memuat daftar kandidat diterima...</div>;
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
                <TableHead>No HP</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Tanggal Berakhir</TableHead>
                <TableHead>Hasil Pembekalan</TableHead>
                <TableHead>Keputusan Dibuat Pada</TableHead>
                <TableHead>Aksi</TableHead> {/* New Action Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {acceptedCandidates.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell>{decision.candidates?.name || "-"}</TableCell>
                  <TableCell>{decision.start_date ? format(new Date(decision.start_date), "dd-MM-yyyy") : "-"}</TableCell>
                  <TableCell>{decision.candidates?.phone || "-"}</TableCell>
                  <TableCell>{decision.candidates?.last_education || "-"}</TableCell>
                  <TableCell>{decision.candidates?.skills || "-"}</TableCell>
                  <TableCell>{decision.end_date ? format(new Date(decision.end_date), "dd-MM-yyyy") : "-"}</TableCell>
                  <TableCell>{decision.briefing_result || "-"}</TableCell>
                  <TableCell>{new Date(decision.created_at).toLocaleString()}</TableCell>
                  <TableCell> {/* New Action Cell */}
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(decision)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Render the EditBriefingDialog */}
      <EditBriefingDialog
        decision={selectedDecisionForEdit}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onUpdateSuccess={handleBriefingUpdated}
      />
    </div>
  );
};

export default BriefingList;