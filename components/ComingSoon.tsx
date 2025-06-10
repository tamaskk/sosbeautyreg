import React from 'react';

export default function ComingSoon() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center p-8 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Hamarosan Elérhető
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Az oldal jelenleg fejlesztés alatt áll. Kérjük, látogasson vissza később!
        </p>
        <div className="bg-indigo-600 text-white p-4 rounded-lg inline-block">
          <p className="text-lg">
            Várható indulás: 2025. június
          </p>
        </div>
      </div>
    </div>
  );
} 