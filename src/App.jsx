import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import LoanApplicationWizard from './pages/customer/LoanApplicationWizard';
import ApplicationDetailsPage from './pages/customer/ApplicationDetailsPage';
import ApplicationTrackingPage from './pages/customer/ApplicationTrackingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplicationWorkspace from './pages/admin/AdminApplicationWorkspace';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-orange-500/30 selection:text-white">
          {/* Luminous Ambient Background Glows (Matching User Reference Visuals) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Top-left deep purple glow */}
            <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px]" />
            {/* Right-center vibrant warm orange glow */}
            <div className="absolute top-1/4 -right-28 w-[600px] h-[600px] bg-orange-500/18 rounded-full blur-[160px]" />
            {/* Center-bottom warm amber glow */}
            <div className="absolute top-2/3 left-1/4 w-[700px] h-[700px] bg-amber-600/12 rounded-full blur-[180px]" />
            {/* Bottom-right subtle accent */}
            <div className="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                {/* Customer Portal (Protected: Authenticated Users) */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/apply"
                  element={
                    <ProtectedRoute>
                      <LoanApplicationWizard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/applications/:id"
                  element={
                    <ProtectedRoute>
                      <ApplicationDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/applications/:id/tracking"
                  element={
                    <ProtectedRoute>
                      <ApplicationTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin / Underwriter Portal (Protected: Staff Only) */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireStaff>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedRoute requireStaff>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications/:id"
                  element={
                    <ProtectedRoute requireStaff>
                      <AdminApplicationWorkspace />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
