import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, outcome, confirmText = 'Confirm Decision' }) {
  if (!isOpen) return null;

  const isApprove = outcome === 'APPROVE';
  const isReject = outcome === 'REJECT';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl border border-white/[0.08] shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isApprove ? 'bg-emerald-100 text-emerald-700' : isReject ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isApprove ? <CheckCircle2 className="w-5 h-5" /> : isReject ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">{title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Underwriting Action Confirmation</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 text-xs text-zinc-400 leading-relaxed">
            {message}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-1.5 rounded text-xs font-semibold text-white transition-colors shadow-sm ${
                isApprove ? 'bg-emerald-700 hover:bg-emerald-800' : isReject ? 'bg-red-700 hover:bg-red-800' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

