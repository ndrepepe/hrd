"use client";

import React, { useState } from 'react';
import AddPositionForm from '@/components/AddPositionForm';
import PositionList from '@/components/PositionList';
import AddCandidateForm from '@/components/AddCandidateForm';
import CandidateList from '@/components/CandidateList';
import AddInterviewForm from '@/components/AddInterviewForm';
import InterviewList from '@/components/InterviewList';
import AddDecisionForm from '@/components/AddDecisionForm';
import DecisionList from '@/components/DecisionList';
import BriefingList from '@/components/BriefingList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RecruitmentPage = () => {
  const [refreshPositions, setRefreshPositions] = useState(0);
  const [refreshCandidates, setRefreshCandidates] = useState(0);
  const [refreshInterviews, setRefreshInterviews] = useState(0);
  const [refreshDecisions, setRefreshDecisions] = useState(0);
  const [activeTab, setActiveTab] = useState("add-candidate"); // Default active tab

  // State to track the ID of the candidate being edited (still needed for AddCandidateForm)
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);


  // Callbacks to trigger list refreshes
  const handlePositionAdded = () => {
    setRefreshPositions(prev => prev + 1);
    // Also refresh candidate forms as new positions are available
    setRefreshCandidates(prev => prev + 1); // This will trigger fetchCandidates in AddCandidateForm
  };

  // New callback for position deletion
  const handlePositionDeleted = () => {
    setRefreshPositions(prev => prev + 1);
    // Refresh all lists that might be affected by position changes
    setRefreshCandidates(prev => prev + 1);
    setRefreshInterviews(prev => prev + 1);
    setRefreshDecisions(prev => prev + 1);
  };

  // New callback for position update (e.g., name change or status change)
  const handlePositionUpdated = () => {
    setRefreshPositions(prev => prev + 1);
     // Refresh all lists that might be affected by position changes
    setRefreshCandidates(prev => prev + 1);
    setRefreshInterviews(prev => prev + 1);
    setRefreshDecisions(prev => prev + 1);
  };


  const handleCandidateAdded = () => {
    setRefreshCandidates(prev => prev + 1);
    // Also refresh candidate lists in Interview and Decision forms
    setRefreshInterviews(prev => prev + 1); // This will trigger fetchCandidates in AddInterviewForm
    setRefreshDecisions(prev => prev + 1); // This will trigger fetchCandidates in AddDecisionForm
    // Clear editing state after adding a new candidate
    setEditingCandidateId(null);
  };

  // New callback for candidate deletion
  const handleCandidateDeleted = () => {
    setRefreshCandidates(prev => prev + 1);
    // Refresh lists/forms that depend on the candidate list
    setRefreshInterviews(prev => prev + 1);
    setRefreshDecisions(prev => prev + 1);
    // Also refresh decision list and briefing list in case the deleted candidate had a decision
    setRefreshDecisions(prev => prev + 1);
    // Clear editing state if the deleted candidate was the one being edited
    setEditingCandidateId(null);
  };

  // New callback for candidate update (still needed even if triggered internally by AddCandidateForm)
  const handleCandidateUpdated = () => {
    setRefreshCandidates(prev => prev + 1);
    // Refresh lists/forms that depend on the candidate list
    setRefreshInterviews(prev => prev + 1);
    setRefreshDecisions(prev => prev + 1);
    // Also refresh decision list and briefing list in case the updated candidate had a decision
    setRefreshDecisions(prev => prev + 1);
    // Clear editing state after updating (handled by AddCandidateForm, but good practice to have a handler)
    setEditingCandidateId(null);
  };

  // Removed handleEditCandidate function


  const handleInterviewAdded = () => {
    setRefreshInterviews(prev => prev + 1);
  };

  const handleDecisionAdded = () => {
    setRefreshDecisions(prev => prev + 1); // Trigger refresh for DecisionList AND CandidateList AND BriefingList
    // Also refresh candidate lists in Interview and Decision forms, as a candidate might now have a decision
    setRefreshCandidates(prev => prev + 1); // Trigger refresh for CandidateList and forms that depend on it
    setRefreshInterviews(prev => prev + 1); // Trigger refresh for AddInterviewForm (to update candidate dropdown)
    // Also refresh position list, as an 'Accepted' decision changes position status
    setRefreshPositions(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4"> {/* Removed pt-16 */}
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Rekrutmen Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola posisi yang dibutuhkan, data kandidat, proses wawancara, dan keputusan rekrutmen di sini.
      </p>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="flex flex-wrap h-auto justify-center gap-2 mb-6"> {/* Use flex-wrap for responsiveness */}
          <TabsTrigger value="add-position">Tambah Posisi</TabsTrigger>
          <TabsTrigger value="list-positions">Daftar Posisi</TabsTrigger>
          <TabsTrigger value="add-candidate">Tambah Kandidat</TabsTrigger>
          <TabsTrigger value="list-candidates">Daftar Kandidat</TabsTrigger>
          <TabsTrigger value="add-interview">Tambah Wawancara</TabsTrigger>
          <TabsTrigger value="list-interviews">Riwayat Wawancara</TabsTrigger>
          <TabsTrigger value="add-decision">Tambah Keputusan</TabsTrigger>
          <TabsTrigger value="list-decisions">Daftar Keputusan</TabsTrigger>
          <TabsTrigger value="briefing-list">Pembekalan</TabsTrigger>
        </TabsList>

        {/* TabsContent area */}
        <div> {/* Simple div wrapper, no fixed positioning or extra margin needed */}
          <TabsContent value="add-position" className="mt-0">
            <AddPositionForm onPositionAdded={handlePositionAdded} />
          </TabsContent>

          <TabsContent value="list-positions" className="mt-0">
            <PositionList
              refreshTrigger={refreshPositions}
              onPositionDeleted={handlePositionDeleted}
              onPositionUpdated={handlePositionUpdated}
            />
          </TabsContent>

          <TabsContent value="add-candidate" className="mt-0">
            <AddCandidateForm
              onCandidateAdded={handleCandidateAdded} // This callback is now used for both add and update success
              refreshPositionsTrigger={refreshPositions}
              // Removed editingCandidateId and setEditingCandidateId props
            />
          </TabsContent>

          <TabsContent value="list-candidates" className="mt-0">
            <CandidateList
              refreshTrigger={refreshCandidates}
              refreshDecisionsTrigger={refreshDecisions}
              onCandidateDeleted={handleCandidateDeleted}
              onCandidateUpdated={handleCandidateUpdated} // Keep this prop as delete also triggers it
              // Removed onEditClick prop
            />
          </TabsContent>

          <TabsContent value="add-interview" className="mt-0">
            <AddInterviewForm onInterviewAdded={handleInterviewAdded} refreshCandidatesTrigger={refreshCandidates} />
          </TabsContent>

          <TabsContent value="list-interviews" className="mt-0">
            <InterviewList refreshTrigger={refreshInterviews} />
          </TabsContent>

          <TabsContent value="add-decision" className="mt-0">
            <AddDecisionForm onDecisionAdded={handleDecisionAdded} refreshCandidatesTrigger={refreshCandidates} />
          </TabsContent>

          <TabsContent value="list-decisions" className="mt-0">
            <DecisionList refreshTrigger={refreshDecisions} />
          </TabsContent>

          <TabsContent value="briefing-list" className="mt-0">
             <BriefingList refreshTrigger={refreshDecisions} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RecruitmentPage;