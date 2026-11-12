import React, { useState } from 'react';
import { ExamTableRow } from '../types';
import { EXAM_HEIGHTS_DATA } from '../data/curriculumData';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Info, 
  Plus, 
  Minus, 
  RotateCcw,
  Wand2,
  Table2,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface ExamPracticeProps {
  tableRows: ExamTableRow[];
  onUpdateTableRows: (rows: ExamTableRow[]) => void;
  onTableVerified: () => void;
  isTableVerified: boolean;
  onHistogramVerified: () => void;
  isHistogramVerified: boolean;
  onGoToExport: () => void;
}

export const ExamPractice: React.FC<ExamPracticeProps> = ({
  tableRows,
  onUpdateTableRows,
  onTableVerified,
  isTableVerified,
  onHistogramVerified,
  isHistogramVerified,
  onGoToExport
}) => {
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, boolean>>({});
  const [tableFeedback, setTableFeedback] = useState<{
    checked: boolean;
    allCorrect: boolean;
    rowStatus: Record<string, { lowerOk: boolean; upperOk: boolean; widthOk: boolean; freqOk: boolean }>;
    summaryMsg: string;
  }>({
    checked: false,
    allCorrect: false,
    rowStatus: {},
    summaryMsg: ''
  });

  const [histogramFeedback, setHistogramFeedback] = useState<{
    checked: boolean;
    allCorrect: boolean;
    errors: string[];
  }>({
    checked: false,
    allCorrect: false,
    errors: []
  });

  const [activeBarIdx, setActiveBarIdx] = useState<number>(0);

  // Toggle crossing off a raw number
  const toggleMarkNumber = (idx: number) => {
    setMarkedNumbers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleRowInputChange = (rowId: string, field: 'lower' | 'upper' | 'width' | 'freq', val: string) => {
    const updated = tableRows.map(r => {
      if (r.id !== rowId) return r;
      if (field === 'lower') return { ...r, lowerBoundInput: val };
      if (field === 'upper') return { ...r, upperBoundInput: val };
      if (field === 'width') {
        const num = parseFloat(val) || 6;
        return { ...r, classWidthInput: val, userBarWidth: num };
      }
      if (field === 'freq') {
        const num = parseFloat(val) || 0;
        return { ...r, frequencyInput: val, userBarHeight: num };
      }
      return r;
    });
    onUpdateTableRows(updated);
    setTableFeedback(prev => ({ ...prev, checked: false }));
  };

  // Adjust bar width or height in the histogram builder
  const handleSetBarHeight = (idx: number, delta: number) => {
    const updated = [...tableRows];
    const currentH = updated[idx].userBarHeight || 0;
    const newH = Math.max(0, Math.min(12, currentH + delta));
    updated[idx] = { ...updated[idx], userBarHeight: newH };
    onUpdateTableRows(updated);
    setHistogramFeedback(prev => ({ ...prev, checked: false }));
  };

  const handleSetBarWidth = (idx: number, newW: number) => {
    const updated = [...tableRows];
    updated[idx] = { ...updated[idx], userBarWidth: Math.max(1, Math.min(15, newW)) };
    onUpdateTableRows(updated);
    setHistogramFeedback(prev => ({ ...prev, checked: false }));
  };

  // Check Table Inputs
  const handleCheckTable = () => {
    let allOk = true;
    const statusMap: Record<string, { lowerOk: boolean; upperOk: boolean; widthOk: boolean; freqOk: boolean }> = {};
    let totalEnteredFreq = 0;

    tableRows.forEach(row => {
      const lower = parseFloat(row.lowerBoundInput);
      const upper = parseFloat(row.upperBoundInput);
      const width = parseFloat(row.classWidthInput);
      const freq = parseFloat(row.frequencyInput);

      const lowerOk = lower === row.targetLower;
      const upperOk = upper === row.targetUpper;
      const widthOk = width === row.targetWidth;
      const freqOk = freq === row.targetFreq;

      if (!lowerOk || !upperOk || !widthOk || !freqOk) {
        allOk = false;
      }

      if (!isNaN(freq)) totalEnteredFreq += freq;

      statusMap[row.id] = { lowerOk, upperOk, widthOk, freqOk };
    });

    let summaryMsg = '';
    if (allOk) {
      summaryMsg = 'Outstanding! Every class interval, boundary, class width (6), and frequency count is correct!';
      onTableVerified();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    } else {
      if (totalEnteredFreq !== 30) {
        summaryMsg = `Your total frequency adds up to ${totalEnteredFreq}, but there are 30 students in total. Double check your counts!`;
      } else {
        summaryMsg = 'Check highlighted red cells below. Ensure class length is 6 for every row (Upper − Lower = 6).';
      }
    }

    setTableFeedback({
      checked: true,
      allCorrect: allOk,
      rowStatus: statusMap,
      summaryMsg
    });
  };

  // Auto-fill table for struggling students
  const handleAutoFillTable = () => {
    const updated = tableRows.map(r => ({
      ...r,
      lowerBoundInput: r.targetLower.toString(),
      upperBoundInput: r.targetUpper.toString(),
      classWidthInput: r.targetWidth.toString(),
      frequencyInput: r.targetFreq.toString(),
      userBarWidth: r.targetWidth,
      userBarHeight: r.targetFreq
    }));
    onUpdateTableRows(updated);
    onTableVerified();
    setTableFeedback({
      checked: true,
      allCorrect: true,
      rowStatus: {},
      summaryMsg: 'Table filled with correct Cambridge values. Now build the histogram below!'
    });
    confetti({ particleCount: 50, spread: 50 });
  };

  // Check Student's Histogram Construction
  const handleCheckHistogram = () => {
    const errors: string[] = [];
    tableRows.forEach((r, idx) => {
      const targetW = 6;
      const targetH = r.targetFreq;

      if (r.userBarWidth !== targetW) {
        errors.push(`Bar ${idx + 1} (${r.intervalText}): width is set to ${r.userBarWidth}, but required class length is 6.`);
      }
      if (r.userBarHeight !== targetH) {
        errors.push(`Bar ${idx + 1} (${r.intervalText}): height is ${r.userBarHeight}, but frequency is ${targetH}.`);
      }
    });

    const isAllCorrect = errors.length === 0;
    setHistogramFeedback({
      checked: true,
      allCorrect: isAllCorrect,
      errors
    });

    if (isAllCorrect) {
      onHistogramVerified();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Auto-align histogram bars
  const handleAutoAlignHistogram = () => {
    const updated = tableRows.map(r => ({
      ...r,
      userBarWidth: 6,
      userBarHeight: r.targetFreq
    }));
    onUpdateTableRows(updated);
    onHistogramVerified();
    setHistogramFeedback({
      checked: true,
      allCorrect: true,
      errors: []
    });
    confetti({ particleCount: 60, spread: 60 });
  };

  // Graph Dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const marginLeft = 60;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 60;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const minX = 144;
  const maxX = 180;
  const totalSpan = maxX - minX; // 36
  const maxY = 10;

  const countedCount = Object.values(markedNumbers).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Cambridge 0580 Exam Practice Task
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build a Histogram: Heights of 30 Students
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              You are given single (raw) data of heights of 30 students. Group them with an <strong>equal class length of 6</strong>,
              fill the frequency table, and then build the histogram by setting each bar's <strong>width and height</strong>!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0 min-w-36">
            <div className="text-xs uppercase font-semibold text-blue-200">Exam Requirement</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">Class Length = 6</div>
            <div className="text-[11px] text-blue-100 mt-1">Total Students: 30</div>
          </div>
        </div>
      </div>

      {/* Part 1: Single Raw Data Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-200">
                1
              </span>
              <span>Raw Single Data: 30 Students' Heights (in cm)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click numbers to cross them off as you tally them into the table below ({countedCount} of 30 marked).
            </p>
          </div>

          <button
            onClick={() => setMarkedNumbers({})}
            className="text-xs text-slate-600 hover:text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Crossed Off</span>
          </button>
        </div>

        {/* 30 Badges Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {EXAM_HEIGHTS_DATA.map((val, idx) => {
            const isMarked = markedNumbers[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleMarkNumber(idx)}
                className={`py-2 px-1 text-center font-mono font-bold text-xs sm:text-sm rounded-lg border transition-all cursor-pointer ${
                  isMarked
                    ? 'bg-slate-200 text-slate-400 line-through border-slate-300 scale-95'
                    : 'bg-white text-indigo-900 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-2xs'
                }`}
                title={`Click to toggle counted status (${val} cm)`}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Cambridge Tip:</strong> All intervals have equal length <strong>6</strong>: 
            144 ≤ h &lt; 150, 150 ≤ h &lt; 156, 156 ≤ h &lt; 162, 162 ≤ h &lt; 168, 168 ≤ h &lt; 174, 174 ≤ h ≤ 180.
          </span>
        </div>
      </div>

      {/* Part 2: Student Input Frequency Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-200">
                2
              </span>
              <span>Complete the Frequency Table (Class Length = 6)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Input the Lower Bound, Upper Bound, Class Width, and counted Frequency for each row:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFillTable}
              className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Table Guide</span>
            </button>
            <button
              onClick={handleCheckTable}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check My Table</span>
            </button>
          </div>
        </div>

        {/* The Interactive Input Table */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Class Interval</th>
                <th className="py-2.5 px-3 text-indigo-900">Lower Bound</th>
                <th className="py-2.5 px-3 text-indigo-900">Upper Bound</th>
                <th className="py-2.5 px-3 text-indigo-900">Class Width (w)</th>
                <th className="py-2.5 px-3 text-emerald-800 font-extrabold">Frequency (f)</th>
                <th className="py-2.5 px-3 text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tableRows.map((row) => {
                const rowStatus = tableFeedback.rowStatus[row.id];
                const isChecked = tableFeedback.checked;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {row.intervalText}
                    </td>

                    {/* Lower Bound input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        placeholder="e.g. 144"
                        value={row.lowerBoundInput}
                        onChange={(e) => handleRowInputChange(row.id, 'lower', e.target.value)}
                        className={`w-20 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.lowerOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    {/* Upper Bound input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={row.upperBoundInput}
                        onChange={(e) => handleRowInputChange(row.id, 'upper', e.target.value)}
                        className={`w-20 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.upperOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    {/* Class Width input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        placeholder="6"
                        value={row.classWidthInput}
                        onChange={(e) => handleRowInputChange(row.id, 'width', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.widthOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    {/* Frequency input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        placeholder="Count"
                        value={row.frequencyInput}
                        onChange={(e) => handleRowInputChange(row.id, 'freq', e.target.value)}
                        className={`w-20 px-2 py-1.5 text-xs font-mono font-black rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.freqOk
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-indigo-700'
                        }`}
                      />
                    </td>

                    {/* Status cell */}
                    <td className="py-2.5 px-3">
                      {isChecked && rowStatus ? (
                        rowStatus.lowerOk && rowStatus.upperOk && rowStatus.widthOk && rowStatus.freqOk ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <span>Check values</span>
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-right text-xs text-slate-700">
                  Total Frequency (Σf) must equal 30:
                </td>
                <td colSpan={2} className="py-2.5 px-3 font-mono text-sm text-indigo-900">
                  {tableRows.reduce((sum, r) => sum + (parseFloat(r.frequencyInput) || 0), 0)} / 30
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table Feedback Message */}
        {tableFeedback.checked && (
          <div className={`p-4 border-t ${
            tableFeedback.allCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 text-xs font-medium">
              {tableFeedback.allCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{tableFeedback.summaryMsg}</span>
            </div>
          </div>
        )}
      </div>

      {/* Part 3: Student Builds Histogram (Determining Width & Height) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-200">
                3
              </span>
              <span>Build the Histogram: Determine Width & Height of Each Bar</span>
            </h3>
            <p className="text-xs text-slate-500">
              Use the Cambridge graph canvas below. For each bar, set its <strong>width (class length = 6)</strong> and <strong>height (frequency)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAlignHistogram}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Align Histogram</span>
            </button>
            <button
              onClick={handleCheckHistogram}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check My Histogram</span>
            </button>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="cambridge-grid rounded-2xl border-2 border-indigo-200 p-2 sm:p-4 overflow-x-auto shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[550px] select-none">
            {/* Background Plot Area */}
            <rect
              x={marginLeft}
              y={marginTop}
              width={plotWidth}
              height={plotHeight}
              fill="rgba(255, 255, 255, 0.75)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Horizontal Grid lines (Frequency 0 to 10) */}
            {[0, 2, 4, 6, 8, 10].map((tick) => {
              const yPos = marginTop + plotHeight - (tick / maxY) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={marginLeft}
                    y1={yPos}
                    x2={marginLeft + plotWidth}
                    y2={yPos}
                    stroke="#cbd5e1"
                    strokeWidth={tick === 0 ? '2' : '0.5'}
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
                    {tick}
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

            {/* STUDENT DRAWN HISTOGRAM BARS */}
            {tableRows.map((row, idx) => {
              // Position computed from row.targetLower
              const leftNorm = (row.targetLower - minX) / totalSpan;
              // User determined bar width (normalized)
              const userWidth = row.userBarWidth || 6;
              const widthNorm = userWidth / totalSpan;

              const barX = marginLeft + leftNorm * plotWidth;
              const barW = widthNorm * plotWidth;

              const userH = row.userBarHeight || 0;
              const barHeightPx = (userH / maxY) * plotHeight;
              const barY = marginTop + plotHeight - barHeightPx;

              const isSelected = activeBarIdx === idx;
              const isCorrectHeight = row.userBarHeight === row.targetFreq;
              const isCorrectWidth = row.userBarWidth === 6;

              return (
                <g key={row.id} className="cursor-pointer" onClick={() => setActiveBarIdx(idx)}>
                  {/* The bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barHeightPx}
                    fill={isSelected ? '#4338ca' : isCorrectHeight && isCorrectWidth ? '#4f46e5' : '#6366f1'}
                    stroke="#1e1b4b"
                    strokeWidth="1.5"
                    className="hover:brightness-110 transition-all"
                  />

                  {/* Top drag handle indicator */}
                  <rect
                    x={barX}
                    y={barY - 3}
                    width={barW}
                    height={6}
                    fill="#fbbf24"
                    stroke="#b45309"
                    strokeWidth="1"
                    rx="2"
                  >
                    <title>{`Bar ${idx + 1}: Click to select & adjust`}</title>
                  </rect>

                  {/* Label inside bar */}
                  {barHeightPx > 20 && (
                    <text
                      x={barX + barW / 2}
                      y={barY + barHeightPx / 2 + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      fontSize="11"
                    >
                      f = {userH}
                    </text>
                  )}

                  {/* X Axis Tick at Boundary */}
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
                    {row.targetLower}
                  </text>

                  {/* Last boundary */}
                  {idx === tableRows.length - 1 && (
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
                        {row.targetUpper}
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
              y={marginTop + plotHeight + 46}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="#0f172a"
            >
              Continuous Scale: Height (h cm) — Equal Class Length = 6
            </text>
          </svg>
        </div>

        {/* Interactive Controls: Width & Height Customizer for each bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Interactive Bar Controls (Click a bar below to adjust its Width & Height):
            </span>
            <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Selected: Bar {activeBarIdx + 1} ({tableRows[activeBarIdx]?.intervalText})
            </span>
          </div>

          {/* Cards for each bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {tableRows.map((r, idx) => {
              const isSelected = activeBarIdx === idx;
              const isMatchH = r.userBarHeight === r.targetFreq;
              const isMatchW = r.userBarWidth === 6;

              return (
                <div
                  key={r.id}
                  onClick={() => setActiveBarIdx(idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                      : isMatchH && isMatchW
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-700 truncate">
                    {r.intervalText}
                  </div>

                  {/* Width Control */}
                  <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Width:</span>
                    <span className={`font-mono font-bold ${isMatchW ? 'text-emerald-700' : 'text-amber-600'}`}>
                      w = {r.userBarWidth || 6}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetBarWidth(idx, (r.userBarWidth || 6) - 1); }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      title="Decrease width"
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetBarWidth(idx, 6); }}
                      className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold"
                      title="Set to required 6"
                    >
                      Set 6
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetBarWidth(idx, (r.userBarWidth || 6) + 1); }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      title="Increase width"
                    >
                      +
                    </button>
                  </div>

                  {/* Height Control */}
                  <div className="mt-2.5 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>Height:</span>
                    <span className={`font-mono font-bold text-sm ${isMatchH ? 'text-emerald-700' : 'text-indigo-700'}`}>
                      h = {r.userBarHeight || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetBarHeight(idx, -1); }}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center text-xs font-bold"
                      title="Decrease height"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetBarHeight(idx, 1); }}
                      className="w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center text-xs font-bold shadow-2xs"
                      title="Increase height"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histogram Feedback Banner */}
        {histogramFeedback.checked && (
          <div className={`p-4 rounded-xl border ${
            histogramFeedback.allCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {histogramFeedback.allCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  {histogramFeedback.allCorrect
                    ? 'Excellent Work! Your Histogram is 100% Correct!'
                    : 'Review the following adjustments:'}
                </h4>
                {histogramFeedback.allCorrect ? (
                  <p className="text-xs text-emerald-800">
                    Each bar has equal width 6, all adjacent bars touch seamlessly without gaps, and every height matches the frequency.
                  </p>
                ) : (
                  <ul className="text-xs space-y-0.5 list-disc pl-4 text-amber-900">
                    {histogramFeedback.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Step Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            <strong>Exam Practice Complete!</strong> You grouped single continuous data into equal class lengths of 6 and constructed the touching histogram.
          </div>

          <button
            onClick={onGoToExport}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 5: Download PDF Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
