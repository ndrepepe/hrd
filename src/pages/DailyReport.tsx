"use client";

import { useState } from "react";
import DailyReportForm from "@/components/DailyReportForm";
import DailyReportList from "@/components/DailyReportList";

const DailyReport = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  const handleReportSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingReportId(null); // Clear editing state after submission
  };

  const handleEditClick = (reportId: string) => {
    setEditingReportId(reportId);
  };

  const handleCancelEdit = () => {
    setEditingReportId(null); // Clear editing state
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Laporan Harian Karyawan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyReportForm
          onReportSubmitted={handleReportSubmitted}
          editingReportId={editingReportId}
          setEditingReportId={setEditingReportId}
          onCancelEdit={handleCancelEdit}
        />
        <DailyReportList
          refreshTrigger={refreshTrigger}
          onEditClick={handleEditClick}
        />
      </div>
    </div>
  );
};

export default DailyReport;