import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { calculateEMI, calculateFOIR, calculateLTV, formatINR } from '../../data/mockData';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, ChevronRight, Sliders, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const { applications } = useApp();

  const app = applications.find(a => a.id === id) || applications[0];

  // Interactive slider state within eligible limits
  const [interactiveAmount, setInteractiveAmount] = useState(app.loanAmountRequested);
  const [interactiveTenure, setInteractiveTenure] = useState(app.tenureMonthsRequested);

  const interestRate = app.benchmarkRate || 8.50;
  const currentEMI = calculateEMI(interactiveAmount, interestRate, interactiveTenure);
  const currentFOIR = calculateFOIR(app.existingMonthlyObligations, currentEMI, app.netMonthlyIncome);
  const currentLTV = calculateLTV(interactiveAmount, app.estimatedMarketValue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/customer/applications/${app.id}/tracking`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold btn-orange font-bold text-white hover:bg-brand-blue-hover transition-colors"
          >
            <span>View Timeline & Bank Notes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-500">{app.id}</span>
              <StatusBadge status={app.status} />
              <span className="text-xs text-zinc-400">
                Submitted on {new Date(app.submissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white mt-1">
              {app.loanTypeLabel} Assessment
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Applicant: <strong className="text-white">{app.applicantName}</strong> • Collateral: {app.propertyAddress}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-zinc-400 block">Maximum Eligible Limit</span>
            <span className="font-display font-bold text-2xl text-orange-400 block">
              {formatINR(app.maxEligibleLoanAmount)}
            </span>
            <span className="text-[11px] text-zinc-400">Based on net cashflow & 55% FOIR limit</span>
          </div>
        </div>

        {/* Core Financial Ratios Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-zinc-400 block">Calculated FOIR</span>
            <span className={`font-display font-bold text-base mt-0.5 block ${currentFOIR <= 55 ? 'text-white' : 'text-amber-700'}`}>
              {currentFOIR}% <span className="text-[11px] font-normal text-zinc-400">(Max 55%)</span>
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block">Calculated LTV</span>
            <span className={`font-display font-bold text-base mt-0.5 block ${currentLTV <= 80 ? 'text-white' : 'text-red-700'}`}>
              {currentLTV}% <span className="text-[11px] font-normal text-zinc-400">(Max 80%)</span>
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block">Estimated Monthly EMI</span>
            <span className="font-display font-bold text-base text-white mt-0.5 block">
              {formatINR(currentEMI)} / mo
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block">Assumed Benchmark Rate</span>
            <span className="font-display font-bold text-base text-white mt-0.5 block">
              {interestRate}% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Loan Customizer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6 space-y-6">
          <div>
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>Customize Preferred Loan Terms</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Adjust your requested loan amount and tenure within your maximum eligible capacity.
            </p>
          </div>

          <div className="space-y-5">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-white">Preferred Loan Amount</span>
                <span className="font-display font-bold text-sm text-orange-400">{formatINR(interactiveAmount)}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={app.maxEligibleLoanAmount || 6000000}
                step={50000}
                value={interactiveAmount}
                onChange={(e) => setInteractiveAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>Min: ₹10,00,000</span>
                <span>Max Eligible: {formatINR(app.maxEligibleLoanAmount)}</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-white">Preferred Tenure</span>
                <span className="font-display font-bold text-sm text-orange-400">
                  {Math.round(interactiveTenure / 12)} Years ({interactiveTenure} Months)
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={360}
                step={12}
                value={interactiveTenure}
                onChange={(e) => setInteractiveTenure(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>Min: 5 Years</span>
                <span>Max: 30 Years</span>
              </div>
            </div>
          </div>

          {/* Impact Breakdown Table */}
          <div className="pt-4 border-t border-white/[0.08]">
            <h4 className="font-semibold text-xs text-white mb-2">Preliminary Financial Impact</h4>
            <div className="grid grid-cols-3 gap-3 text-xs bg-brand-bg p-3 rounded border border-white/[0.08]">
              <div>
                <span className="text-zinc-400 block">Estimated EMI</span>
                <strong className="text-white text-sm">{formatINR(currentEMI)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block">Projected FOIR</span>
                <strong className={currentFOIR <= 55 ? 'text-emerald-700' : 'text-amber-700'}>{currentFOIR}%</strong>
              </div>
              <div>
                <span className="text-zinc-400 block">Collateral LTV</span>
                <strong className={currentLTV <= 80 ? 'text-emerald-700' : 'text-red-700'}>{currentLTV}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Underwriter Routing Card */}
        <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-sm text-white">Preliminary Underwriting Notice</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This estimate is generated dynamically by NIRNAY’s credit policy algorithms using the financial details and documents provided.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Official final sanction terms, applicable APR, and processing fees are formally executed upon underwriter sign-off and title clearance.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.08]">
            <Link
              to={`/customer/applications/${app.id}/tracking`}
              className="w-full py-2 px-3 rounded text-xs font-semibold btn-orange font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.45)] flex items-center justify-center gap-1.5"
            >
              <span>Track Underwriter Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Document Verification Dossier */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              Uploaded Document Verification Dossier
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Individual OCR verification statuses and integrity audit notes.
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            {app.documents.length} Submitted Documents
          </span>
        </div>

        <div className="divide-y divide-brand-borderSubtle">
          {app.documents.map((doc) => (
            <div key={doc.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{doc.type}</div>
                  <div className="text-zinc-400 mt-0.5">{doc.fileName}</div>
                  {doc.remarks && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      Underwriter Note: {doc.remarks}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <StatusBadge status={doc.status} type="document" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

