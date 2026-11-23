import React from 'react';
import { Shield, Lock, FileCheck2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-black/70 border-t border-white/[0.08] text-xs text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-display font-bold text-base">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.5)]">N</span>
              <span>NIRNAY Underwriting Intelligence</span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-md text-xs">
              Digitally automated mortgage underwriting engine built for Hero Housing Finance’s Housing Fintech Challenge.
              Calculates FOIR, LTV, credit risk probability, and verifies documents with explainable credit governance.
            </p>

          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Supported Products</h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="hover:text-orange-400 transition-colors">Home Loans (Purchase & Construction)</li>
              <li className="hover:text-orange-400 transition-colors">Loan Against Property (LAP)</li>
              <li className="hover:text-orange-400 transition-colors">Refinance & Balance Transfer</li>
              <li className="hover:text-orange-400 transition-colors">Top-up Mortgage Lines</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Regulatory & Security</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 glass-card p-2.5 rounded-xl border border-white/[0.06]">
                <Shield className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight text-zinc-300">NHB Master Directions 2021 Compliant</span>
              </div>
              <div className="flex items-start gap-2 glass-card p-2.5 rounded-xl border border-white/[0.06]">
                <Lock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight text-zinc-300">DPDP Act 2023 Digital Consent Enforced</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} Hero Housing Finance Limited &bull; NIRNAY Automated Mortgage Engine. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Credit Policy Governance</span>
            <span>&bull;</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Statutory Ratios</span>
            <span>&bull;</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Audit Logs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
