import React from 'react';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Loader; 