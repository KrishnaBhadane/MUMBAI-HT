import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { formatINR } from '../../data/mockData';
import { ArrowRight, FilePlus, Clock, CheckCircle2, AlertTriangle, ChevronRight, FileText, TrendingUp, Activity, BarChart2 } from 'lucide-react';

export default function CustomerDashboard() {
  const { applications, currentUser } = useApp();

  // Filter applications that belong to the logged-in customer or general test cases
  const customerApps = applications;

  const activeApp = customerApps.find(a => a.status === 'under_review' || a.status === 'processing' || a.status === 'submitted') || customerApps[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
            Applicant Workspace
          </span>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track your mortgage underwriting progress, verify uploaded documents, and review loan sanction letters.
          </p>
        </div>

        <Link
          to="/customer/apply"
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold btn-orange font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.45)] self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>Apply for New Loan</span>
        </Link>
      </div>

      {/* Active Application Highlight Banner */}
      {activeApp && (
        <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">{activeApp.id}</span>
                <StatusBadge status={activeApp.status} />
                <span className="text-xs text-zinc-400">• Submitted on {new Date(activeApp.submissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <h2 className="font-display font-bold text-xl text-white">
                {activeApp.loanTypeLabel}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/customer/applications/${activeApp.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
              >
                <span>View Offer & Ratios</span>
              </Link>
              <Link
                to={`/customer/applications/${activeApp.id}/tracking`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover transition-colors"
              >
                <span>Track Progress</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
            <div>
              <span className="text-zinc-400 block">Requested Amount</span>
              <span className="font-display font-bold text-base text-white mt-0.5 block">
                {formatINR(activeApp.loanAmountRequested)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Estimated EMI</span>
              <span className="font-display font-bold text-base text-white mt-0.5 block">
                {formatINR(activeApp.estimatedMonthlyEMI)} / mo
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Max Permissible FOIR</span>
              <span className="font-display font-bold text-base text-white mt-0.5 block">
                {activeApp.calculatedFOIR}% <span className="text-[11px] font-normal text-zinc-400">(Limit 55%)</span>
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Documents Verified</span>
              <span className="font-display font-bold text-base text-emerald-700 mt-0.5 block">
                {activeApp.documents.filter(d => d.status === 'verified').length} of {activeApp.documents.length} verified
              </span>
            </div>
          </div>
        </div>
      )}

      
      {/* Stock-Style Loan Equity & Amortisation Projection Graph */}
      <div className="glass-card border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                AMORTISATION TRAJECTORY
              </span>
              <span className="text-xs text-zinc-400 font-medium">Principal Payoff & Equity Accrual</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="font-display font-bold text-2xl text-white">₹35.00 Lakhs Loan Capital</span>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                8.50% Fixed Benchmark
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-zinc-400 block text-[10px]">Monthly EMI</span>
              <span className="text-white font-bold">₹30,374 / mo</span>
            </div>
            <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-zinc-400 block text-[10px]">Total Tenure</span>
              <span className="text-orange-400 font-bold">240 Months</span>
            </div>
          </div>
        </div>

        {/* Amortisation Area Curve SVG */}
        <div className="mt-5">
          <svg viewBox="0 0 700 130" className="w-full h-32 sm:h-36 overflow-visible">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Principal Equity Curve (Green) */}
            <path
              d="M10,120 Q200,105 350,75 T550,30 L690,10 L690,130 L10,130 Z"
              fill="url(#equityGrad)"
            />
            <path
              d="M10,120 Q200,105 350,75 T550,30 L690,10"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Loan Balance Runoff Curve (Orange) */}
            <path
              d="M10,10 Q200,35 350,65 T550,100 L690,120 L690,130 L10,130 Z"
              fill="url(#balanceGrad)"
            />
            <path
              d="M10,10 Q200,35 350,65 T550,100 L690,120"
              fill="none"
              stroke="#ff7a00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="350" cy="65" r="4.5" fill="#ffffff" stroke="#ff7a00" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">Net Equity Accumulation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-zinc-300">Remaining Loan Balance</span>
            </span>
          </div>
          <span>Crossover Point: Month 118</span>
        </div>
      </div>


      {/* Structured Applications Table */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-white">
            Application History
          </h3>
          <span className="text-xs text-zinc-400">
            {customerApps.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-200 font-semibold">
              <tr>
                <th className="px-6 py-3">Reference No.</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Requested Loan</th>
                <th className="px-6 py-3">Collateral Valuation</th>
                <th className="px-6 py-3">Calculated LTV</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderSubtle">
              {customerApps.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.03]/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-medium text-white">
                    {app.id}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-white">
                    {app.loanTypeLabel}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-white">
                    {formatINR(app.loanAmountRequested)}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-400">
                    {formatINR(app.estimatedMarketValue)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-white">{app.calculatedLTV}%</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right space-x-2">
                    <Link
                      to={`/customer/applications/${app.id}`}
                      className="text-orange-400 hover:underline font-semibold"
                    >
                      Offer
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link
                      to={`/customer/applications/${app.id}/tracking`}
                      className="text-zinc-400 hover:text-white font-medium"
                    >
                      Timeline
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful Underwriting Guidance Note */}
      <div className="bg-brand-bg border border-white/[0.08] rounded p-4 text-xs text-zinc-400 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">How NIRNAY assesses your loan:</strong> Upon submitting your application and uploading mandatory income and property records, our underwriting engine cross-checks KYC with DigiLocker, pulls credit bureau data, verifies FOIR & LTV against statutory guidelines, and alerts human underwriters if an exception requires review.
        </div>
      </div>
    </div>
  );
}

