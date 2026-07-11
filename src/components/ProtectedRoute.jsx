import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <span className="mt-4 font-outfit text-slate-500 text-xs tracking-wider">Checking credentials...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user object is not present
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
