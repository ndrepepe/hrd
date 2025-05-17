"use client";

import React from 'react';
import PositionManager from '@/components/PositionManager';
import CandidateManager from '@/components/CandidateManager'; // Import the new component

const RecruitmentPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Rekrutmen Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola posisi yang dibutuhkan dan data kandidat di sini.
      </p>

      <PositionManager />

      <div className="mt-10"> {/* Add some margin between sections */}
        <CandidateManager /> {/* Add the CandidateManager component */}
      </div>

      {/* TODO: Tambahkan komponen untuk mengelola Wawancara dan Keputusan */}
    </div>
  );
};

export default RecruitmentPage;