import React, { useState } from 'react';
import { UNEQUAL_SAMPLE_DATA, UNEQUAL_SAMPLE_INTERVALS } from '../data/curriculumData';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Calculator,
  BarChart3,
  ListOrdered,
  Lightbulb,
  Eye
} from 'lucide-react';

interface UnequalWidthSampleProps {
  isCompleted: boolean;
  onComplete: () => void;
  onGoToExam: () => void;
}

export const UnequalWidthSample: React.FC<UnequalWidthSampleProps> = ({
  isCompleted,
  onComplete,
  onGoToExam
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedIntervalId, setSelectedIntervalId] = useState<string>('sample-1');

  const intervalColors = [
    { bg: 'bg-blue-100 text-blue-900 border-blue-300', fill: '#3b82f6', stroke: '#1e3a8a' },
    { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', fill: '#10b981', stroke: '#064e3b' },
    { bg: 'bg-purple-100 text-purple-900 border-purple-300', fill: '#8b5cf6', stroke: '#4c1d95' },
    { bg: 'bg-amber-100 text-amber-900 border-amber-300', fill: '#f59e0b', stroke: '#78350f' }
  ];

  const getIntervalIndexForValue = (val: number) => {
    return UNEQUAL_SAMPLE_INTERVALS.findIndex((inv, i) =>
      i === UNEQUAL_SAMPLE_INTERVALS.length - 1
        ? val >= inv.lower && val <= inv.upper
        : val >= inv.lower && val < inv.upper
    );
  };

  const handleMarkDoneAndNext = () => {
    onComplete();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onGoToExam();
  };

  // SVG layout for worked example histogram
  const svgWidth = 680;
  const svgHeight = 320;
  const marginLeft = 65;
  const marginRight = 30;
  const marginTop = 25;
  const marginBottom = 55;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const minX = 0;
  const maxX = 30;
  const xSpan = maxX - minX;
  const maxFD = 2.0;

  const selectedSampleIdx = UNEQUAL_SAMPLE_INTERVALS.findIndex((s) => s.id === selectedIntervalId);
  const selectedSample = UNEQUAL_SAMPLE_INTERVALS[selectedSampleIdx] || UNEQUAL_SAMPLE_INTERVALS[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-emerald-100">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              Section 6 • Step-by-Step Worked Sample
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              From Single Data to Unequal-Width Histogram
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Follow this easy 4-step sample: see how <strong>25 single puzzle times</strong> are grouped into intervals with
              <strong> different class widths</strong>, converted to <strong>Frequency Density</strong>, and plotted on graph paper.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 text-center">
            <div className="text-xs uppercase font-semibold text-emerald-200">Worked Example</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">25 Students</div>
            <div className="text-xs text-emerald-100 mt-1">Widths: 10, 5, 5, 10</div>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/20">
          {[
            { num: 1, title: '1. Single Raw Data' },
            { num: 2, title: '2. Different Widths' },
            { num: 3, title: '3. Freq Density' },
            { num: 4, title: '4. Histogram Plot' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeStep === s.num
                  ? 'bg-white text-teal-900 shadow-md'
                  : activeStep > s.num
                  ? 'bg-emerald-500/40 text-white border border-white/30 hover:bg-emerald-500/60'
                  : 'bg-white/15 text-emerald-100 hover:bg-white/25'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: SINGLE RAW DATA */}
      <div className={`bg-white rounded-2xl border-2 p-6 space-y-4 transition-all ${
        activeStep === 1 ? 'border-teal-500 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                1
              </span>
              <span>Step 1: Look at the Single Data (Time in minutes for 25 students)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each number is color-coded to match the unequal group it belongs to. Click any group button to highlight its numbers!
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {UNEQUAL_SAMPLE_INTERVALS.map((inv, idx) => (
              <button
                key={inv.id}
                onClick={() => setSelectedIntervalId(inv.id)}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedIntervalId === inv.id
                    ? `${intervalColors[idx].bg} ring-2 ring-teal-500`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {inv.intervalText}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {UNEQUAL_SAMPLE_DATA.map((val, idx) => {
            const gIdx = getIntervalIndexForValue(val);
            const gId = UNEQUAL_SAMPLE_INTERVALS[gIdx]?.id;
            const isHighlighted = gId === selectedIntervalId;

            return (
              <button
                key={idx}
                onClick={() => gId && setSelectedIntervalId(gId)}
                className={`font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isHighlighted
                    ? `${intervalColors[gIdx].bg} ring-2 ring-teal-600 scale-105 shadow-xs`
                    : 'bg-white text-slate-600 border-slate-200 opacity-75 hover:opacity-100'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between gap-2">
          <span>
            Group <strong>{selectedSample.intervalText}</strong> contains <strong>{selectedSample.frequency}</strong> values:
            <code className="font-mono ml-2 bg-white px-2 py-0.5 rounded border border-teal-200">
              {selectedSample.values.join(', ')}
            </code>
          </span>
          {activeStep === 1 && (
            <button
              onClick={() => setActiveStep(2)}
              className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
            >
              Next: Step 2 →
            </button>
          )}
        </div>
      </div>

      {/* STEP 2 & STEP 3: TABLE WITH DIFFERENT CLASS WIDTHS & FREQUENCY DENSITY */}
      <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
        activeStep === 2 || activeStep === 3 ? 'border-teal-500 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-teal-600" />
              <span>Steps 2 &amp; 3: Group Data &amp; Calculate Frequency Density</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice how the <strong>Class Width</strong> changes (10, 5, 5, 10), so we calculate <strong>Frequency Density = Frequency ÷ Class Width</strong>.
            </p>
          </div>

          <div className="flex gap-2">
            {activeStep < 3 && (
              <button
                onClick={() => setActiveStep(3)}
                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl cursor-pointer"
              >
                Show Step 3 Calculation
              </button>
            )}
            {activeStep === 3 && (
              <button
                onClick={() => setActiveStep(4)}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl cursor-pointer"
              >
                Next: Plot Histogram →
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Class Interval</th>
                <th className="py-2.5 px-3">Lower Bound</th>
                <th className="py-2.5 px-3">Upper Bound</th>
                <th className="py-2.5 px-3 text-amber-800">Class Width (w = Upper − Lower)</th>
                <th className="py-2.5 px-3 text-blue-800">Frequency (f)</th>
                <th className="py-2.5 px-3 text-purple-900 font-extrabold">Frequency Density (f ÷ w)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {UNEQUAL_SAMPLE_INTERVALS.map((row, idx) => {
                const isSelected = row.id === selectedIntervalId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedIntervalId(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/70' : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.intervalText}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{row.lower}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{row.upper}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      {row.upper} − {row.lower} = <span className="text-sm underline">{row.width}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 text-base">{row.frequency}</td>
                    <td className="py-3 px-3 font-mono font-black text-purple-700">
                      {row.frequency} ÷ {row.width} = <span className="bg-purple-100 px-2 py-0.5 rounded-md text-sm">{row.frequencyDensity}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-right text-slate-700">Total Students (Σf):</td>
                <td colSpan={2} className="py-2.5 px-3 font-mono text-sm text-teal-800">25 Students</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 bg-amber-50 border-t border-amber-200 text-xs text-amber-950 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Look closely at rows 1 and 2!</strong> Both have <strong>Frequency = 6</strong>, but row 1 has width <strong>10</strong> (FD = <strong>0.6</strong>) while row 2 has width <strong>5</strong> (FD = <strong>1.2</strong>). That makes row 2 twice as tall!
          </span>
        </div>
      </div>

      {/* STEP 4: HISTOGRAM PLOT */}
      <div className={`bg-white rounded-2xl border-2 p-5 sm:p-6 space-y-4 transition-all ${
        activeStep === 4 ? 'border-teal-500 shadow-md' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <span>Step 4: The Finished Histogram (Different Widths + Frequency Density)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any bar on the graph to check how <strong>Width × Frequency Density = Frequency</strong>!
            </p>
          </div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            Y-Axis = Frequency Density
          </span>
        </div>

        <div className="cambridge-grid rounded-2xl border-2 border-teal-200 p-2 sm:p-4 overflow-x-auto shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[540px] select-none">
            <rect
              x={marginLeft}
              y={marginTop}
              width={plotWidth}
              height={plotHeight}
              fill="rgba(255,255,255,0.75)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Y Grid lines: 0.0, 0.4, 0.8, 1.2, 1.6, 2.0 */}
            {[0, 0.4, 0.8, 1.2, 1.6, 2.0].map((tick) => {
              const yPos = marginTop + plotHeight - (tick / maxFD) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={marginLeft}
                    y1={yPos}
                    x2={marginLeft + plotWidth}
                    y2={yPos}
                    stroke="#cbd5e1"
                    strokeWidth={tick === 0 ? '2' : '0.6'}
                    strokeDasharray={tick === 0 ? '' : '3,3'}
                  />
                  <text
                    x={marginLeft - 8}
                    y={yPos + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Y Axis Title */}
            <text
              x={18}
              y={marginTop + plotHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 18 ${marginTop + plotHeight / 2})`}
              fontSize="12"
              fontWeight="bold"
              fill="#6b21a8"
            >
              Frequency Density
            </text>

            {/* Unequal Width Bars */}
            {UNEQUAL_SAMPLE_INTERVALS.map((row, idx) => {
              const barX = marginLeft + ((row.lower - minX) / xSpan) * plotWidth;
              const barW = (row.width / xSpan) * plotWidth;
              const barH = (row.frequencyDensity / maxFD) * plotHeight;
              const barY = marginTop + plotHeight - barH;
              const isSelected = row.id === selectedIntervalId;

              return (
                <g
                  key={row.id}
                  onClick={() => setSelectedIntervalId(row.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barH}
                    fill={intervalColors[idx].fill}
                    stroke={isSelected ? '#0f172a' : intervalColors[idx].stroke}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    opacity={isSelected ? 1 : 0.85}
                  />

                  <text
                    x={barX + barW / 2}
                    y={barY + barH / 2 - 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    fontSize="11"
                  >
                    FD={row.frequencyDensity}
                  </text>
                  <text
                    x={barX + barW / 2}
                    y={barY + barH / 2 + 11}
                    textAnchor="middle"
                    fill="#fef3c7"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    fontSize="10"
                  >
                    Area={row.frequency}
                  </text>

                  {/* X boundary tick */}
                  <line
                    x1={barX}
                    y1={marginTop + plotHeight}
                    x2={barX}
                    y2={marginTop + plotHeight + 6}
                    stroke="#0f172a"
                    strokeWidth="1.5"
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
                    {row.lower}
                  </text>

                  {idx === UNEQUAL_SAMPLE_INTERVALS.length - 1 && (
                    <>
                      <line
                        x1={barX + barW}
                        y1={marginTop + plotHeight}
                        x2={barX + barW}
                        y2={marginTop + plotHeight + 6}
                        stroke="#0f172a"
                        strokeWidth="1.5"
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
                        {row.upper}
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
            <text
              x={marginLeft + plotWidth / 2}
              y={marginTop + plotHeight + 42}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#0f172a"
            >
              Time Taken (t minutes) — Different Class Widths (10, 5, 5, 10)
            </text>
          </svg>
        </div>

        {/* Selected Bar Area Proof Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
              Area Check for Selected Bar ({selectedSample.intervalText}):
            </div>
            <div className="font-mono text-sm">
              Area = Width × Frequency Density = <strong>{selectedSample.width}</strong> × <strong>{selectedSample.frequencyDensity}</strong> = <span className="text-emerald-400 font-black">{selectedSample.frequency} students</span>
            </div>
          </div>
          <div className="text-slate-300 text-[11px]">
            Notice: NO gaps between bars, and widths match the x-axis scale!
          </div>
        </div>

        {/* Proceed CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sample completed! Ready to try it yourself in Section 7.</span>
              </>
            ) : (
              <span>Now it is your turn! Build a histogram with different class widths from single data.</span>
            )}
          </div>

          <button
            onClick={handleMarkDoneAndNext}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Section 7: Exam Practice (Different Widths)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
