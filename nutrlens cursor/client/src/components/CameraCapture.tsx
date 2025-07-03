import React from 'react';

const CameraCapture: React.FC = () => {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-300 p-6 flex flex-col items-center justify-center bg-white">
      <span className="text-4xl mb-2">📷</span>
      <p className="mb-2 text-gray-600">Camera capture coming soon...</p>
      <button className="bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-emerald-600 transition" disabled>Open Camera</button>
    </div>
  );
};

export default CameraCapture; 