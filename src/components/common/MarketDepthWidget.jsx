import React from 'react';
import { Layers, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

const YIELD_CURVE = [
  { tenure: '2Y', yield: '6.85%', spread: '+25 bps', height: 40 },
  { tenure: '5Y', yield: '7.15%', spread: '+55 bps', height: 55 },
  { tenure: '10Y', yield: '7.45%', spread: '+85 bps', height: 72 },
  { tenure: '15Y', yield: '7.90%', spread: '+130 bps', height: 85 },
  { tenure: '20Y', yield: '8.30%', spread: '+170 bps', height: 95 },
  { tenure: '30Y', yield: '8.50%', spread: '+190 bps', height: 100 },
];

const ORDER_BOOK = [
  { tranche: 'HL-AAA-01', type: 'BID', rate: '8.45%', volume: '₹140 Cr', fill: 85 },
  { tranche: 'HL-AAA-02', type: 'BID', rate: '8.50%', volume: '₹220 Cr', fill: 95 },
  { tranche: 'LAP-AA-01', type: 'BID', rate: '10.15%', volume: '₹95 Cr', fill: 65 },
  { tranche: 'HL-SENIOR', type: 'ASK', rate: '8.55%', volume: '₹180 Cr', fill: 75 },
  { tranche: 'LAP-MEZZ', type: 'ASK', rate: '10.30%', volume: '₹60 Cr', fill: 45 },
];

export default function MarketDepthWidget() {
  return (
    <div className="space-y-6">
      {/* Yield Curve Graph Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">Mortgage Yield Curve (Tenure Spread)</h4>
              <p className="text-[11px] text-zinc-400">Prime benchmark interest trajectory</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            NORMAL UPWARD
          </span>
        </div>

        {/* Bar & Curve Graph */}
        <div className="mt-6 flex items-end justify-between gap-3 h-32 pt-2">
          {YIELD_CURVE.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="font-mono text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.spread}
              </span>
              <div className="w-full bg-white/[0.04] rounded-t-lg relative overflow-hidden flex items-end justify-center h-24">
                <div
                  className="w-full bg-gradient-to-t from-orange-500/40 via-orange-500 to-amber-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${item.height}%` }}
                />
              </div>
              <div className="text-center">
                <span className="font-mono font-bold text-xs text-white block">{item.tenure}</span>
                <span className="font-mono text-[10px] text-zinc-400 block">{item.yield}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tranche Liquidity Depth / Order Book */}
      <div className="glass-card rounded-3xl p-6 border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">Underwriting Capital Depth</h4>
              <p className="text-[11px] text-zinc-400">Active institutional allocation tranches</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">TOTAL: ₹695 Cr</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {ORDER_BOOK.map((order, idx) => (
            <div
              key={idx}
              className="glass-panel p-3 rounded-xl border border-white/[0.06] relative overflow-hidden flex items-center justify-between text-xs"
            >
              {/* Progress depth background */}
              <div
                className={`absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none ${
                  order.type === 'BID' ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${order.fill}%` }}
              />

              <div className="relative z-10 flex items-center gap-2.5">
                <span
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    order.type === 'BID'
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : 'text-orange-400 bg-orange-500/20'
                  }`}
                >
                  {order.type}
                </span>
                <span className="font-mono font-bold text-white">{order.tranche}</span>
              </div>

              <div className="relative z-10 flex items-center gap-4 font-mono">
                <span className="text-zinc-300 font-semibold">{order.rate}</span>
                <span className="font-bold text-white">{order.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
