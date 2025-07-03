import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-sans bg-gray-50 min-h-screen">
        <Navbar />
        <AppRoutes />
        <Toast />
      </div>
    </QueryClientProvider>
  );
};

export default App; 