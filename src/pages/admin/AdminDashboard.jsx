import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { formatINR } from '../../data/mockData';
import {
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ArrowUpDown,
  Download,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const { applications, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const initialFilter = searchParams.get('filter') || 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialFilter === 'refer' ? 'under_review' : 'all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Summary Metrics
  const totalApps = applications.length;
  const pendingReview = applications.filter(a => a.status === 'under_review').length;
  const fraudFlagged = applications.filter(a => a.fraudAlerts && a.fraudAlerts.length > 0).length;
  const sanctioned = applications.filter(a => a.status === 'approved').length;

  // Filtered & Sorted applications
  const filteredApps = applications
    .filter((app) => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.panNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProduct = productFilter === 'all' || app.loanType === productFilter;
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || app.riskCategory === riskFilter;

      return matchesSearch && matchesProduct && matchesStatus && matchesRisk;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'submissionDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Linear-style Collapsible Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Underwriting Workplace Area */}
      <div className="flex-1 overflow-x-hidden p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Workspace Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/30">
                Hero Housing Underwriting Desk
              </span>
              <span className="text-xs text-zinc-400">
                &bull; {currentUser.designation || 'Senior Credit Underwriter'}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white mt-2">
              Active Mortgage Dossier Queue
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review algorithmic assessment outcomes, inspect OCR verifications, and sign off credit decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-pill border border-white/[0.1] text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NHB &amp; RBI Lending Policy Aligned</span>
            </span>
          </div>
        </div>

        {/* High-Impact KPI Tiles with Real-Time Stock Sparklines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Total Dossiers</span>
              <FileSpreadsheet className="w-4 h-4 text-orange-400" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              {totalApps}
            </div>
            <span className="text-[11px] text-zinc-500 mt-0.5 block">Total ingested cases</span>
            {/* Stock Sparkline */}
            <svg viewBox="0 0 100 24" className="w-full h-5 mt-2.5 overflow-visible">
              <path d="M0,18 Q20,12 45,17 T75,8 T100,3" fill="none" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-amber-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Pending Review (REFER)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-amber-400 mt-1">
              {pendingReview}
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Awaiting underwriter sign-off</span>
            {/* Stock Sparkline */}
            <svg viewBox="0 0 100 24" className="w-full h-5 mt-2.5 overflow-visible">
              <path d="M0,14 Q25,22 50,12 T80,16 T100,6" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-red-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-red-400 font-semibold">
              <span>Anomalies Flagged</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-red-400 mt-1">
              {fraudFlagged}
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Income or title alerts</span>
            {/* Stock Sparkline */}
            <svg viewBox="0 0 100 24" className="w-full h-5 mt-2.5 overflow-visible">
              <path d="M0,20 Q30,22 55,6 T85,16 T100,10" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Sanctioned Volume</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-emerald-400 mt-1">
              {sanctioned}
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Approved with terms</span>
            {/* Stock Sparkline */}
            <svg viewBox="0 0 100 24" className="w-full h-5 mt-2.5 overflow-visible">
              <path d="M0,22 Q30,16 60,8 T100,2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Real-Time Pipeline Velocity & Capital Allocation Graph */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.08] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                  REAL-TIME PIPELINE FLOW
                </span>
                <span className="text-xs text-zinc-400 font-medium">Underwriting Throughput Velocity</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="font-display font-bold text-2xl sm:text-3xl text-white">₹48.60 Cr</span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ▲ +24.8% Throughput Velocity
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono">
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400 block text-[10px]">Avg Decision Latency</span>
                <span className="text-white font-bold">142 ms (STP)</span>
              </div>
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400 block text-[10px]">Prime Pass Ratio</span>
                <span className="text-emerald-400 font-bold">92.4%</span>
              </div>
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400 block text-[10px]">Active Dossiers</span>
                <span className="text-orange-400 font-bold">4 Ingested</span>
              </div>
            </div>
          </div>

          {/* Area Graph SVG with Volume Bars */}
          <div className="mt-4">
            <svg viewBox="0 0 700 130" className="w-full h-32 sm:h-36 overflow-visible">
              <defs>
                <linearGradient id="adminFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Background volume bars */}
              {[45, 70, 35, 90, 55, 95, 80, 115, 90, 125, 100, 135, 120, 145].map((h, i) => (
                <rect key={i} x={i * 48 + 15} y={130 - h * 0.28} width="10" height={h * 0.28} fill="rgba(255,255,255,0.06)" rx="2" />
              ))}
              {/* Shaded Area Curve */}
              <path
                d="M15,100 Q85,65 170,80 T330,45 T480,55 T630,22 L680,16 L680,130 L15,130 Z"
                fill="url(#adminFlowGrad)"
              />
              {/* Glowing Line */}
              <path
                d="M15,100 Q85,65 170,80 T330,45 T480,55 T630,22 L680,16"
                fill="none"
                stroke="#ff7a00"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
              <circle cx="680" cy="16" r="5" fill="#ffffff" stroke="#ff7a00" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Search & Multi-Filter Control Toolbar */}
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border border-white/[0.08]">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by applicant, ID, or PAN..."
              className="glass-input w-full text-xs pl-10 pr-3 py-2.5 rounded-xl placeholder-zinc-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-white font-medium"
            >
              <option value="all">All Products</option>
              <option value="home_loan">Home Loan</option>
              <option value="lap">Loan Against Property</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="under_review">Under Review (REFER)</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-white font-medium"
            >
              <option value="all">All Risk Tiers</option>
              <option value="low">Low Risk</option>
              <option value="medium">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        {/* High-Density Pipeline Table (Dark Glassmorphism) */}
        <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-display font-bold text-sm text-white">
              Application Registry
            </h2>
            <span className="text-xs text-zinc-400">
              Displaying {filteredApps.length} of {applications.length} loan dossiers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/[0.08] text-zinc-300 font-semibold select-none text-[11px] uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => toggleSort('id')}
                    className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Dossier Reference</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('applicantName')}
                    className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Applicant Profile</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Product</th>
                  <th
                    onClick={() => toggleSort('loanAmountRequested')}
                    className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Requested Loan</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('calculatedFOIR')}
                    className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>FOIR / LTV Ratios</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('creditBureauScore')}
                    className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>CIBIL &amp; Risk</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-xs text-zinc-500">
                      No loan applications match your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const hasCriticalAlert = app.fraudAlerts?.some(
                      f => f.severity === 'critical' || f.severity === 'high'
                    );

                    return (
                      <tr key={app.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-white">{app.id}</div>
                          <div className="text-[11px] text-zinc-400">
                            {new Date(app.submissionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{app.applicantName}</div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                            {app.employerName}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-medium">
                          {app.loanType === 'home_loan' ? (
                            <span className="text-orange-400 font-semibold">Home Loan</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">LAP</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-display font-semibold text-white">
                            {formatINR(app.loanAmountRequested)}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {Math.round(app.loanTenureMonths / 12)} Yrs ({app.loanTenureMonths} Mos)
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-zinc-400">FOIR:</span>
                            <span className={`font-semibold ${app.calculatedFOIR > 55 ? 'text-red-400 font-bold' : 'text-zinc-200'}`}>
                              {app.calculatedFOIR}%
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-400">LTV:</span>
                            <span className={`font-semibold ${app.calculatedLTV > 80 ? 'text-red-400 font-bold' : 'text-zinc-200'}`}>
                              {app.calculatedLTV}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{app.creditBureauScore}</span>
                            <StatusBadge status={app.riskCategory || "low"} type="risk" />
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={app.status} />
                            {hasCriticalAlert && (
                              <span title="Discrepancy detected" className="text-red-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/admin/applications/${app.id}`}
                            className="btn-orange inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5 text-white" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
