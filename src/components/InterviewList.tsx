"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { format } from "date-fns";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Removed unused Dialog imports
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// Removed unused Button import
// import { Button } from "@/components/ui/button";
// Removed unused Separator import
// import { Separator } from "@/components/ui/separator";
import EditInterviewDialog from "./EditInterviewDialog"; // Import the new dialog component

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

interface GroupedInterviews {
  [candidateId: string]: {
    candidateName: string;
    interviews: Interview[];
  };
}

interface InterviewListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const InterviewList = ({ refreshTrigger }: InterviewListProps) => {
  const [groupedInterviews, setGroupedInterviews] = useState<GroupedInterviews>({});
  const [loading, setLoading] = useState(true);
  // Removed state for details dialog
  // const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  // const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const [editingInterview, setEditingInterview] = useState<Interview | null>(null); // State for the interview being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State to control edit dialog visibility


  useEffect(() => {
    fetchInterviews();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchInterviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("interviews")
      .select("*, candidates(name)") // Select interview data and join with candidates to get name
      .order("interview_date", { ascending: false }) // Order interviews within a candidate by date
      .order("created_at", { ascending: false }); // Order by creation time for interviews on the same day

    if (error) {
      console.error("Error fetching interviews:", error);
      showError("Gagal memuat data wawancara: " + error.message);
      setGroupedInterviews({}); // Clear data on error
    } else {
      // Group interviews by candidate_id
      const grouped: GroupedInterviews = {};
      data?.forEach(interview => {
        const candidateId = interview.candidate_id;
        const candidateName = interview.candidates?.name || "Nama Tidak Diketahui";
        if (!grouped[candidateId]) {
          grouped[candidateId] = { candidateName, interviews: [] };
        }
        grouped[candidateId].interviews.push(interview);
      });
      setGroupedInterviews(grouped);
    }
    setLoading(false);
  };

  // Modified handler to open edit dialog directly
  const handleInterviewClick = (interview: Interview) => {
    setEditingInterview(interview); // Set the interview data for the edit dialog
    setIsEditDialogOpen(true); // Open the edit dialog
  };

  // Removed handleDeleteClick function (moved to EditInterviewDialog)
  // Removed handleEditClick function (merged into handleInterviewClick)

  const handleEditDialogClose = () => {
    setEditingInterview(null); // Clear the selected interview data for edit
    setIsEditDialogOpen(false); // Close the edit dialog
  };

  const handleInterviewUpdatedOrDeleted = () => {
    fetchInterviews(); // Refresh the list after an interview is updated or deleted
    // No need to explicitly close edit dialog here, it's handled internally
  };


  if (loading) {
    return <div className="container mx-auto p-4">Memuat riwayat wawancara...</div>;
  }

  const candidateIds = Object.keys(groupedInterviews);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Riwayat Wawancara</h3>
      {candidateIds.length === 0 ? (
        <p>Belum ada data wawancara.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {candidateIds.map(candidateId => {
            const candidateData = groupedInterviews[candidateId];
            return (
              <AccordionItem key={candidateId} value={candidateId}>
                <AccordionTrigger>{candidateData.candidateName}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-2">
                    {candidateData.interviews.map(interview => (
                      <div
                        key={interview.id}
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                        // Call the new handler to open the edit dialog
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <p className="font-medium">{interview.stage}</p>
                        <p className="text-sm text-gray-600">
                          Tanggal: {format(new Date(interview.interview_date), "dd-MM-yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Render the EditInterviewDialog */}
      <EditInterviewDialog
        interview={editingInterview}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onUpdateSuccess={handleInterviewUpdatedOrDeleted} // Use the combined handler
        onDeleteSuccess={handleInterviewUpdatedOrDeleted} // Use the combined handler
      />
    </div>
  );
};

export default InterviewList;