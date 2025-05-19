"use client";

import React from 'react';

const ContactSection = () => {
  return (
    <section className="container mx-auto py-12 px-4 text-center">
      <h2 className="text-3xl font-bold mb-8">Hubungi Kami</h2>
      <div className="text-gray-700 space-y-2">
        <p>Untuk pemesanan dan informasi lebih lanjut:</p>
        <p>Email: <a href="mailto:info@pepenio.com" className="text-blue-600 hover:underline">info@pepenio.com</a></p> {/* Placeholder email */}
        <p>Telepon/WhatsApp: <a href="tel:+6281234567890" className="text-blue-600 hover:underline">+62 812 3456 7890</a></p> {/* Placeholder phone */}
        {/* Add social media links if available */}
        <p>Ikuti kami di media sosial!</p>
        {/* Placeholder social links */}
        <div className="flex justify-center space-x-4 mt-4">
            {/* Replace with actual social media icons/links */}
            <a href="#" className="text-blue-600 hover:text-blue-800">Facebook</a>
            <a href="#" className="text-pink-600 hover:text-pink-800">Instagram</a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;