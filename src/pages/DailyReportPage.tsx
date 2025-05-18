"use client";

import React, { useState } from 'react';
import DailyReportForm from '@/components/DailyReportForm';
import DailyReportList from '@/components/DailyReportList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

const DailyReportPage = () => {
  const [refreshList, setRefreshList] = useState(0);
  const [activeTab, setActiveTab] = useState("input-report"); // State to manage active tab, default to input form
  const [editingReportId, setEditingReportId] = useState<string | null>(null); // State to track which report is being edited

  const handleReportSubmitted = () => {
    // Increment state to trigger refresh in DailyReportList
    setRefreshList(prev => prev + 1);
    // Clear editing state after submission (add or edit)
    setEditingReportId(null);
    // Optionally switch to list view after submission
    // setActiveTab("list-reports"); // Keep user on the form tab after edit for easier subsequent edits if needed
  };

  // New callback to handle edit button click from the list
  const handleEditClick = (reportId: string) => {
    setEditingReportId(reportId); // Set the ID of the report to edit
    setActiveTab("input-report"); // Switch to the input form tab
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 lg:grid-cols-2 mb-6"> {/* Added mb-6 for spacing below tabs */}
          <TabsTrigger value="input-report">{editingReportId ? "Edit Laporan" : "Input Laporan"}</TabsTrigger> {/* Change tab title based on editing state */}
          <TabsTrigger value="list-reports">Daftar Laporan Harian</TabsTrigger>
        </TabsList>

        {/* TabsContent area - Removed the extra div wrapper */}
        {/* <div> */}
          <TabsContent value="input-report" className="mt-0"> {/* mt-0 to remove default TabsContent margin */}
            <DailyReportForm
              onReportSubmitted={handleReportSubmitted}
              editingReportId={editingReportId} // Pass editing state
              setEditingReportId={setEditingReportId} // Pass setter function
            />
          </TabsContent>

          <TabsContent value="list-reports" className="mt-0"> {/* mt-0 to remove default TabsContent margin */}
            <DailyReportList
              refreshTrigger={refreshList}
              onEditClick={handleEditClick} // Pass the edit handler down
            />
          </TabsContent>
        {/* </div> */}
      </Tabs>
    </div>
  );
};

export default DailyReportPage;