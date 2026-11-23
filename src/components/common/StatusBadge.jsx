import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';

export default function StatusBadge({ status, type = 'application' }) {
  // Application statuses with dark glassmorphic styling
  const appStyles = {
    draft: { bg: 'bg-white/[0.06]', text: 'text-zinc-300', border: 'border-white/[0.12]', icon: FileText, label: 'Draft' },
    submitted: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', icon: Clock, label: 'Submitted' },
    processing: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', icon: Clock, label: 'Processing' },
    documents_required: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', icon: AlertTriangle, label: 'Docs Required' },
    under_review: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', icon: Clock, label: 'Under Review' },
    approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', icon: CheckCircle2, label: 'Sanctioned' },
    rejected: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30', icon: XCircle, label: 'Declined' },
  };

  // Document verification statuses
  const docStyles = {
    pending: { bg: 'bg-white/[0.06]', text: 'text-zinc-300', border: 'border-white/[0.12]', icon: Clock, label: 'Pending' },
    uploaded: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', icon: FileText, label: 'Uploaded' },
    verified: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', icon: CheckCircle2, label: 'Verified' },
    manual_review: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', icon: AlertTriangle, label: 'Manual Review' },
    failed: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30', icon: XCircle, label: 'Failed' },
  };

  // Risk tiers
  const riskStyles = {
    low: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', icon: CheckCircle2, label: 'Low Risk' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', icon: AlertTriangle, label: 'Moderate Risk' },
    high: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30', icon: XCircle, label: 'High Risk' },
  };

  const map = type === 'risk' ? riskStyles : type === 'document' ? docStyles : appStyles;
  const cfg = map[status] || { bg: 'bg-white/[0.06]', text: 'text-zinc-300', border: 'border-white/[0.12]', icon: Clock, label: status };
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}
