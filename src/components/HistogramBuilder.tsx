import React, { useState } from 'react';
import { GroupedInterval, DatasetPreset } from '../types';
import confetti from 'canvas-confetti';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Plus, 
  Minus, 
  Wand2, 
  RotateCcw,
  Eye,
  Check
} from 'lucide-react';

interface HistogramBuilderProps {
  intervals: GroupedInterval[];
  dataset: DatasetPreset;
  onUpdateIntervals: (updated: GroupedInterval[]) => void;
  onVerified: () => void;
  isVerified: boolean;
  onGoToCumulative: () => void;
}

export const HistogramBuilder: React.FC<HistogramBuilderProps> = ({
  intervals,
  dataset,
  onUpdateIntervals,
  onVerified,
  isVerified,
  onGoToCumulative
}) => {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [showTargetGhost, setShowTargetGhost] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    checked: boolean;
    allCorrect: boolean;
    errors: { id: string; msg: string }[];
  }>({
    checked: false,
    allCorrect: false,
    errors: []
  });

  // Calculate grid bounds
  const minX = intervals[0]?.lowerBound ?? 0;
  const maxX = intervals[intervals.length - 1]?.upperBound ?? 100;
  const totalWidthSpan = maxX - minX;

  const targetMaxFreq = Math.max(...intervals.map(it => it.frequency), 1);
  const userMaxHeight = Math.max(...intervals.map(it => it.userHeight), 1);
  const yAxisMax = Math.max(targetMaxFreq, userMaxHeight, 10);

  // Height adjustment helpers
  const handleSetHeight = (index: number, newHeight: number) => {
    const clamped = Math.max(0, Math.min(yAxisMax + 2, Math.round(newHeight)));
    const updated = [...intervals];
    updated[index] = { ...updated[index], userHeight: clamped };
    onUpdateIntervals(updated);
    setValidationResult(prev => ({ ...prev, checked: false }));
  };

  const handleQuickAdd = (index: number, delta: number) => {
    handleSetHeight(index, (intervals[index].userHeight || 0) + delta);
  };

  const handleAutoFill = () => {
    const updated = intervals.map(it => ({ ...it, userHeight: it.frequency }));
    onUpdateIntervals(updated);
    setValidationResult({
      checked: true,
      allCorrect: true,
      errors: []
    });
    onVerified();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleResetBars = () => {
    const updated = intervals.map(it => ({ ...it, userHeight: 0 }));
    onUpdateIntervals(updated);
    setValidationResult({
      checked: false,
      allCorrect: false,
      errors: []
    });
  };

  const handleCheckHistogram = () => {
    const errors: { id: string; msg: string }[] = [];
    intervals.forEach((it) => {
      const diff = Math.abs(it.userHeight - it.frequency);
      if (diff !== 0) {
        if (it.userHeight < it.frequency) {
          errors.push({
            id: it.id,
            msg: `Interval ${it.lowerBound} ≤ x < ${it.upperBound} is too low (drawn: ${it.userHeight}, target: ${it.frequency})`
          });
        } else {
          errors.push({
            id: it.id,
            msg: `Interval ${it.lowerBound} ≤ x < ${it.upperBound} is too high (drawn: ${it.userHeight}, target: ${it.frequency})`
          });
        }
      }
    });

    const isAllGood = errors.length === 0;
    setValidationResult({
      checked: true,
      allCorrect: isAllGood,
      errors
    });

    if (isAllGood) {
      onVerified();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Dimensions for SVG canvas
  const svgWidth = 720;
  const svgHeight = 360;
  const marginLeft = 60;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 60;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  // Y-axis tick steps
  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((yAxisMax / 5) * i));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
              <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
              Step 3 • Hands-on Construction
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Cambridge Histogram Builder
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Use the graph paper below to draw your histogram. Adjust each bar height to match your grouped frequency table.
              Notice how <strong>all adjacent bars touch each other</strong> without any gaps!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoFill}
              className="bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              title="Need help? Auto-align bars with table data"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>Auto-Align Bars</span>
            </button>

            <button
              onClick={handleResetBars}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"
              title="Reset bar heights to 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cambridge Exam Guidance Chips */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20 text-xs">
          <span className="bg-white/10 px-2.5 py-1 rounded-lg">
            ✓ Continuous Class Boundaries: <strong className="text-amber-300">NO GAPS</strong>
          </span>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg">
            ✓ Equal Class Length: <strong className="text-amber-300">Height = Frequency</strong>
          </span>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg">
            ✓ Area Rule: <strong className="text-amber-300">Area = Width × Height = f</strong>
          </span>
        </div>
      </div>

      {/* Target Table Reference Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Target Frequency Table ({dataset.title})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Match your graph to these frequencies:
            </span>
          </div>

          <button
            onClick={() => setShowTargetGhost(!showTargetGhost)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              showTargetGhost
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showTargetGhost ? 'Hide Target Guides' : 'Show Target Guides on Graph'}</span>
          </button>
        </div>

        {/* Quick Horizontal Table */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {intervals.map((it, idx) => {
              const isMatch = it.userHeight === it.frequency;

              return (
                <div
                  key={it.id}
                  onClick={() => setActiveBarIndex(idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-w-28 ${
                    activeBarIndex === idx
                      ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-300'
                      : isMatch
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-mono font-semibold text-slate-500">
                    {it.lowerBound} ≤ x &lt; {it.upperBound}
                  </div>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <span className="text-xs text-slate-400">Target f:</span>
                    <span className="font-mono font-bold text-indigo-700 text-base">
                      {it.frequency}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px]">
                    <span className="text-slate-500">Drawn:</span>
                    <span className={`font-mono font-bold ${isMatch ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {it.userHeight || 0}
                    </span>
                    {isMatch && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Cambridge Graph Paper Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>Interactive Graph Paper</span>
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Cambridge 2mm-style Grid
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Drag bar tops or use the <strong>+ / −</strong> buttons below each bar to match the target frequency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckHistogram}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check My Histogram</span>
            </button>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="cambridge-grid rounded-2xl border-2 border-indigo-200 p-2 sm:p-4 overflow-x-auto shadow-inner">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[550px] select-none"
          >
            {/* Background Plot Area */}
            <rect
              x={marginLeft}
              y={marginTop}
              width={plotWidth}
              height={plotHeight}
              fill="rgba(255, 255, 255, 0.7)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Horizontal Grid Lines & Y Ticks */}
            {yTicks.map((tickVal) => {
              const yPos = marginTop + plotHeight - (tickVal / yAxisMax) * plotHeight;
              return (
                <g key={tickVal}>
                  <line
                    x1={marginLeft}
                    y1={yPos}
                    x2={marginLeft + plotWidth}
                    y2={yPos}
                    stroke="#94a3b8"
                    strokeWidth={tickVal === 0 ? '2' : '0.5'}
                    strokeDasharray={tickVal === 0 ? '' : '3,3'}
                  />
                  <text
                    x={marginLeft - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {tickVal}
                  </text>
                </g>
              );
            })}

            {/* Y Axis Label */}
            <text
              x={18}
              y={marginTop + plotHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 18 ${marginTop + plotHeight / 2})`}
              fontSize="12"
              fontWeight="bold"
              fill="#1e293b"
            >
              Frequency (f)
            </text>

            {/* GHOST / TARGET BARS (Optional guide) */}
            {showTargetGhost &&
              intervals.map((it) => {
                const leftNorm = (it.lowerBound - minX) / totalWidthSpan;
                const widthNorm = (it.upperBound - it.lowerBound) / totalWidthSpan;
                const barX = marginLeft + leftNorm * plotWidth;
                const barW = widthNorm * plotWidth;
                const targetBarH = (it.frequency / yAxisMax) * plotHeight;
                const targetBarY = marginTop + plotHeight - targetBarH;

                return (
                  <rect
                    key={`ghost-${it.id}`}
                    x={barX}
                    y={targetBarY}
                    width={barW}
                    height={targetBarH}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    pointerEvents="none"
                  />
                );
              })}

            {/* USER INTERACTIVE HISTOGRAM BARS */}
            {intervals.map((it, idx) => {
              const leftNorm = (it.lowerBound - minX) / totalWidthSpan;
              const widthNorm = (it.upperBound - it.lowerBound) / totalWidthSpan;
              const barX = marginLeft + leftNorm * plotWidth;
              const barW = widthNorm * plotWidth;

              const userH = it.userHeight || 0;
              const barHeightPx = (userH / yAxisMax) * plotHeight;
              const barY = marginTop + plotHeight - barHeightPx;

              const isMatch = it.userHeight === it.frequency;
              const isSelected = activeBarIndex === idx;

              return (
                <g key={it.id} className="cursor-pointer">
                  {/* The Histogram Bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barHeightPx}
                    fill={isSelected ? '#4338ca' : isMatch ? '#4f46e5' : '#6366f1'}
                    stroke="#1e1b4b"
                    strokeWidth="1.5"
                    onClick={() => setActiveBarIndex(idx)}
                    className="transition-all hover:brightness-110"
                  />

                  {/* Top Drag Handle Bar */}
                  <rect
                    x={barX}
                    y={barY - 4}
                    width={barW}
                    height={8}
                    fill="#fbbf24"
                    stroke="#b45309"
                    strokeWidth="1"
                    rx="2"
                    className="cursor-ns-resize hover:fill-amber-400"
                  >
                    <title>{`Drag or click to adjust height (Current: ${userH})`}</title>
                  </rect>

                  {/* Value inside bar */}
                  {barHeightPx > 20 && (
                    <text
                      x={barX + barW / 2}
                      y={barY + barHeightPx / 2 + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      fontSize="12"
                    >
                      f = {userH}
                    </text>
                  )}

                  {/* Cambridge Touching Boundary Ticks */}
                  <line
                    x1={barX}
                    y1={marginTop + plotHeight}
                    x2={barX}
                    y2={marginTop + plotHeight + 6}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                  <text
                    x={barX}
                    y={marginTop + plotHeight + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    fill="#1e293b"
                  >
                    {it.lowerBound}
                  </text>

                  {/* Last boundary label */}
                  {idx === intervals.length - 1 && (
                    <>
                      <line
                        x1={barX + barW}
                        y1={marginTop + plotHeight}
                        x2={barX + barW}
                        y2={marginTop + plotHeight + 6}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      <text
                        x={barX + barW}
                        y={marginTop + plotHeight + 20}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        fill="#1e293b"
                      >
                        {it.upperBound}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* X Axis Baseline */}
            <line
              x1={marginLeft}
              y1={marginTop + plotHeight}
              x2={marginLeft + plotWidth}
              y2={marginTop + plotHeight}
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {/* X Axis Label */}
            <text
              x={marginLeft + plotWidth / 2}
              y={marginTop + plotHeight + 45}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="#0f172a"
            >
              {dataset.variableName} (Continuous Class Boundaries)
            </text>
          </svg>
        </div>

        {/* Step-by-Step Bar Height Controls for Middle-to-Low Students */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Bar Height Adjusters (Click + / − to match your table):
            </span>
            <span className="text-xs text-slate-500">
              Equal interval width: <strong className="text-indigo-600">{intervals[0]?.classWidth} units</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {intervals.map((it, idx) => {
              const isMatch = it.userHeight === it.frequency;

              return (
                <div
                  key={it.id}
                  className={`bg-white p-2.5 rounded-xl border text-center transition-all ${
                    isMatch ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 truncate">
                    {it.lowerBound} to {it.upperBound}
                  </div>
                  <div className="my-1.5 font-mono text-base font-black text-indigo-700">
                    {it.userHeight || 0}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleQuickAdd(idx, -1)}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                      title="Decrease bar height"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleQuickAdd(idx, 1)}
                      className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                      title="Increase bar height"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Result Feedback Box */}
        {validationResult.checked && (
          <div
            className={`p-5 rounded-xl border transition-all ${
              validationResult.allCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {validationResult.allCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-base">
                  {validationResult.allCorrect
                    ? 'Superb! Your Histogram is 100% Accurate!'
                    : 'Almost there! Check the following bars:'}
                </h4>
                {validationResult.allCorrect ? (
                  <p className="text-xs text-emerald-800">
                    All bars touch without gaps, the scale on the x-axis matches Cambridge continuous boundaries,
                    and every bar height correctly reflects the frequency.
                  </p>
                ) : (
                  <ul className="text-xs space-y-1 mt-2 text-amber-900 font-medium list-disc pl-4">
                    {validationResult.errors.map((err, i) => (
                      <li key={i}>{err.msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            <strong>Cambridge Golden Rule:</strong> Area of bar = Frequency! Because intervals are equal, height represents frequency directly.
          </div>

          <button
            onClick={onGoToCumulative}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 4: Cumulative Frequency Curve</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
