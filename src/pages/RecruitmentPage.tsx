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
import BriefingList from '@/components/BriefingList'; // Import the new component

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RecruitmentPage = () => {
  const [refreshPositions, setRefreshPositions] = useState(0);
  const [refreshCandidates, setRefreshCandidates] = useState(0);
  const [refreshInterviews, setRefreshInterviews] = useState(0);
  const [refreshDecisions, setRefreshDecisions] = useState(0);
  const [activeTab, setActiveTab] = useState("add-candidate"); // Default active tab

  // Callbacks to trigger list refreshes
  const handlePositionAdded = () => {
    setRefreshPositions(prev => prev + 1);
  };

  const handleCandidateAdded = () => {
    setRefreshCandidates(prev => prev + 1);
    // Also refresh candidate lists in Interview and Decision forms
    setRefreshInterviews(prev => prev + 1); // This will trigger fetchCandidates in AddInterviewForm
    setRefreshDecisions(prev => prev + 1); // This will trigger fetchCandidates in AddDecisionForm
  };

  const handleInterviewAdded = () => {
    setRefreshInterviews(prev => prev + 1);
  };

  const handleDecisionAdded = () => {
    setRefreshDecisions(prev => prev + 1); // Trigger refresh for DecisionList AND CandidateList AND BriefingList
    // Also refresh candidate lists in Interview and Decision forms, as a candidate might now have a decision
    setRefreshCandidates(prev => prev + 1); // Trigger refresh for CandidateList and forms that depend on it
    setRefreshInterviews(prev => prev + 1); // Trigger refresh for AddInterviewForm (to update candidate dropdown)
  };

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Rekrutmen Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola posisi yang dibutuhkan, data kandidat, proses wawancara, dan keputusan rekrutmen di sini.
      </p>

      {/* Tabs component wraps the sidebar and content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Flex container for sidebar (TabsList) and main content (TabsContent) */}
        <div className="flex flex-col md:flex-row gap-6"> {/* Use flex-col on small screens, flex-row on medium+ */}
          {/* Vertical TabsList (Sidebar) */}
          <TabsList className="flex flex-col w-full md:w-64 space-y-1 bg-gray-100 p-2 rounded-md flex-shrink-0"> {/* Vertical layout, fixed width on md+, background, padding, rounded corners, prevent shrinking */}
            <TabsTrigger value="add-position" className="justify-start">Tambah Posisi</TabsTrigger> {/* Align text left */}
            <TabsTrigger value="list-positions" className="justify-start">Daftar Posisi</TabsTrigger>
            <TabsTrigger value="add-candidate" className="justify-start">Tambah Kandidat</TabsTrigger>
            <TabsTrigger value="list-candidates" className="justify-start">Daftar Kandidat</TabsTrigger>
            <TabsTrigger value="add-interview" className="justify-start">Tambah Wawancara</TabsTrigger>
            <TabsTrigger value="list-interviews" className="justify-start">Riwayat Wawancara</TabsTrigger>
            <TabsTrigger value="add-decision" className="justify-start">Tambah Keputusan</TabsTrigger>
            <TabsTrigger value="list-decisions" className="justify-start">Daftar Keputusan</TabsTrigger>
            <TabsTrigger value="briefing-list" className="justify-start">Pembekalan</TabsTrigger>
          </TabsList>

          {/* Main content area */}
          <div className="flex-grow"> {/* Takes remaining horizontal space */}
            <TabsContent value="add-position" className="mt-0"> {/* mt-0 to override default TabsContent margin */}
              <AddPositionForm onPositionAdded={handlePositionAdded} />
            </TabsContent>

            <TabsContent value="list-positions" className="mt-0">
              <PositionList refreshTrigger={refreshPositions} />
            </TabsContent>

            <TabsContent value="add-candidate" className="mt-0">
              <AddCandidateForm onCandidateAdded={handleCandidateAdded} refreshPositionsTrigger={refreshPositions} />
            </TabsContent>

            <TabsContent value="list-candidates" className="mt-0">
              <CandidateList refreshTrigger={refreshCandidates} refreshDecisionsTrigger={refreshDecisions} />
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
        </div>
      </Tabs>
    </div>
  );
};

export default RecruitmentPage;