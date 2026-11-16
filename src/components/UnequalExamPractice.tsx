import React, { useState } from 'react';
import { UnequalExamRow } from '../types';
import {
  UNEQUAL_EXAM_DATA,
  UNEQUAL_WIDTH_PRESETS,
  buildUnequalExamRows
} from '../data/curriculumData';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Wand2,
  Lightbulb,
  Download,
  Scale,
  Sliders
} from 'lucide-react';

interface UnequalExamPracticeProps {
  tableRows: UnequalExamRow[];
  onUpdateTableRows: (rows: UnequalExamRow[]) => void;
  onTableVerified: () => void;
  isTableVerified: boolean;
  onHistogramVerified: () => void;
  isHistogramVerified: boolean;
  onDownloadPdf: () => void;
  onGoToExport: () => void;
}

export const UnequalExamPractice: React.FC<UnequalExamPracticeProps> = ({
  tableRows,
  onUpdateTableRows,
  onTableVerified,
  isTableVerified,
  onHistogramVerified,
  isHistogramVerified,
  onDownloadPdf,
  onGoToExport
}) => {
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, boolean>>({});
  const [tableFeedback, setTableFeedback] = useState<{
    checked: boolean;
    allCorrect: boolean;
    rowStatus: Record<
      string,
      {
        intervalOk: boolean;
        lowerOk: boolean;
        upperOk: boolean;
        widthOk: boolean;
        freqOk: boolean;
        densityOk: boolean;
      }
    >;
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
  const [lastActiveRowId, setLastActiveRowId] = useState<string>(tableRows[0]?.id || 'urow-1');

  const safeActiveBarIdx = Math.min(activeBarIdx, Math.max(0, tableRows.length - 1));
  const currentStartBound = tableRows[0]?.targetLower ?? 0;
  const currentTargetWidths = tableRows.map((r) => r.targetWidth);
  const currentTotalTargetUpper = tableRows[tableRows.length - 1]?.targetUpper ?? 45;
  const minExamData = Math.min(...UNEQUAL_EXAM_DATA); // 3
  const maxExamData = Math.max(...UNEQUAL_EXAM_DATA); // 44
  const arrangedHasDifferentWidths = new Set(currentTargetWidths).size >= 2;
  const arrangedCoversAllData = currentStartBound <= minExamData && currentTotalTargetUpper >= maxExamData;

  const rebuildWithWidths = (widths: number[], startBound: number) => {
    const rebuilt = buildUnequalExamRows(widths, startBound);
    onUpdateTableRows(rebuilt);
    setTableFeedback({ checked: false, allCorrect: false, rowStatus: {}, summaryMsg: '' });
    setHistogramFeedback({ checked: false, allCorrect: false, errors: [] });
    setActiveBarIdx(0);
    setLastActiveRowId(rebuilt[0]?.id || 'urow-1');
  };

  const handleApplyPreset = (widths: number[], start: number) => {
    rebuildWithWidths(widths, start);
  };

  const handleChangeArrangedGroupWidth = (idx: number, newW: number) => {
    const clamped = Math.max(2, Math.min(30, Math.round(newW)));
    const nextWidths = currentTargetWidths.map((w, i) => (i === idx ? clamped : w));
    rebuildWithWidths(nextWidths, currentStartBound);
  };

  const handleChangeStartBound = (newStart: number) => {
    const clamped = Math.max(0, Math.min(minExamData, Math.round(newStart)));
    rebuildWithWidths(currentTargetWidths, clamped);
  };

  const handleAddGroup = () => {
    if (tableRows.length >= 7) return;
    const nextWidths = [...currentTargetWidths, 10];
    rebuildWithWidths(nextWidths, currentStartBound);
  };

  const handleRemoveGroup = () => {
    if (tableRows.length <= 3) return;
    const nextWidths = currentTargetWidths.slice(0, -1);
    rebuildWithWidths(nextWidths, currentStartBound);
  };

  const toggleMarkNumber = (idx: number) => {
    setMarkedNumbers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const checkIntervalString = (input: string, lower: number, upper: number) => {
    if (!input || !input.trim()) return false;
    const clean = input.replace(/\s+/g, '').toLowerCase();
    return clean.includes(lower.toString()) && clean.includes(upper.toString());
  };

  // Support either the arranged unequal intervals OR any valid continuous unequal-width partition entered directly in the table
  const getEffectiveBounds = () => {
    const parsed = tableRows.map((r) => ({
      lower: parseFloat(r.lowerBoundInput),
      upper: parseFloat(r.upperBoundInput),
      width: parseFloat(r.classWidthInput)
    }));

    const allBoundsValid = parsed.every(
      (p, idx) =>
        !isNaN(p.lower) &&
        !isNaN(p.upper) &&
        p.upper > p.lower &&
        (idx === 0 || Math.abs(p.lower - parsed[idx - 1].upper) < 0.001)
    );

    const widths = parsed.map((p) => Number((p.upper - p.lower).toFixed(2)));
    const hasDifferentWidths = new Set(widths).size >= 2;

    const coversAllData =
      allBoundsValid &&
      hasDifferentWidths &&
      parsed.length > 0 &&
      parsed[0].lower <= minExamData &&
      parsed[parsed.length - 1].upper >= maxExamData;

    if (coversAllData) {
      return parsed.map((p, idx) => {
        const isLast = idx === parsed.length - 1;
        const w = Number((p.upper - p.lower).toFixed(2));
        const expectedFreq = UNEQUAL_EXAM_DATA.filter((val) =>
          isLast ? val >= p.lower && val <= p.upper : val >= p.lower && val < p.upper
        ).length;
        const expectedDensity = Number((expectedFreq / w).toFixed(2));
        return {
          lower: p.lower,
          upper: p.upper,
          width: w,
          expectedFreq,
          expectedDensity,
          isCustomValid: true
        };
      });
    }

    return tableRows.map((r) => ({
      lower: r.targetLower,
      upper: r.targetUpper,
      width: r.targetWidth,
      expectedFreq: r.targetFreq,
      expectedDensity: r.targetDensity,
      isCustomValid: false
    }));
  };

  const effectiveBounds = getEffectiveBounds();

  const handleRowInputChange = (
    rowId: string,
    field: 'interval' | 'lower' | 'upper' | 'width' | 'freq' | 'density',
    val: string
  ) => {
    setLastActiveRowId(rowId);
    const updated = tableRows.map((r) => {
      if (r.id !== rowId) return r;
      if (field === 'interval') return { ...r, intervalInput: val };
      if (field === 'lower') return { ...r, lowerBoundInput: val };
      if (field === 'upper') return { ...r, upperBoundInput: val };
      if (field === 'width') {
        const num = parseFloat(val);
        return {
          ...r,
          classWidthInput: val,
          userBarWidth: !isNaN(num) && num > 0 ? num : r.userBarWidth
        };
      }
      if (field === 'freq') return { ...r, frequencyInput: val };
      if (field === 'density') {
        const num = parseFloat(val);
        return {
          ...r,
          frequencyDensityInput: val,
          userBarDensity: !isNaN(num) && num >= 0 ? num : r.userBarDensity
        };
      }
      return r;
    });
    onUpdateTableRows(updated);
    setTableFeedback((prev) => ({ ...prev, checked: false }));
  };

  const handleInsertSymbol = (sym: string) => {
    const targetRow = tableRows.find((r) => r.id === lastActiveRowId) || tableRows[0];
    if (!targetRow) return;
    handleRowInputChange(targetRow.id, 'interval', (targetRow.intervalInput || '') + sym);
  };

  // Dynamic Y-scale for Frequency Density
  const maxDensityVal = Math.max(
    ...effectiveBounds.map((b) => b.expectedDensity),
    ...tableRows.map((r) => r.userBarDensity || 0),
    1.6
  );
  const maxY = Math.max(2.0, Math.ceil((maxDensityVal + 0.2) / 0.4) * 0.4);
  const yTickStep = maxY <= 2.4 ? 0.4 : 0.5;
  const yTicks: number[] = [];
  for (let t = 0; t <= maxY + 0.001; t += yTickStep) {
    yTicks.push(Number(t.toFixed(1)));
  }

  const handleSetBarWidth = (idx: number, newW: number) => {
    const updated = [...tableRows];
    updated[idx] = {
      ...updated[idx],
      userBarWidth: Math.max(1, Math.min(30, Number(newW.toFixed(1))))
    };
    onUpdateTableRows(updated);
    setHistogramFeedback((prev) => ({ ...prev, checked: false }));
  };

  const handleSetBarDensity = (idx: number, newD: number) => {
    const updated = [...tableRows];
    const clamped = Math.max(0, Math.min(maxY + 0.4, Number(newD.toFixed(2))));
    updated[idx] = { ...updated[idx], userBarDensity: clamped };
    onUpdateTableRows(updated);
    setHistogramFeedback((prev) => ({ ...prev, checked: false }));
  };

  // Check Table Inputs
  const handleCheckTable = () => {
    let allOk = true;
    const statusMap: Record<
      string,
      {
        intervalOk: boolean;
        lowerOk: boolean;
        upperOk: boolean;
        widthOk: boolean;
        freqOk: boolean;
        densityOk: boolean;
      }
    > = {};
    let totalEnteredFreq = 0;
    const enteredWidths: number[] = [];
    let overlapOrGapError = '';

    tableRows.forEach((row, idx) => {
      const target = effectiveBounds[idx];
      const lower = parseFloat(row.lowerBoundInput);
      const upper = parseFloat(row.upperBoundInput);
      const width = parseFloat(row.classWidthInput);
      const freq = parseFloat(row.frequencyInput);
      const density = parseFloat(row.frequencyDensityInput);

      if (idx > 0 && !isNaN(lower)) {
        const prevUpper = parseFloat(tableRows[idx - 1].upperBoundInput);
        if (!isNaN(prevUpper)) {
          if (lower < prevUpper) {
            overlapOrGapError = `Row ${idx + 1} Lower Bound (${lower}) overlaps Row ${idx} Upper Bound (${prevUpper}). Continuous intervals must not overlap!`;
          } else if (lower > prevUpper) {
            overlapOrGapError = `Gap between Row ${idx} Upper Bound (${prevUpper}) and Row ${idx + 1} Lower Bound (${lower}). Continuous intervals must touch!`;
          }
        }
      }

      const intervalOk = checkIntervalString(row.intervalInput, target.lower, target.upper);
      const lowerOk = !isNaN(lower) && Math.abs(lower - target.lower) < 0.001;
      const upperOk = !isNaN(upper) && Math.abs(upper - target.upper) < 0.001;
      const widthOk = !isNaN(width) && Math.abs(width - target.width) < 0.001;
      const freqOk = !isNaN(freq) && freq === target.expectedFreq;
      const exactFD = target.expectedFreq / target.width;
      const densityOk = !isNaN(density) && Math.abs(density - exactFD) <= 0.02;

      if (!intervalOk || !lowerOk || !upperOk || !widthOk || !freqOk || !densityOk) {
        allOk = false;
      }

      if (!isNaN(freq)) totalEnteredFreq += freq;
      if (!isNaN(width)) enteredWidths.push(width);

      statusMap[row.id] = { intervalOk, lowerOk, upperOk, widthOk, freqOk, densityOk };
    });

    const hasDistinctWidths = new Set(enteredWidths).size >= 2;
    if (!hasDistinctWidths) {
      allOk = false;
    }

    let summaryMsg = '';
    if (overlapOrGapError) {
      allOk = false;
      summaryMsg = overlapOrGapError;
    } else if (allOk) {
      summaryMsg =
        'Fantastic! Every class interval, boundary, different class width, frequency, and frequency density is 100% accurate!';
      onTableVerified();
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.5 } });
    } else if (!hasDistinctWidths && enteredWidths.length === tableRows.length) {
      summaryMsg =
        'Remember: Section 7 requires DIFFERENT class widths (not all equal). Arrange at least 2 different widths above or in your table.';
    } else if (totalEnteredFreq !== 30) {
      summaryMsg = `Your total frequency adds up to ${totalEnteredFreq}, but there are 30 reading times. Double-check your tallies (make sure your intervals cover ${minExamData} to ${maxExamData})!`;
    } else {
      summaryMsg =
        'Check any red cells. Remember: Class Width = Upper − Lower, and Frequency Density = Frequency ÷ Class Width.';
    }

    setTableFeedback({
      checked: true,
      allCorrect: allOk,
      rowStatus: statusMap,
      summaryMsg
    });
  };

  // Auto-fill table guide using the student's arranged widths
  const handleAutoFillTable = () => {
    const updated = tableRows.map((r) => ({
      ...r,
      intervalInput: r.intervalText,
      lowerBoundInput: r.targetLower.toString(),
      upperBoundInput: r.targetUpper.toString(),
      classWidthInput: r.targetWidth.toString(),
      frequencyInput: r.targetFreq.toString(),
      frequencyDensityInput: r.targetDensity.toString(),
      userBarWidth: r.targetWidth,
      userBarDensity: r.targetDensity
    }));
    onUpdateTableRows(updated);
    if (arrangedHasDifferentWidths && arrangedCoversAllData) {
      onTableVerified();
    }
    setTableFeedback({
      checked: true,
      allCorrect: arrangedHasDifferentWidths && arrangedCoversAllData,
      rowStatus: {},
      summaryMsg:
        arrangedHasDifferentWidths && arrangedCoversAllData
          ? `Table filled for your arranged widths (${currentTargetWidths.join(', ')}). Check or adjust the histogram bars below!`
          : `Table filled, but please make sure your arranged widths have at least 2 different sizes and cover ${minExamData} to ${maxExamData}.`
    });
    confetti({ particleCount: 50, spread: 50 });
  };

  // Check Histogram Bars
  const handleCheckHistogram = () => {
    const errors: string[] = [];
    const widthsUsed: number[] = [];

    tableRows.forEach((r, idx) => {
      const target = effectiveBounds[idx];
      const label = r.intervalInput || `${target.lower} ≤ t < ${target.upper}`;
      widthsUsed.push(r.userBarWidth);

      if (Math.abs((r.userBarWidth || 0) - target.width) > 0.05) {
        errors.push(
          `Bar ${idx + 1} (${label}): drawn width is ${r.userBarWidth}, but class width is ${target.width}.`
        );
      }
      if (Math.abs((r.userBarDensity || 0) - target.expectedDensity) > 0.05) {
        errors.push(
          `Bar ${idx + 1} (${label}): drawn height (FD) is ${r.userBarDensity}, but Frequency Density is ${target.expectedDensity}.`
        );
      }
    });

    if (new Set(widthsUsed).size < 2) {
      errors.push('Make sure your histogram uses different bar widths matching your table!');
    }
    if (!arrangedCoversAllData && !effectiveBounds.every((b) => b.isCustomValid)) {
      errors.push(`Make sure your intervals cover all values from ${minExamData} to ${maxExamData}.`);
    }

    const allCorrect = errors.length === 0;
    setHistogramFeedback({
      checked: true,
      allCorrect,
      errors
    });

    if (allCorrect) {
      onHistogramVerified();
      confetti({ particleCount: 95, spread: 85, origin: { y: 0.6 } });
    }
  };

  const handleAutoAlignHistogram = () => {
    const updated = tableRows.map((r, idx) => ({
      ...r,
      userBarWidth: effectiveBounds[idx].width,
      userBarDensity: effectiveBounds[idx].expectedDensity
    }));
    onUpdateTableRows(updated);
    if (arrangedHasDifferentWidths && arrangedCoversAllData) {
      onHistogramVerified();
    }
    setHistogramFeedback({
      checked: true,
      allCorrect: arrangedHasDifferentWidths && arrangedCoversAllData,
      errors: arrangedHasDifferentWidths && arrangedCoversAllData
        ? []
        : [`Ensure your arranged groups have different widths and cover ${minExamData} to ${maxExamData}.`]
    });
    confetti({ particleCount: 60, spread: 60 });
  };

  // SVG layout with sequential non-overlapping bars
  const svgWidth = 720;
  const svgHeight = 365;
  const marginLeft = 65;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 65;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const minX = effectiveBounds[0]?.lower ?? 0;
  const maxBoundX = effectiveBounds[effectiveBounds.length - 1]?.upper ?? 45;

  let cursorX = minX;
  const barGeometries = tableRows.map((row) => {
    const w = Math.max(1, row.userBarWidth || 5);
    const start = cursorX;
    const end = start + w;
    cursorX = end;
    return { start, end, w };
  });
  const drawnMaxX = cursorX;
  const totalSpan = Math.max(1, drawnMaxX - minX, maxBoundX - minX);
  const countedCount = Object.values(markedNumbers).filter(Boolean).length;

  const barCardsGridClass =
    tableRows.length <= 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : tableRows.length === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : tableRows.length === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-purple-100">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Section 7 • Cambridge 0580 Unequal-Width Exam Practice
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unequal Class Widths: Reading Times of 30 Students
            </h2>
            <p className="text-purple-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Arrange your own <strong>different class widths</strong>, complete all 6 columns including{' '}
              <strong>Frequency Density</strong>, and build your histogram with touching, non-overlapping bars!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0 min-w-44">
            <div className="text-xs uppercase font-semibold text-purple-200">Key Formula</div>
            <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5 font-mono">
              FD = f ÷ Width
            </div>
            <div className="text-[11px] text-purple-100 mt-1">
              {tableRows.length} Unequal Groups • Total: 30
            </div>
          </div>
        </div>
      </div>

      {/* Step A: Arrange Different Class Widths */}
      <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Step A: Arrange Your Different Class Widths</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pick a quick unequal layout or adjust each group's width below. Groups automatically touch without overlapping!
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {UNEQUAL_WIDTH_PRESETS.map((preset) => {
              const isActive =
                preset.start === currentStartBound &&
                preset.widths.length === currentTargetWidths.length &&
                preset.widths.every((w, i) => w === currentTargetWidths[i]);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.widths, preset.start)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Width Arranger per Group */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Start Bound:</span>
              <button
                type="button"
                onClick={() => handleChangeStartBound(currentStartBound - 1)}
                className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold cursor-pointer"
              >
                -1
              </button>
              <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                {currentStartBound}
              </span>
              <button
                type="button"
                onClick={() => handleChangeStartBound(currentStartBound + 1)}
                className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold cursor-pointer"
              >
                +1
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddGroup}
                disabled={tableRows.length >= 7}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-purple-700 hover:bg-purple-50 disabled:opacity-40 cursor-pointer"
              >
                + Add Group
              </button>
              <button
                type="button"
                onClick={handleRemoveGroup}
                disabled={tableRows.length <= 3}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 cursor-pointer"
              >
                − Remove Group
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tableRows.map((r, idx) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 px-3 py-2 flex flex-col items-center gap-1 min-w-28"
              >
                <span className="text-[11px] font-bold text-slate-500">Group {idx + 1}</span>
                <span className="text-[11px] font-mono font-semibold text-slate-700">
                  {r.targetLower} to {r.targetUpper}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleChangeArrangedGroupWidth(idx, r.targetWidth - 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={r.targetWidth}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) handleChangeArrangedGroupWidth(idx, val);
                    }}
                    className="w-11 text-center font-mono text-xs font-bold py-0.5 border border-slate-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleChangeArrangedGroupWidth(idx, r.targetWidth + 1)}
                    className="w-6 h-6 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <span className="text-slate-600">
              Arranged Span: <strong className="font-mono text-slate-900">{currentStartBound} to {currentTotalTargetUpper}</strong>{' '}
              (Widths: <strong className="font-mono text-purple-800">{currentTargetWidths.join(', ')}</strong>)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  arrangedCoversAllData
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {arrangedCoversAllData
                  ? `Covers ${minExamData}–${maxExamData} ✓`
                  : `Extend widths to reach ${maxExamData}`}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  arrangedHasDifferentWidths
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {arrangedHasDifferentWidths ? 'Different widths ✓' : 'Make ≥ 2 widths different'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Raw Single Data */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center border border-purple-200">
                1
              </span>
              <span>Raw Single Data: Daily Reading Time (t minutes) of 30 Students</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any number to cross it off as you tally ({countedCount} of 30 marked).
            </p>
          </div>

          <button
            onClick={() => setMarkedNumbers({})}
            className="text-xs text-slate-600 hover:text-purple-600 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Crossed Off</span>
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {UNEQUAL_EXAM_DATA.map((val, idx) => {
            const isMarked = markedNumbers[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleMarkNumber(idx)}
                className={`py-2 px-1 text-center font-mono font-bold text-xs sm:text-sm rounded-lg border transition-all cursor-pointer ${
                  isMarked
                    ? 'bg-slate-200 text-slate-400 line-through border-slate-300 scale-95'
                    : 'bg-white text-purple-900 border-purple-200 hover:border-purple-400 hover:bg-purple-50 shadow-2xs'
                }`}
                title={`Click to toggle counted status (${val} min)`}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div className="flex items-start sm:items-center gap-2 text-xs text-purple-950 bg-purple-50 p-3 rounded-xl border border-purple-200">
          <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Cambridge Tip:</strong> Minimum is <strong>{minExamData}</strong> and maximum is{' '}
            <strong>{maxExamData}</strong>. Your arranged groups currently span{' '}
            <strong>{currentStartBound}</strong> to <strong>{currentTotalTargetUpper}</strong> using widths{' '}
            <strong>{currentTargetWidths.join(', ')}</strong>.
          </span>
        </div>
      </div>

      {/* Part 2: 6-Column Frequency & Frequency Density Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center border border-purple-200">
                2
              </span>
              <span>Complete the Frequency Density Table (Different Class Widths)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Fill in Class Interval, Lower Bound, Upper Bound, Class Width, Frequency, and Frequency Density (f ÷ w):
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFillTable}
              className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Table Guide</span>
            </button>
            <button
              onClick={handleCheckTable}
              className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check My Table</span>
            </button>
          </div>
        </div>

        {/* Quick Symbols */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 text-xs text-slate-600 bg-slate-50/80 border-b border-slate-200">
          <span className="font-semibold text-slate-700">Quick Symbols:</span>
          <button
            type="button"
            onClick={() => handleInsertSymbol(' ≤ ')}
            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-mono font-bold rounded-md border border-slate-300 hover:border-purple-400 shadow-2xs transition-colors cursor-pointer"
          >
            + ≤
          </button>
          <button
            type="button"
            onClick={() => handleInsertSymbol(' < ')}
            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-mono font-bold rounded-md border border-slate-300 hover:border-purple-400 shadow-2xs transition-colors cursor-pointer"
          >
            + &lt;
          </button>
          <button
            type="button"
            onClick={() => handleInsertSymbol('t')}
            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-mono font-bold rounded-md border border-slate-300 hover:border-purple-400 shadow-2xs transition-colors cursor-pointer"
          >
            + t
          </button>
          <button
            type="button"
            onClick={() => handleInsertSymbol(' ≤ t < ')}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-mono font-bold rounded-md border border-purple-200 shadow-2xs transition-colors cursor-pointer"
          >
            + ≤ t &lt;
          </button>
          <span className="text-[11px] text-slate-400 ml-1">(Appends to currently selected row)</span>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2.5 text-purple-950 font-extrabold">Class Interval</th>
                <th className="py-2.5 px-2.5">Lower Bound</th>
                <th className="py-2.5 px-2.5">Upper Bound</th>
                <th className="py-2.5 px-2.5 text-amber-800">Class Width (w)</th>
                <th className="py-2.5 px-2.5 text-blue-800">Frequency (f)</th>
                <th className="py-2.5 px-2.5 text-purple-800 font-extrabold">Freq Density (f ÷ w)</th>
                <th className="py-2.5 px-2.5 text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tableRows.map((row, idx) => {
                const rowStatus = tableFeedback.rowStatus[row.id];
                const isChecked = tableFeedback.checked;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5">
                      <input
                        type="text"
                        placeholder={idx === 0 ? `e.g. ${row.intervalText}` : 'Enter interval...'}
                        value={row.intervalInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'interval', e.target.value)}
                        className={`w-32 sm:w-36 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.intervalOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      <input
                        type="number"
                        placeholder={idx === 0 ? `${row.targetLower}` : ''}
                        value={row.lowerBoundInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'lower', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.lowerOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      <input
                        type="number"
                        placeholder={idx === 0 ? `${row.targetUpper}` : ''}
                        value={row.upperBoundInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'upper', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.upperOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      <input
                        type="number"
                        placeholder="Width"
                        value={row.classWidthInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'width', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-xs font-mono font-bold rounded-lg border focus:ring-2 focus:ring-amber-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.widthOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-amber-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      <input
                        type="number"
                        placeholder="Freq"
                        value={row.frequencyInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'freq', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-xs font-mono font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.freqOk
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-blue-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="f ÷ w"
                        value={row.frequencyDensityInput}
                        onFocus={() => setLastActiveRowId(row.id)}
                        onChange={(e) => handleRowInputChange(row.id, 'density', e.target.value)}
                        className={`w-20 px-2 py-1.5 text-xs font-mono font-black rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ${
                          isChecked && rowStatus
                            ? rowStatus.densityOk
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-white border-slate-300 text-purple-800'
                        }`}
                      />
                    </td>

                    <td className="py-2.5 px-2.5">
                      {isChecked && rowStatus ? (
                        rowStatus.intervalOk &&
                        rowStatus.lowerOk &&
                        rowStatus.upperOk &&
                        rowStatus.widthOk &&
                        rowStatus.freqOk &&
                        rowStatus.densityOk ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600">Check cells</span>
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
                <td colSpan={3} className="py-2.5 px-3 font-mono text-sm text-purple-900">
                  {tableRows.reduce((sum, r) => sum + (parseFloat(r.frequencyInput) || 0), 0)} / 30
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {tableFeedback.checked && (
          <div
            className={`p-4 border-t ${
              tableFeedback.allCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
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

      {/* Part 3: Unequal-Width Histogram Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center border border-purple-200">
                3
              </span>
              <span>Build the Histogram: Set Each Bar's Width &amp; Frequency Density</span>
            </h3>
            <p className="text-xs text-slate-500">
              Adjust each bar's <strong>Class Width (w)</strong> and <strong>Height (Frequency Density)</strong>. Bars align seamlessly without gaps or overlaps!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAlignHistogram}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Align Histogram</span>
            </button>
            <button
              onClick={handleCheckHistogram}
              className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check My Histogram</span>
            </button>
          </div>
        </div>

        {/* SVG Graph Canvas (Sequential Non-Overlapping Layout) */}
        <div className="cambridge-grid rounded-2xl border-2 border-purple-200 p-2 sm:p-4 overflow-x-auto shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[550px] select-none">
            <rect
              x={marginLeft}
              y={marginTop}
              width={plotWidth}
              height={plotHeight}
              fill="rgba(255, 255, 255, 0.78)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {yTicks.map((tick) => {
              const yPos = marginTop + plotHeight - (tick / maxY) * plotHeight;
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

            <text
              x={18}
              y={marginTop + plotHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 18 ${marginTop + plotHeight / 2})`}
              fontSize="12"
              fontWeight="bold"
              fill="#581c87"
            >
              Frequency Density
            </text>

            {/* Student Drawn Bars (Sequential Non-Overlapping) */}
            {(() => {
              let lastLabelX = -Infinity;
              return tableRows.map((row, idx) => {
                const bounds = effectiveBounds[idx];
                const geom = barGeometries[idx];
                const leftNorm = (geom.start - minX) / totalSpan;
                const widthNorm = geom.w / totalSpan;

                const barX = marginLeft + leftNorm * plotWidth;
                const barW = widthNorm * plotWidth;

                const userFD = row.userBarDensity || 0;
                const barHeightPx = (userFD / maxY) * plotHeight;
                const barY = marginTop + plotHeight - barHeightPx;

                const isSelected = safeActiveBarIdx === idx;
                const isMatchW = Math.abs(geom.w - bounds.width) <= 0.05;
                const isMatchFD = Math.abs(userFD - bounds.expectedDensity) <= 0.05;
                const areaVal = Number((geom.w * userFD).toFixed(1));

                const staggerStartTick = barX - lastLabelX < 24;
                lastLabelX = barX;

                const endX = barX + barW;
                const staggerEndTick = endX - lastLabelX < 24;

                return (
                  <g key={row.id} className="cursor-pointer" onClick={() => setActiveBarIdx(idx)}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barW}
                      height={barHeightPx}
                      fill={isSelected ? '#6d28d9' : isMatchW && isMatchFD ? '#7c3aed' : '#8b5cf6'}
                      stroke="#2e1065"
                      strokeWidth="1.5"
                      className="hover:brightness-110 transition-all"
                    />

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
                      <title>{`Bar ${idx + 1}: Width=${geom.w}, FD=${userFD}`}</title>
                    </rect>

                    {barHeightPx >= 30 && barW >= 46 ? (
                      <>
                        <text
                          x={barX + barW / 2}
                          y={barY + barHeightPx / 2 - 2}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          fontSize="10"
                        >
                          FD={userFD.toFixed(1)}
                        </text>
                        <text
                          x={barX + barW / 2}
                          y={barY + barHeightPx / 2 + 11}
                          textAnchor="middle"
                          fill="#fef3c7"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          fontSize="9"
                        >
                          A={areaVal}
                        </text>
                      </>
                    ) : barHeightPx >= 20 && barW >= 24 ? (
                      <text
                        x={barX + barW / 2}
                        y={barY + barHeightPx / 2 + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        fontSize="10"
                      >
                        {userFD.toFixed(1)}
                      </text>
                    ) : userFD > 0 ? (
                      <text
                        x={barX + barW / 2}
                        y={Math.max(marginTop + 10, barY - 8)}
                        textAnchor="middle"
                        fill="#581c87"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        fontSize="9.5"
                      >
                        {userFD.toFixed(1)}
                      </text>
                    ) : null}

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
                      y={marginTop + plotHeight + (staggerStartTick ? 31 : 20)}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      fill="#1e293b"
                    >
                      {Number(geom.start.toFixed(1))}
                    </text>

                    {idx === tableRows.length - 1 && (
                      <>
                        <line
                          x1={endX}
                          y1={marginTop + plotHeight}
                          x2={endX}
                          y2={marginTop + plotHeight + 6}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                        <text
                          x={endX}
                          y={marginTop + plotHeight + (staggerEndTick ? 31 : 20)}
                          textAnchor="middle"
                          fontSize="11"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          fill="#1e293b"
                        >
                          {Number(geom.end.toFixed(1))}
                        </text>
                      </>
                    )}
                  </g>
                );
              });
            })()}

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
              y={marginTop + plotHeight + 50}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="#0f172a"
            >
              Daily Reading Time (t minutes) — Unequal Class Widths
            </text>
          </svg>
        </div>

        {/* Interactive Bar Controls */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Interactive Bar Controls (Set each bar's Width &amp; Frequency Density Height):</span>
            </span>
            <span className="text-xs text-purple-800 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Selected: Bar {safeActiveBarIdx + 1} (
              {tableRows[safeActiveBarIdx]?.intervalInput ||
                `${effectiveBounds[safeActiveBarIdx]?.lower} ≤ t < ${effectiveBounds[safeActiveBarIdx]?.upper}`}
              )
            </span>
          </div>

          <div className={`grid ${barCardsGridClass} gap-3`}>
            {tableRows.map((r, idx) => {
              const bounds = effectiveBounds[idx];
              const isSelected = safeActiveBarIdx === idx;
              const isMatchW = Math.abs((r.userBarWidth || 0) - bounds.width) <= 0.05;
              const isMatchFD = Math.abs((r.userBarDensity || 0) - bounds.expectedDensity) <= 0.05;
              const displayLabel =
                r.intervalInput ||
                (idx === tableRows.length - 1
                  ? `${bounds.lower} ≤ t ≤ ${bounds.upper}`
                  : `${bounds.lower} ≤ t < ${bounds.upper}`);
              const areaCheck = Number(((r.userBarWidth || 0) * (r.userBarDensity || 0)).toFixed(1));

              return (
                <div
                  key={r.id}
                  onClick={() => setActiveBarIdx(idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200'
                      : isMatchW && isMatchFD
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-700 truncate" title={displayLabel}>
                    {displayLabel}
                  </div>

                  {/* Bar Width Controls */}
                  <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Width (w):</span>
                    <span className={`font-mono font-bold ${isMatchW ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {r.userBarWidth || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetBarWidth(idx, (r.userBarWidth || 5) - 1);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={r.userBarWidth || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) handleSetBarWidth(idx, v);
                      }}
                      className="w-12 text-center font-mono text-xs font-bold py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetBarWidth(idx, (r.userBarWidth || 5) + 1);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                    >
                      +1
                    </button>
                  </div>

                  {/* Bar Frequency Density Height Controls */}
                  <div className="mt-2.5 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>Height (FD):</span>
                    <span className={`font-mono font-bold ${isMatchFD ? 'text-emerald-700' : 'text-purple-700'}`}>
                      {(r.userBarDensity || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetBarDensity(idx, (r.userBarDensity || 0) - 0.1);
                      }}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center text-xs font-bold cursor-pointer"
                      title="Decrease FD by 0.1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={maxY}
                      value={r.userBarDensity}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) handleSetBarDensity(idx, v);
                      }}
                      className="w-12 text-center font-mono text-xs font-bold py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetBarDensity(idx, (r.userBarDensity || 0) + 0.1);
                      }}
                      className="w-6 h-6 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center text-xs font-bold shadow-2xs cursor-pointer"
                      title="Increase FD by 0.1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    Area = <strong>{areaCheck}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histogram Feedback Banner */}
        {histogramFeedback.checked && (
          <div
            className={`p-4 rounded-xl border ${
              histogramFeedback.allCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {histogramFeedback.allCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  {histogramFeedback.allCorrect
                    ? 'Outstanding! Your Unequal-Width Histogram is 100% Correct!'
                    : 'Review the following adjustments:'}
                </h4>
                {histogramFeedback.allCorrect ? (
                  <p className="text-xs text-emerald-800">
                    Every bar has the exact class width, touches its neighbour with zero gaps or overlaps, and has height equal to Frequency Density so Area = Frequency!
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

        {/* Section 7 Download & Next Step CTA */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            {isTableVerified && isHistogramVerified ? (
              <span>
                <strong>Section 7 Complete!</strong> Download your Section 7 PDF directly or visit the PDF Hub.
              </span>
            ) : (
              <span>
                Verify your table and unequal-width histogram above, or download your current Section 7 worksheet as PDF anytime.
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onDownloadPdf}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Section 7 PDF</span>
            </button>

            <button
              onClick={onGoToExport}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Section 8: PDF Download Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
