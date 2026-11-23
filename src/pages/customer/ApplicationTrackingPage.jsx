import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { formatINR } from '../../data/mockData';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, FileText, Upload, ChevronRight, MessageSquare } from 'lucide-react';

export default function ApplicationTrackingPage() {
  const { id } = useParams();
  const { applications } = useApp();

  const app = applications.find(a => a.id === id) || applications[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/customer/applications/${app.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Loan Offer</span>
        </Link>
        <span className="text-xs text-zinc-400 font-mono">{app.id}</span>
      </div>

      {/* Header Banner */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-500">{app.id}</span>
              <StatusBadge status={app.status} />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              Application Milestone Timeline
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Product: <strong className="text-white">{app.loanTypeLabel}</strong> • Requested: {formatINR(app.loanAmountRequested)}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-zinc-400 block">Current Assessment State</span>
            <span className="font-semibold text-white text-sm block mt-0.5">
              {app.status === 'approved' ? 'Formal Sanction Issued' : app.status === 'rejected' ? 'Application Declined' : 'Underwriter Review Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Official Bank Underwriter Remarks Callout */}
      {app.finalDecision?.remarks && (
        <div className="bg-white border-l-4 border-l-brand-blue border border-white/[0.08] rounded p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <MessageSquare className="w-4 h-4" />
            <span>Official Underwriting Communication</span>
          </div>
          <p className="text-xs text-white leading-relaxed">
            "{app.finalDecision.remarks}"
          </p>
          <div className="text-[11px] text-zinc-400 pt-1">
            Sign-off authority: <strong className="text-white">{app.finalDecision.reviewerName}</strong>
          </div>
        </div>
      )}

      {/* Vertical Milestone Timeline */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="font-display font-bold text-base text-white mb-6">
          Lifecycle Progression
        </h2>

        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {app.timeline.map((item, index) => (
            <div key={index} className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-brand-blue flex items-center justify-center flex-shrink-0 z-10">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-display font-semibold text-sm text-white">{item.title}</h4>
                  <span className="text-[11px] font-mono text-zinc-400">{item.date}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Pending Step if under review */}
          {app.status === 'under_review' && (
            <div className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center flex-shrink-0 z-10 animate-pulse">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-display font-semibold text-sm text-white">Final Sanction Letter Issuance</h4>
                  <span className="text-[11px] font-mono text-amber-700 font-medium">In Progress</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The credit underwriting desk is finalizing collateral verification and legal title clearance. You will be notified immediately upon decision sign-off.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Integrity Status Quick List */}
      <div className="glass-card border border-white/[0.08] rounded-2xl shadow-xl p-6 space-y-4">
        <h3 className="font-display font-bold text-sm text-white">
          Attached Document Verifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {app.documents.map((doc) => (
            <div key={doc.id} className="p-3 rounded border border-white/[0.08] bg-brand-bg/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-white truncate max-w-[180px]">{doc.type}</span>
              </div>
              <StatusBadge status={doc.status} type="document" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

