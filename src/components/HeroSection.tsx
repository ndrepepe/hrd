"use client";

import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] bg-cover bg-center flex items-center justify-center text-white"
             style={{ backgroundImage: "url('https://via.placeholder.com/1920x1080?text=Hero+Image')" }}> {/* Placeholder background image */}
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay for better text readability */}
      <div className="relative z-10 text-center p-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">PepeNio</h1>
        <p className="text-xl md:text-2xl">Ayam Rempah & Ayam Bacem Lezat Siap Saji</p>
      </div>
    </section>
  );
};

export default HeroSection;