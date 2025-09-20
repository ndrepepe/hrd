"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyReportForm from "@/components/DailyReportForm";
import DailyReportList from "@/components/DailyReportList";

const DailyReport = () => {
  const [refreshReportsTrigger, setRefreshReportsTrigger] = useState(0);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  const handleReportSubmitted = () => {
    setRefreshReportsTrigger(prev => prev + 1);
    setEditingReportId(null); // Ensure form resets after submission
  };

  const handleEditClick = (reportId: string) => {
    setEditingReportId(reportId);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manajemen Laporan Harian</h2>
      <Tabs defaultValue="add-report" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-report">Input Laporan</TabsTrigger>
          <TabsTrigger value="report-list">Rekap Laporan</TabsTrigger>
        </TabsList>
        <TabsContent value="add-report" className="mt-4">
          <DailyReportForm
            refreshReportsTrigger={refreshReportsTrigger}
            onReportSubmitted={handleReportSubmitted}
            editingReportId={editingReportId}
            setEditingReportId={setEditingReportId}
          />
        </TabsContent>
        <TabsContent value="report-list" className="mt-4">
          <DailyReportList
            refreshTrigger={refreshReportsTrigger}
            onEditClick={handleEditClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyReport;