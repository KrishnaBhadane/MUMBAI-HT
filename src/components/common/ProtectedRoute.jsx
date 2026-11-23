import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Guard
 * 
 * Enforces client-side navigation security:
 * 1. Checks if the user session is authenticated.
 * 2. Checks if staff privileges are required (underwriter / reviewer / super_admin).
 * 
 * NOTE: This frontend guard improves user experience and interface separation.
 * The TRUE security and authorization boundary remains strictly enforced by 
 * PostgreSQL Row Level Security (RLS) policies at the database layer.
 */
export default function ProtectedRoute({ children, requireStaff = false }) {
  const { session, currentUser, authLoading } = useApp();
  const location = useLocation();

  // 1. Show loading state during session restoration
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-3" />
        <span className="text-xs font-medium">Verifying institutional credentials...</span>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login with return target
  if (!session || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Staff Route Guard: Verify staff designation
  if (requireStaff) {
    const isStaffRole = ['underwriter', 'reviewer', 'super_admin'].includes(currentUser.role);
    if (!isStaffRole) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-6 bg-white border border-red-200 rounded shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Institutional Access Restricted
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              The Underwriting & Credit Risk Workspace requires verified bank staff credentials. 
              Your active account ({currentUser.email}) is registered as a Borrower/Customer.
            </p>
          </div>
          <div className="pt-2">
            <Navigate to="/customer/dashboard" replace />
          </div>
        </div>
      );
    }
  }

  return children;
}

