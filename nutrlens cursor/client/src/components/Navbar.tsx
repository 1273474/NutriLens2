import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <nav className="w-full bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-emerald-600">▨</span>
        <Link to="/" className="font-bold text-lg tracking-tight text-gray-900">NutriLens</Link>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <Link to="/" className={`hover:text-emerald-500 ${pathname === '/' ? 'text-emerald-600 font-semibold' : ''}`}>Home</Link>
        <Link to="/features" className="hover:text-emerald-500">Features</Link>
        <Link to="/about" className="hover:text-emerald-500">About</Link>
        <Link to="/upload" className="ml-4 bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-emerald-600 transition">Get Started</Link>
      </div>
      <div className="md:hidden">
        {/* TODO: Mobile menu button */}
      </div>
    </nav>
  );
};

export default Navbar; 