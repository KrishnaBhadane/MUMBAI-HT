import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EligibilityCalculatorModal from '../../components/common/EligibilityCalculatorModal';
import FinancialTicker from '../../components/common/FinancialTicker';
import StockChart from '../../components/common/StockChart';
import MarketDepthWidget from '../../components/common/MarketDepthWidget';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Calculator, 
  FileText, BarChart3, Lock, Award, Landmark, Sparkles, TrendingUp,
  Percent, Check, Shield, Layers, Zap, Activity
} from 'lucide-react';
import { formatINR } from '../../data/mockData';

export default function LandingPage() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Live Financial Market Ticker Ribbon */}
      <FinancialTicker />

      {/* Hero Section: Editorial Dark Glassmorphism with Live Stock Preview */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7">
              {/* Editorial Headline */}
              <h1 className="font-display font-bold text-4xl sm:text-6xl text-white tracking-tight leading-[1.12]">
                Digital Mortgage Underwriting for the Modern Borrower.
              </h1>

              {/* Action Bar: High-contrast Orange CTA + Frosted Glass Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/customer/apply">
                  <button
                    type="button"
                    className="btn-orange inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide"
                  >
                    <span>Start Loan Application</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  className="glass-pill inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold hover:bg-white/[0.1] transition-all shadow-sm cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-orange-400" />
                  <span>Calculate Eligibility</span>
                </button>

                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  <span>Enter Underwriter Desk</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
              </div>

              {/* Live Benchmark Rates Ticker in Frosted Glass with Sparklines */}
              <div className="mt-12 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
                <div className="glass-card p-4 rounded-2xl border border-white/[0.06] relative overflow-hidden">
                  <span className="text-zinc-400 block font-medium">Home Loan Rates</span>
                  <span className="font-display font-bold text-2xl text-white block mt-1">
                    8.50% <span className="text-xs font-normal text-zinc-400">p.a.</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono font-medium">
                    <TrendingUp className="w-3 h-3" /> Statutory LTV up to 80%
                  </span>
                  {/* Miniature SVG Sparkline */}
                  <svg viewBox="0 0 100 25" className="w-full h-6 mt-2 overflow-visible">
                    <path d="M0,20 Q25,12 50,16 T100,4" fill="none" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/[0.06] relative overflow-hidden">
                  <span className="text-zinc-400 block font-medium">Loan Against Property</span>
                  <span className="font-display font-bold text-2xl text-white block mt-1">
                    10.25% <span className="text-xs font-normal text-zinc-400">p.a.</span>
                  </span>
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-mono font-medium">
                    <TrendingUp className="w-3 h-3" /> Collateral LTV up to 60%
                  </span>
                  {/* Miniature SVG Sparkline */}
                  <svg viewBox="0 0 100 25" className="w-full h-6 mt-2 overflow-visible">
                    <path d="M0,18 Q30,22 60,10 T100,5" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="col-span-2 sm:col-span-1 glass-card p-4 rounded-2xl border border-white/[0.06] relative overflow-hidden">
                  <span className="text-zinc-400 block font-medium">Decisioning Velocity</span>
                  <span className="font-display font-bold text-2xl text-orange-400 block mt-1">
                    &lt; 3 mins
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1 font-mono font-medium">
                    <Zap className="w-3 h-3 text-orange-400" /> Automated scoring
                  </span>
                  {/* Miniature SVG Sparkline */}
                  <svg viewBox="0 0 100 25" className="w-full h-6 mt-2 overflow-visible">
                    <path d="M0,22 Q35,8 70,14 T100,2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Glass Underwriting Preview Dashboard with Live Stock Curve */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Backlight Ambient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-purple-500/20 rounded-3xl blur-2xl opacity-70" />

                {/* Main Glass Dashboard Card */}
                <div className="relative glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">PORTFOLIO MONITOR</div>
                        <div className="text-[11px] text-zinc-400">Live Risk Governance Engine</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      STP ACTIVE
                    </span>
                  </div>

                  {/* Underwritten Statistics */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="glass-panel p-3.5 rounded-2xl border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-400 block font-mono">Sanctioned Volume</span>
                      <span className="font-display font-bold text-lg text-white block mt-0.5">
                        ₹48.60 Cr
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono font-medium">
                        <TrendingUp className="w-3 h-3" /> +18.4% this month
                      </span>
                    </div>

                    <div className="glass-panel p-3.5 rounded-2xl border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-400 block font-mono">Risk Scorecard Band</span>
                      <span className="font-display font-bold text-lg text-orange-400 block mt-0.5">
                        Prime (86/100)
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
                        Bureau: 780 CIBIL
                      </span>
                    </div>
                  </div>

                  {/* Stock Curve with Candlesticks Simulation */}
                  <div className="mt-5 glass-panel p-4 rounded-2xl border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-white">Underwriting Velocity Trajectory</span>
                      <span className="text-orange-400 font-bold font-mono text-[11px]">98.2% Accuracy</span>
                    </div>
                    <svg viewBox="0 0 300 75" className="w-full h-18 overflow-visible">
                      <defs>
                        <linearGradient id="heroCurveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,58 Q45,40 90,48 T180,28 T250,18 T300,8 L300,75 L0,75 Z"
                        fill="url(#heroCurveGrad)"
                      />
                      <path
                        d="M0,58 Q45,40 90,48 T180,28 T250,18 T300,8"
                        fill="none"
                        stroke="#ff7a00"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="250" cy="18" r="4.5" fill="#ffffff" stroke="#ff7a00" strokeWidth="2.5" />
                    </svg>
                  </div>

                  {/* Ratio Health Meters */}
                  <div className="mt-5 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium font-mono">
                        <span className="text-zinc-400">FOIR Metric (Cap 55%)</span>
                        <span className="text-emerald-400 font-bold">38.4% (Optimal)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '38.4%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium font-mono">
                        <span className="text-zinc-400">LTV Metric (Cap 80%)</span>
                        <span className="text-orange-400 font-bold">72.0% (Conservative)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Pill Button */}
                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Rule Engine: <span className="text-emerald-400 font-bold">PASS (0 Exceptions)</span>
                    </div>
                    <Link
                      to="/customer/apply"
                      className="btn-orange px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Simulate Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW: Dedicated Institutional Stock & Market Depth Analytics Section */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">
              MARKET ANALYTICS &amp; LIQUIDITY POOL
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
              Institutional Mortgage Liquidity Terminal
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Real-time capital deployment curves, yield spreads, and asset-backed tranche depths monitored across lending registries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Stock Trading Terminal Chart */}
            <div className="lg:col-span-8">
              <StockChart />
            </div>

            {/* Market Depth & Yield Curve Side Widget */}
            <div className="lg:col-span-4">
              <MarketDepthWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Dual Mortgage Products Comparison (Dark Glassmorphic Cards) */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">
              Lending Portfolios
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
              Engineered for Both Acquisition &amp; Collateral Monetisation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Home Loan Card */}
            <div className="glass-card glass-card-interactive rounded-3xl p-8 sm:p-9 flex flex-col justify-between border border-white/[0.09]">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest font-mono">
                      Product 01
                    </span>
                    <h3 className="font-display font-bold text-2xl text-white mt-1">
                      Home Loan (Purchase &amp; Construction)
                    </h3>
                  </div>
                  <span className="px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.2)] font-mono">
                    LTV ≤ 80%
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Max Statutory LTV</span>
                    <span className="font-semibold text-white">Up to 80% (NHB Direction Cap)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Max Permissible Tenure</span>
                    <span className="font-semibold text-white">Up to 30 Years (360 Months)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Benchmark Lending Rate</span>
                    <span className="font-bold text-orange-400 text-sm font-mono">8.50% p.a.</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-400">Eligible Borrowers</span>
                    <span className="font-semibold text-white">Salaried &amp; Self-Employed</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  to="/customer/apply"
                  className="btn-orange inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  <span>Apply for Home Loan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
                >
                  View EMI Schedule &rarr;
                </button>
              </div>
            </div>

            {/* LAP Card */}
            <div className="glass-card glass-card-interactive rounded-3xl p-8 sm:p-9 flex flex-col justify-between border border-white/[0.09]">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                      Product 02
                    </span>
                    <h3 className="font-display font-bold text-2xl text-white mt-1">
                      Loan Against Property (LAP)
                    </h3>
                  </div>
                  <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.2)] font-mono">
                    LTV ≤ 60%
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Max Collateral LTV</span>
                    <span className="font-semibold text-white">Up to 60% (Hero Housing Limit)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Max Permissible Tenure</span>
                    <span className="font-semibold text-white">Up to 15 Years (180 Months)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-zinc-400">Benchmark Lending Rate</span>
                    <span className="font-bold text-amber-400 text-sm font-mono">10.25% p.a.</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-400">Collateral Status</span>
                    <span className="font-semibold text-white">Freehold Registered Title</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  to="/customer/apply"
                  className="btn-orange inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  <span>Apply for LAP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
                >
                  View EMI Schedule &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Underwriting Workflow Lifecycle (Frosted Glass Architecture Grid) */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">
              Architecture &amp; Lifecycle
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              End-to-End Mortgage Verification Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
              Designed for automated STP (Straight-Through-Processing) with human exception routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-card glass-card-interactive p-6 rounded-2xl border border-white/[0.08] space-y-3">
              <span className="text-xs font-mono font-bold text-orange-400 block tracking-wider">01 / INTAKE</span>
              <h4 className="font-display font-semibold text-base text-white">Digital Application &amp; Consent</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Applicant enters financials, collateral specifications, and provides legally binding digital consent for bureau and KYC queries.
              </p>
            </div>

            <div className="glass-card glass-card-interactive p-6 rounded-2xl border border-white/[0.08] space-y-3">
              <span className="text-xs font-mono font-bold text-orange-400 block tracking-wider">02 / VERIFICATION</span>
              <h4 className="font-display font-semibold text-base text-white">OCR &amp; Trust Anchors</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Simulated DigiLocker Aadhaar, CIBIL bureau pull, bank statement salary parsing, and municipal land-registry verification.
              </p>
            </div>

            <div className="glass-card glass-card-interactive p-6 rounded-2xl border border-white/[0.08] space-y-3">
              <span className="text-xs font-mono font-bold text-orange-400 block tracking-wider">03 / ASSESSMENT</span>
              <h4 className="font-display font-semibold text-base text-white">Credit Policy &amp; Scorecard</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Calculates FOIR and LTV against statutory limits. Additive scoring model evaluates default risks with transparent reason codes.
              </p>
            </div>

            <div className="glass-card glass-card-interactive p-6 rounded-2xl border border-white/[0.08] space-y-3">
              <span className="text-xs font-mono font-bold text-orange-400 block tracking-wider">04 / DECISIONING</span>
              <h4 className="font-display font-semibold text-base text-white">Tri-State Sanction Engine</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Routine clean profiles receive automated APPROVE; policy violations trigger REJECT; borderline files route to REFER.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Configured Underwriting Standards Table (Dark Frosted Table) */}
      <section className="py-20 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">
                Configured Underwriting Policy Limits
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                Active statutory and credit thresholds enforced during automated preliminary assessment.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-zinc-300 glass-pill px-3.5 py-2 rounded-xl border border-white/[0.1]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NHB Housing Finance Directions 2021 Compliant</span>
            </span>
          </div>

          <div className="glass-card rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Rule Code</th>
                    <th className="px-6 py-4">Underwriting Parameter</th>
                    <th className="px-6 py-4">Product Applicability</th>
                    <th className="px-6 py-4">Policy Threshold</th>
                    <th className="px-6 py-4">Regulatory Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-orange-400">POL-HL-LTV</td>
                    <td className="px-6 py-4 font-semibold text-white">Loan to Value (LTV) Cap</td>
                    <td className="px-6 py-4">Home Loan</td>
                    <td className="px-6 py-4 font-bold text-orange-400 font-mono">&le; 80.0%</td>
                    <td className="px-6 py-4 text-zinc-400">NHB Statutory ceiling for loans up to ₹75 Lakhs</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-amber-400">POL-LAP-LTV</td>
                    <td className="px-6 py-4 font-semibold text-white">Collateral LTV Cap</td>
                    <td className="px-6 py-4">Loan Against Property</td>
                    <td className="px-6 py-4 font-bold text-amber-400 font-mono">&le; 60.0%</td>
                    <td className="px-6 py-4 text-zinc-400">Hero Housing Finance risk mitigation benchmark</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-teal-400">POL-FOIR-MAX</td>
                    <td className="px-6 py-4 font-semibold text-white">Fixed Obligation to Income (FOIR)</td>
                    <td className="px-6 py-4">All Products</td>
                    <td className="px-6 py-4 font-bold text-white font-mono">&le; 55.0%</td>
                    <td className="px-6 py-4 text-zinc-400">Ensures borrower retains min 45% disposable buffer</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">POL-CIBIL-MIN</td>
                    <td className="px-6 py-4 font-semibold text-white">Minimum Credit Bureau Score</td>
                    <td className="px-6 py-4">All Products</td>
                    <td className="px-6 py-4 font-bold text-emerald-400 font-mono">&ge; 650</td>
                    <td className="px-6 py-4 text-zinc-400">Automated prime threshold; lower scores routed to REFER</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Calculator Modal */}
      <EligibilityCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />
    </div>
  );
}
