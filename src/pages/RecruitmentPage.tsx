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
    setRefreshDecisions(prev => prev + 1); // This will trigger fetchCandidates in AddDecisionForm - Corrected: This should trigger CandidateList refresh, not AddDecisionForm refresh
  };

  const handleInterviewAdded = () => {
    setRefreshInterviews(prev => prev + 1);
  };

  const handleDecisionAdded = () => {
    setRefreshDecisions(prev => prev + 1); // Trigger refresh for DecisionList AND CandidateList
    // Also refresh candidate lists in Interview and Decision forms, as a candidate might now have a decision
    setRefreshCandidates(prev => prev + 1); // Trigger refresh for CandidateList and forms that depend on it
    setRefreshInterviews(prev => prev + 1); // Trigger refresh for AddInterviewForm (to update candidate dropdown)
  };

  // Estimate the height of the fixed header (title, description, tabs list, padding)
  // This is an approximation, adjust mt- value below if needed
  const fixedHeaderHeightEstimate = 'mt-64'; // Adjusted height estimate for more tabs

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      {/* Tabs component wraps everything */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Fixed container for Title, Description, and TabsList */}
        <div className="fixed top-16 left-0 right-0 z-50 w-full bg-white shadow-md">
           <div className="container mx-auto p-4"> {/* Inner container */}
              <h1 className="text-3xl font-bold mb-2 text-center">Modul Rekrutmen Karyawan</h1>
              <p className="text-center text-gray-600 mb-4">
                Kelola posisi yang dibutuhkan, data kandidat, proses wawancara, dan keputusan rekrutmen di sini.
              </p>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8"> {/* Adjusted grid for 8 tabs */}
                <TabsTrigger value="add-position">Tambah Posisi</TabsTrigger>
                <TabsTrigger value="list-positions">Daftar Posisi</TabsTrigger>
                <TabsTrigger value="add-candidate">Tambah Kandidat</TabsTrigger>
                <TabsTrigger value="list-candidates">Daftar Kandidat</TabsTrigger>
                <TabsTrigger value="add-interview">Tambah Wawancara</TabsTrigger>
                <TabsTrigger value="list-interviews">Riwayat Wawancara</TabsTrigger>
                <TabsTrigger value="add-decision">Tambah Keputusan</TabsTrigger>
                <TabsTrigger value="list-decisions">Daftar Keputusan</TabsTrigger>
              </TabsList>
           </div>
        </div>

        {/* Scrolling content area */}
        {/* Add top margin to push content down below the fixed header */}
        <div className={`${fixedHeaderHeightEstimate}`}>
          <TabsContent value="add-position" className="mt-0">
            <AddPositionForm onPositionAdded={handlePositionAdded} />
          </TabsContent>

          <TabsContent value="list-positions" className="mt-0">
            <PositionList refreshTrigger={refreshPositions} />
          </TabsContent>

          <TabsContent value="add-candidate" className="mt-0">
            <AddCandidateForm onCandidateAdded={handleCandidateAdded} refreshPositionsTrigger={refreshPositions} /> {/* Pass refresh trigger for positions */}
          </TabsContent>

          <TabsContent value="list-candidates" className="mt-0">
            {/* Pass both refresh triggers to CandidateList */}
            <CandidateList refreshTrigger={refreshCandidates} refreshDecisionsTrigger={refreshDecisions} />
          </TabsContent>

          <TabsContent value="add-interview" className="mt-0">
            <AddInterviewForm onInterviewAdded={handleInterviewAdded} refreshCandidatesTrigger={refreshCandidates} /> {/* Pass refresh trigger for candidates */}
          </TabsContent>

          <TabsContent value="list-interviews" className="mt-0">
            <InterviewList refreshTrigger={refreshInterviews} />
          </TabsContent>

          <TabsContent value="add-decision" className="mt-0">
            <AddDecisionForm onDecisionAdded={handleDecisionAdded} refreshCandidatesTrigger={refreshCandidates} /> {/* Pass refresh trigger for candidates */}
          </TabsContent>

          <TabsContent value="list-decisions" className="mt-0">
            <DecisionList refreshTrigger={refreshDecisions} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RecruitmentPage;