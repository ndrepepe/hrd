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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Removed import for EditInterviewDialog

interface Interview {
  id: string;
  created_at: string;
  candidate_id: string;
  stage: string;
  interview_date: string;
  result: string;
  notes: string | null;
  interviewer_name: string | null; // Add interviewer_name
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
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null); // State for the interview whose details are shown
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false); // State to control details dialog visibility

  // Removed state for editingInterview and isEditDialogOpen


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

  const handleStageClick = (interview: Interview) => {
    setSelectedInterview(interview); // Set the interview data for the details dialog
    setIsDetailsDialogOpen(true); // Open the details dialog
  };

  const handleDeleteClick = async () => {
    if (!selectedInterview) return; // Should not happen if dialog is open

    if (window.confirm(`Apakah Anda yakin ingin menghapus data wawancara untuk tahapan "${selectedInterview.stage}"?`)) {
      const { error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", selectedInterview.id);

      if (error) {
        console.error("Error deleting interview:", error);
        showError("Gagal menghapus data wawancara: " + error.message);
      } else {
        showSuccess("Data wawancara berhasil dihapus!");
        setIsDetailsDialogOpen(false); // Close the details dialog
        fetchInterviews(); // Refresh the list
      }
    }
  };

  // Removed handleEditClick function
  // Removed handleEditDialogClose function
  // Removed handleInterviewUpdated function


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
                        onClick={() => handleStageClick(interview)}
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

      {/* Dialog for Interview Details */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detail Wawancara</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai wawancara ini.
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Kandidat:</span>
                <span className="col-span-3">{selectedInterview.candidates?.name || "-"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-sm font-medium col-span-1">Tahapan:</span>
                 <span className="col-span-3">{selectedInterview.stage}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-sm font-medium col-span-1">Tanggal:</span>
                 <span className="col-span-3">{format(new Date(selectedInterview.interview_date), "dd-MM-yyyy")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-sm font-medium col-span-1">Hasil:</span>
                 <span className="col-span-3">{selectedInterview.result}</span>
              </div>
              {/* New: Display Interviewer Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-sm font-medium col-span-1">Pewawancara:</span>
                 <span className="col-span-3">{selectedInterview.interviewer_name || "-"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4"> {/* Use items-start for textarea */}
                 <span className="text-sm font-medium col-span-1 pt-2">Catatan:</span> {/* Add padding top */}
                 <span className="col-span-3 break-words">{selectedInterview.notes || "-"}</span> {/* Use break-words */}
              </div>
               <Separator className="my-2" /> {/* Add a separator */}
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-sm font-medium col-span-1">Dibuat:</span>
                 <span className="col-span-3">{new Date(selectedInterview.created_at).toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter> {/* Add DialogFooter for buttons */}
             <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Tutup</Button>
             {selectedInterview && ( // Only show buttons if an interview is selected
                <>
                   {/* Removed Edit button */}
                   <Button variant="destructive" onClick={handleDeleteClick}>Hapus</Button>
                </>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed rendering of EditInterviewDialog */}
    </div>
  );
};

export default InterviewList;