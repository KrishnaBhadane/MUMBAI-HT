import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EligibilityCalculatorModal from './EligibilityCalculatorModal';
import { ShieldCheck, UserCheck, Briefcase, Menu, X, ArrowRight, ExternalLink, Calculator, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { currentRole, currentUser, logout, applications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const isCustomer = currentRole === 'applicant';
  const isStaff = currentRole === 'bank_admin';
  const pendingUnderwriterCount = applications.filter(a => a.status === 'under_review').length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white flex items-center justify-center font-display font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-105 transition-all">
                N
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-white leading-tight tracking-tight">
                  NIRNAY
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                  Mortgage Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/' 
                    ? 'text-orange-400 font-semibold bg-white/[0.05] border border-orange-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                Overview
              </Link>

              {currentUser && (
                isStaff ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        location.pathname === '/admin/dashboard' 
                          ? 'text-orange-400 font-semibold bg-white/[0.05] border border-orange-500/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      Underwriting Queue
                      {pendingUnderwriterCount > 0 && (
                        <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                          {pendingUnderwriterCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/applications"
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        location.pathname === '/admin/applications' 
                          ? 'text-orange-400 font-semibold bg-white/[0.05] border border-orange-500/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      All Dossiers
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/customer/dashboard"
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        location.pathname === '/customer/dashboard' 
                          ? 'text-orange-400 font-semibold bg-white/[0.05] border border-orange-500/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/customer/apply"
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        location.pathname === '/customer/apply' 
                          ? 'text-orange-400 font-semibold bg-white/[0.05] border border-orange-500/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      New Loan Application
                    </Link>
                  </>
                )
              )}
            </nav>
          </div>

          {/* User profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white backdrop-blur-md bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] transition-all shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5 text-orange-400" />
              <span>EMI Calculator</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.1]">
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-zinc-400">
                    {currentUser.designation || (isStaff ? 'Credit Underwriter' : 'Mortgage Applicant')}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  {currentUser.avatarInitials || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 border border-white/[0.1] hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-orange inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-2xl px-4 pt-3 pb-4 space-y-2 text-white">
          {currentUser ? (
            <div className="text-xs font-medium text-zinc-400 pb-2 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                Logged in: <strong className="text-white">{currentUser.name}</strong> ({isStaff ? 'Staff' : 'Borrower'})
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-orange-400 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/[0.08]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold border border-white/[0.1] rounded-xl text-zinc-300 hover:bg-white/[0.05]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-orange text-center py-2 text-xs rounded-xl font-bold"
              >
                Apply Now
              </Link>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/[0.05]"
            >
              Overview
            </Link>
            {currentUser && isStaff && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/[0.05]"
                >
                  Underwriting Queue ({pendingUnderwriterCount})
                </Link>
                <Link
                  to="/admin/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/[0.05]"
                >
                  All Applications
                </Link>
              </>
            )}
            {currentUser && !isStaff && (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/[0.05]"
                >
                  My Applications
                </Link>
                <Link
                  to="/customer/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/[0.05]"
                >
                  New Application
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Eligibility Calculator Modal */}
      <EligibilityCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />
    </header>
  );
}
