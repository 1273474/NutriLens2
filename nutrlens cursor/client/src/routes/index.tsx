import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from '../pages/UploadPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotFound from '../pages/NotFound';

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<ProfilePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 