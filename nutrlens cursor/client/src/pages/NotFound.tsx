import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-8 text-gray-600">The page you are looking for does not exist or has been moved.</p>
      <button
        className="bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-emerald-600 transition"
        onClick={() => navigate('/')}
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFound; 