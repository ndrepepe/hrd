"use client";

import React, { useState } from 'react';
import DailyReportForm from '@/components/DailyReportForm';
import DailyReportList from '@/components/DailyReportList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { BarChart3 } from "lucide-react";

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
    <div className="app-shell">
      <div className="app-container">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="page-kicker">Aktivitas Karyawan</p>
              <h1 className="page-title">Modul Laporan Harian Karyawan</h1>
            </div>
          </div>
          <p className="page-description">
            Input dan lihat rekap laporan harian aktivitas karyawan.
          </p>
        </div>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2"> {/* Use 2 columns on all screen sizes */}
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
    </div>
  );
};

export default DailyReportPage;
