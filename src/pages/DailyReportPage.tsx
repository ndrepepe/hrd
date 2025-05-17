"use client";

import React, { useState } from 'react';
import DailyReportForm from '@/components/DailyReportForm';
import DailyReportList from '@/components/DailyReportList';

const DailyReportPage = () => {
  const [refreshList, setRefreshList] = useState(0);

  const handleReportSubmitted = () => {
    // Increment state to trigger refresh in DailyReportList
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 pt-16"> {/* Added pt-16 */}
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Laporan Harian Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Input dan lihat rekap laporan harian aktivitas karyawan.
      </p>

      <DailyReportForm onReportSubmitted={handleReportSubmitted} />

      <div className="mt-10">
        <DailyReportList refreshTrigger={refreshList} />
      </div>
    </div>
  );
};

export default DailyReportPage;