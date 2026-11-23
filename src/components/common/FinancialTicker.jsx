import React from 'react';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const TICKER_ITEMS = [
  { symbol: 'NMI:INDEX', name: 'NIRNAY Index', val: '4,892.40', chg: '+1.45%', isUp: true, vol: '₹340 Cr' },
  { symbol: '10Y:GSEC', name: '10Y Benchmark', val: '7.02%', chg: '-0.03%', isUp: false, vol: 'Yield' },
  { symbol: 'MCLR:1Y', name: 'Base Lending', val: '8.65%', chg: '+0.00%', isUp: true, vol: 'Benchmark' },
  { symbol: 'HL:PRIME', name: 'Home Loan Prime', val: '8.50%', chg: '-0.10%', isUp: false, vol: 'Lowest' },
  { symbol: 'LAP:SPREAD', name: 'Collateral Spread', val: '+175 bps', chg: '+4 bps', isUp: true, vol: '10.25%' },
  { symbol: 'AUM:FLOW', name: '24h Sanctions', val: '₹48.60 Cr', chg: '+18.2%', isUp: true, vol: 'Volume' },
  { symbol: 'STP:SPEED', name: 'Decision Engine', val: '142 ms', chg: 'REALTIME', isUp: true, vol: 'Latency' },
  { symbol: 'DEFAULT:PD', name: 'Risk Probability', val: '0.74%', chg: '-0.12%', isUp: false, vol: 'Low Risk' },
];

export default function FinancialTicker() {
  return (
    <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/[0.08] overflow-hidden py-2 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs">
          <div className="flex items-center gap-2 pr-4 border-r border-white/[0.1] shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_8px_#f97316]" />
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-orange-400">
              MARKET LIVE
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            {TICKER_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 hover:bg-white/[0.05] px-2.5 py-1 rounded-lg transition-colors cursor-pointer group shrink-0"
              >
                <span className="font-mono font-semibold text-zinc-400 group-hover:text-white">
                  {item.symbol}
                </span>
                <span className="font-bold text-white font-mono">
                  {item.val}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.isUp
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  {item.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {item.chg}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                  [{item.vol}]
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
