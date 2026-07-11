import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import ErrorBoundary from './components/ErrorBoundary';
import { Suspense, lazy } from 'react';

// Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LogToday = lazy(() => import('./pages/LogToday'));
const History = lazy(() => import('./pages/History'));
const Suggestions = lazy(() => import('./pages/Suggestions'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Profile = lazy(() => import('./pages/Profile'));

const AppContent = () => {
  const { authLoading, user } = useApp();

  // Full screen loading indicator during auth listener state checks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <span className="mt-4 font-outfit text-slate-400 text-sm tracking-wide">Connecting to EcoTrack...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-transparent text-slate-100 pb-12">
        {user && <Navbar />}
        <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${user ? 'mt-8' : 'mt-0'}`}>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex justify-center items-center p-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
            {/* Direct logged in users away from login */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            {/* Authenticated routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/log-today" element={
              <ProtectedRoute>
                <LogToday />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/suggestions" element={
              <ProtectedRoute>
                <Suggestions />
              </ProtectedRoute>
            } />
            
            <Route path="/achievements" element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Toast />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
