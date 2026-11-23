import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Activity, RefreshCw, Maximize2, Shield } from 'lucide-react';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export default function StockChart({
  title = "NIRNAY Mortgage Liquidity & Underwriting Volume Index",
  symbol = "NMI:IN",
  initialValue = "₹1,842.60 Cr",
  change = "+₹128.40 Cr (+7.48%)",
  isPositive = true,
  className = ""
}) {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'candles'
  const [hoverIndex, setHoverIndex] = useState(null);

  // Generate deterministic stock data points based on timeframe
  const dataPoints = useMemo(() => {
    const counts = { '1D': 24, '1W': 28, '1M': 30, '3M': 45, '1Y': 52, 'ALL': 60 };
    const n = counts[timeframe] || 30;
    const base = 1600;
    const points = [];
    let current = base;

    for (let i = 0; i < n; i++) {
      const delta = (Math.sin(i * 0.45) * 45) + ((i / n) * 220) + (Math.sin(i * 1.8) * 18);
      const val = Math.round(base + delta + (i % 2 === 0 ? 12 : -8));
      const open = Math.round(val - (Math.sin(i) * 15));
      const high = Math.round(Math.max(val, open) + (Math.random() * 12 + 5));
      const low = Math.round(Math.min(val, open) - (Math.random() * 12 + 5));
      const volume = Math.round(20 + Math.abs(Math.sin(i * 0.7)) * 40 + (i % 3 === 0 ? 30 : 5));
      
      points.push({
        idx: i,
        close: val,
        open,
        high,
        low,
        volume,
        label: `${timeframe} • Pt ${i + 1}`,
      });
    }
    return points;
  }, [timeframe]);

  // Compute SVG coordinates
  const minVal = Math.min(...dataPoints.map(d => chartMode === 'candles' ? d.low : d.close)) * 0.98;
  const maxVal = Math.max(...dataPoints.map(d => chartMode === 'candles' ? d.high : d.close)) * 1.02;
  const maxVol = Math.max(...dataPoints.map(d => d.volume));

  const width = 800;
  const height = 280;
  const paddingX = 15;
  const paddingY = 25;
  const chartHeight = height - paddingY * 2 - 40; // reserve space for volume bars

  const getX = (idx) => paddingX + (idx / (dataPoints.length - 1)) * (width - paddingX * 2);
  const getY = (val) => paddingY + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  const getVolHeight = (vol) => (vol / maxVol) * 40;

  // Build SVG path for area/line
  const linePath = dataPoints.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.close);
    if (i === 0) return `M ${x},${y}`;
    const prevX = getX(i - 1);
    const prevY = getY(dataPoints[i - 1].close);
    const cpX1 = prevX + (x - prevX) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
  }, '');

  const areaPath = `${linePath} L ${getX(dataPoints.length - 1)},${height - 40} L ${getX(0)},${height - 40} Z`;

  // Active hover point
  const activePt = hoverIndex !== null ? dataPoints[hoverIndex] : dataPoints[dataPoints.length - 1];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, (mouseX - paddingX) / (width - paddingX * 2)));
    const idx = Math.round(percent * (dataPoints.length - 1));
    setHoverIndex(idx);
  };

  return (
    <div className={`glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.1] shadow-2xl relative overflow-hidden ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with Stock Tickers & Timeframe Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
              {symbol}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Real-Time Mortgage Capitalization
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {hoverIndex !== null ? `₹${activePt.close}.00 Cr` : initialValue}
            </h3>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          </div>
        </div>

        {/* Controls Toolbar: Timeframes + Chart Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart mode toggle */}
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08] mr-2">
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartMode === 'area'
                  ? 'btn-orange shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setChartMode('candles')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartMode === 'candles'
                  ? 'btn-orange shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Candles
            </button>
          </div>

          {/* Timeframe pills */}
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-white/[0.12] text-white border border-white/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Market Key Indicators Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-white/[0.06] text-xs">
        <div>
          <span className="text-[11px] text-zinc-500 block">24h High</span>
          <span className="font-mono font-bold text-white">₹{Math.round(maxVal)} Cr</span>
        </div>
        <div>
          <span className="text-[11px] text-zinc-500 block">24h Low</span>
          <span className="font-mono font-bold text-zinc-300">₹{Math.round(minVal)} Cr</span>
        </div>
        <div>
          <span className="text-[11px] text-zinc-500 block">Traded Volume</span>
          <span className="font-mono font-bold text-orange-400">₹{activePt.volume * 8}.4 Cr</span>
        </div>
        <div>
          <span className="text-[11px] text-zinc-500 block">Market Volatility</span>
          <span className="font-mono font-bold text-emerald-400">0.42 (Low Risk)</span>
        </div>
      </div>

      {/* Interactive SVG Stock Chart Canvas */}
      <div
        className="relative mt-4 cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 sm:h-72 overflow-visible"
        >
          <defs>
            {/* Area Neon Orange Gradient */}
            <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ff7a00" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="stockGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartHeight * 0.33} x2={width - paddingX} y2={paddingY + chartHeight * 0.33} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartHeight * 0.66} x2={width - paddingX} y2={paddingY + chartHeight * 0.66} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartHeight} x2={width - paddingX} y2={paddingY + chartHeight} stroke="rgba(255,255,255,0.1)" />

          {/* Volume Histogram Bars (Base) */}
          {dataPoints.map((pt, i) => {
            const x = getX(i);
            const vHeight = getVolHeight(pt.volume);
            const y = height - vHeight;
            const isUp = pt.close >= pt.open;
            return (
              <rect
                key={i}
                x={x - 3}
                y={y}
                width={6}
                height={vHeight}
                fill={isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}
                rx={1}
              />
            );
          })}

          {/* Render Candlesticks OR Area Line */}
          {chartMode === 'area' ? (
            <>
              {/* Shaded Area */}
              <path d={areaPath} fill="url(#stockAreaGrad)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#ff7a00"
                strokeWidth="2.75"
                strokeLinecap="round"
                filter="url(#stockGlow)"
              />
            </>
          ) : (
            /* Candlestick Bars */
            dataPoints.map((pt, i) => {
              const x = getX(i);
              const yOpen = getY(pt.open);
              const yClose = getY(pt.close);
              const yHigh = getY(pt.high);
              const yLow = getY(pt.low);
              const isGreen = pt.close >= pt.open;
              const color = isGreen ? '#10b981' : '#ef4444';
              const top = Math.min(yOpen, yClose);
              const barHeight = Math.max(3, Math.abs(yClose - yOpen));

              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.25" opacity="0.8" />
                  {/* Body */}
                  <rect
                    x={x - 4}
                    y={top}
                    width={8}
                    height={barHeight}
                    fill={color}
                    rx={1.5}
                  />
                </g>
              );
            })
          )}

          {/* Crosshair on hover */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingY}
                x2={getX(hoverIndex)}
                y2={height}
                stroke="#ff7a00"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activePt.close)}
                r="6"
                fill="#ffffff"
                stroke="#ff7a00"
                strokeWidth="3"
                filter="url(#stockGlow)"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay Card */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none glass-panel px-3 py-2 rounded-xl text-xs font-mono shadow-2xl border border-orange-500/30 transition-all z-20"
            style={{
              left: Math.min(Math.max(10, (getX(hoverIndex) / width) * 100), 75) + '%',
            }}
          >
            <div className="text-zinc-400 text-[10px]">{activePt.label}</div>
            <div className="text-white font-bold text-sm">₹{activePt.close}.00 Cr</div>
            <div className="text-orange-400 text-[10px] flex items-center gap-1 mt-0.5">
              <span>Vol: ₹{activePt.volume * 8} Cr</span>
              <span>&bull;</span>
              <span className={activePt.close >= activePt.open ? 'text-emerald-400' : 'text-red-400'}>
                {activePt.close >= activePt.open ? '▲ Net Inflow' : '▼ Net Outflow'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Prime Collateral Pool (94.2%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Automated STP Executed</span>
          </span>
        </div>
        <div className="font-mono text-zinc-500">
          Source: NIRNAY Institutional Ledger &bull; Refresh: Live WebSocket
        </div>
      </div>
    </div>
  );
}
