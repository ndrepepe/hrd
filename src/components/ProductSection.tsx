"use client";

import React from 'react';

const ProductSection = () => {
  const products = [
    {
      name: "Ayam Rempah PepeNio",
      description: "Ayam goreng dengan bumbu rempah pilihan, renyah di luar, juicy di dalam.",
      image: "https://via.placeholder.com/400x300?text=Ayam+Rempah", // Placeholder image
    },
    {
      name: "Ayam Bacem PepeNio",
      description: "Ayam ungkep manis gurih dengan bumbu bacem khas, empuk dan meresap.",
      image: "https://via.placeholder.com/400x300?text=Ayam+Bacem", // Placeholder image
    },
  ];

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Produk Kami</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <img src={product.image} alt={product.name} className="w-full max-w-sm rounded-lg shadow-md mb-4" />
            <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSection;