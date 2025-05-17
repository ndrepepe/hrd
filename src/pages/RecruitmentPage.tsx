"use client";

import React from 'react';
import PositionManager from '@/components/PositionManager'; // Import the new component

const RecruitmentPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Modul Rekrutmen Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola posisi yang dibutuhkan dan data kandidat di sini.
      </p>
      
      <PositionManager /> {/* Add the PositionManager component */}

      {/* TODO: Tambahkan komponen untuk mengelola Kandidat, Wawancara, dan Keputusan */}
    </div>
  );
};

export default RecruitmentPage;