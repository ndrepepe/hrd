"use client";

import React, { useState } from 'react';
import DailyReportForm from '@/components/DailyReportForm';
import DailyReportList from '@/components/DailyReportList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

const DailyReportPage = () => {
  const [refreshList, setRefreshList] = useState(0);
  const [activeTab, setActiveTab] = useState("input-report"); // State to manage active tab, default to input form
  const [editingReportId, setEditingReportId] = useState<string | null>(null); // State to hold the ID of the report being edited

  const handleReportSubmitted = () => {
    // Increment state to trigger refresh in DailyReportList
    setRefreshList(prev => prev + 1);
    // Clear editing state after submission (add or edit)
    setEditingReportId(null);
    // Optionally switch to list view after submission
    setActiveTab("list-reports");
  };

  const handleEditClick = (reportId: string) => {
    setEditingReportId(reportId); // Set the ID of the report to be edited
    setActiveTab("input-report"); // Switch to the input form tab
  };

  const handleCancelEdit = () => {
    setEditingReportId(null); // Clear the editing state
    setActiveTab("input-report"); // Stay on the input tab, but clear the form
  };

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Added pt-16 */}
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Laporan Harian Karyawan</h1> {/* Adjusted mb */}
      <p className="text-center text-gray-600 mb-8">
        Input dan lihat rekap laporan harian aktivitas karyawan.
      </p>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6"> {/* Adjusted grid-cols for responsiveness */}
          <TabsTrigger value="input-report">Input Laporan</TabsTrigger>
          <TabsTrigger value="list-reports">Daftar Laporan Harian</TabsTrigger>
        </TabsList>

        {/* TabsContent area - Removed the extra div wrapper */}
        <TabsContent value="input-report" className="mt-0"> {/* mt-0 to remove default TabsContent margin */}
          <DailyReportForm
            onReportSubmitted={handleReportSubmitted}
            editingReportId={editingReportId}
            setEditingReportId={setEditingReportId}
            onCancelEdit={handleCancelEdit}
          />
        </TabsContent>

        <TabsContent value="list-reports" className="mt-0"> {/* mt-0 to remove default TabsContent margin */}
          <DailyReportList
            refreshTrigger={refreshList}
            onEditClick={handleEditClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyReportPage;