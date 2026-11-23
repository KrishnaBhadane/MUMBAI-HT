import React, { useState } from 'react';
import { calculateEMI, calculateFOIR, formatINR } from '../../data/mockData';
import { X, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EligibilityCalculatorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [loanType, setLoanType] = useState('home_loan'); // 'home_loan' | 'lap'
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [existingEMIs, setExistingEMIs] = useState(15000);
  const [desiredLoan, setDesiredLoan] = useState(4500000);
  const [tenureYears, setTenureYears] = useState(20);

  const interestRate = loanType === 'home_loan' ? 8.50 : 10.25;
  const tenureMonths = tenureYears * 12;
  const estimatedEMI = calculateEMI(desiredLoan, interestRate, tenureMonths);
  const calculatedFOIR = calculateFOIR(existingEMIs, estimatedEMI, monthlyIncome);
  const maxAffordableEMI = Math.max(0, monthlyIncome * 0.55 - existingEMIs);
  const maxEligibleLoan = Math.round(maxAffordableEMI * 105);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Mortgage Eligibility &amp; EMI Estimator
              </h3>
              <p className="text-xs text-zinc-400">
                Modeled on Hero Housing Finance lending benchmarks &amp; NHB guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Loan Product Toggle */}
          <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setLoanType('home_loan')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                loanType === 'home_loan'
                  ? 'btn-orange shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home Loan (8.50% p.a.)
            </button>
            <button
              type="button"
              onClick={() => setLoanType('lap')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                loanType === 'lap'
                  ? 'btn-orange shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Loan Against Property (10.25% p.a.)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Net Monthly In-Hand Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">₹</span>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                  className="glass-input w-full pl-8 pr-3 py-2.5 rounded-xl text-white font-medium"
                  step="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Existing Monthly EMI Obligations
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">₹</span>
                <input
                  type="number"
                  value={existingEMIs}
                  onChange={(e) => setExistingEMIs(Number(e.target.value) || 0)}
                  className="glass-input w-full pl-8 pr-3 py-2.5 rounded-xl text-white font-medium"
                  step="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Desired Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">₹</span>
                <input
                  type="number"
                  value={desiredLoan}
                  onChange={(e) => setDesiredLoan(Number(e.target.value) || 0)}
                  className="glass-input w-full pl-8 pr-3 py-2.5 rounded-xl text-white font-medium"
                  step="100000"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Tenure: <span className="text-orange-400 font-bold">{tenureYears} Years</span> ({tenureMonths} Months)
              </label>
              <input
                type="range"
                min="5"
                max={loanType === 'home_loan' ? 30 : 15}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full mt-3 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-zinc-400 block text-[11px]">Monthly EMI</span>
                <span className="font-display font-bold text-xl text-white block mt-0.5">
                  {formatINR(estimatedEMI)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Resulting FOIR</span>
                <span className={`font-display font-bold text-xl block mt-0.5 ${
                  calculatedFOIR <= 55 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {calculatedFOIR}%
                </span>
                <span className="text-[10px] text-zinc-500">Cap: 55%</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-zinc-400 block text-[11px]">Max Loan Capacity</span>
                <span className="font-display font-bold text-xl text-orange-400 block mt-0.5">
                  {formatINR(maxEligibleLoan)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory 55% FOIR Buffer Enforced</span>
              </span>
              <span className="font-mono text-zinc-400">
                Interest: {interestRate}% p.a.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <a
            href="/customer/apply"
            className="btn-orange inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            <span>Proceed to Apply</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}
