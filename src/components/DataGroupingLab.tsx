import React, { useState, useMemo } from 'react';
import { DatasetPreset, GroupedInterval } from '../types';
import { DATASET_PRESETS } from '../data/curriculumData';
import confetti from 'canvas-confetti';
import { 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  RotateCcw,
  Sliders,
  Check,
  ListOrdered
} from 'lucide-react';

interface DataGroupingLabProps {
  selectedDataset: DatasetPreset;
  onSelectDataset: (preset: DatasetPreset) => void;
  intervalWidth: number;
  onChangeIntervalWidth: (width: number) => void;
  onSaveGroupedIntervals: (intervals: GroupedInterval[]) => void;
  onGoToHistogram: () => void;
  isCompleted: boolean;
}

export const DataGroupingLab: React.FC<DataGroupingLabProps> = ({
  selectedDataset,
  onSelectDataset,
  intervalWidth,
  onChangeIntervalWidth,
  onSaveGroupedIntervals,
  onGoToHistogram,
  isCompleted
}) => {
  const [tallyStep, setTallyStep] = useState<number>(0); // 0 = start, > 0 = step through
  const [isAutoTallying, setIsAutoTallying] = useState<boolean>(false);
  const [selectedRawNumberIndex, setSelectedRawNumberIndex] = useState<number | null>(null);

  // Calculate min, max, range of the dataset
  const sortedData = useMemo(() => {
    return [...selectedDataset.rawData].sort((a, b) => a - b);
  }, [selectedDataset]);

  const minVal = sortedData[0];
  const maxVal = sortedData[sortedData.length - 1];
  const dataRange = Math.round((maxVal - minVal) * 10) / 10;

  // Determine starting lower bound rounded down to a convenient multiple of intervalWidth
  const startBound = Math.floor(minVal / intervalWidth) * intervalWidth;
  const endBound = Math.ceil((maxVal + 0.001) / intervalWidth) * intervalWidth;

  // Generate intervals based on the chosen equal class width
  const generatedIntervals: GroupedInterval[] = useMemo(() => {
    const list: GroupedInterval[] = [];
    let currentLower = startBound;

    while (currentLower < endBound) {
      const currentUpper = currentLower + intervalWidth;
      // Filter numbers in this interval [lower, upper)
      const matches = selectedDataset.rawData.filter((num) => {
        if (currentUpper >= endBound) {
          // Last interval includes the exact maximum
          return num >= currentLower && num <= currentUpper;
        }
        return num >= currentLower && num < currentUpper;
      });

      const freq = matches.length;
      list.push({
        id: `interval-${currentLower}-${currentUpper}`,
        lowerBound: currentLower,
        upperBound: currentUpper,
        classWidth: intervalWidth,
        tally: freq,
        frequency: freq,
        frequencyDensity: Math.round((freq / intervalWidth) * 100) / 100,
        userHeight: freq // Default ready for histogram
      });

      currentLower = currentUpper;
    }
    return list;
  }, [startBound, endBound, intervalWidth, selectedDataset]);

  // Which interval does a particular number fall into?
  const getIntervalIndexForNumber = (num: number) => {
    return generatedIntervals.findIndex(inv => {
      if (inv.upperBound >= endBound) {
        return num >= inv.lowerBound && num <= inv.upperBound;
      }
      return num >= inv.lowerBound && num < inv.upperBound;
    });
  };

  const handleApplyAndContinue = () => {
    onSaveGroupedIntervals(generatedIntervals);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    onGoToHistogram();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-emerald-100">
              <Layers className="w-3.5 h-3.5 text-emerald-200" />
              Step 2 • From Single Data to Grouped Frequency Table
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Group Raw Data with Equal Class Length
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              When working with continuous data, we group individual numbers into <strong>equal class intervals</strong>.
              Follow the 3 easy steps below: Find the Range, Choose Class Width, and Tally into Groups!
            </p>
          </div>

          {/* Dataset Selector */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shrink-0">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Choose Cambridge Dataset:
            </label>
            <select
              value={selectedDataset.id}
              onChange={(e) => {
                const found = DATASET_PRESETS.find(d => d.id === e.target.value);
                if (found) {
                  onSelectDataset(found);
                  onChangeIntervalWidth(found.recommendedIntervalWidth);
                }
              }}
              className="bg-white text-slate-900 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none cursor-pointer"
            >
              {DATASET_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3 Step Interactive Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step A: Range */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Phase 1
            </span>
            <Calculator className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">1. Find Minimum & Maximum</h3>
          <p className="text-xs text-slate-600">
            Scan your raw data to find the lowest and highest values:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Minimum Value:</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{minVal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Maximum Value:</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{maxVal}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5">
              <span className="font-semibold text-slate-700">Data Range (Max - Min):</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{dataRange}</span>
            </div>
          </div>
        </div>

        {/* Step B: Equal Class Width Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              Phase 2
            </span>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">2. Choose Equal Class Width (w)</h3>
          <p className="text-xs text-slate-600">
            For Cambridge 0580, keep interval widths equal and neat (e.g. 5 or 10):
          </p>

          <div className="flex items-center gap-2">
            {[2, 5, 10, 20].map((w) => (
              <button
                key={w}
                onClick={() => onChangeIntervalWidth(w)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  intervalWidth === w
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                w = {w}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
            Number of groups formed = <strong>{generatedIntervals.length} groups</strong>. (Ideal is between 5 and 8 groups).
          </div>
        </div>

        {/* Step C: Cambridge Inequality Notation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Phase 3
            </span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">3. Cambridge Notation Rule</h3>
          <p className="text-xs text-slate-600">
            Why do we write <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">20 ≤ x &lt; 30</code>?
          </p>
          <div className="text-xs text-slate-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1">
            <p>
              • <strong>≤ 20:</strong> Includes exactly 20.
            </p>
            <p>
              • <strong>&lt; 30:</strong> Scores up to 29.99 go here. A score of exactly 30 goes into the <em>next</em> group!
            </p>
            <p className="text-amber-900 font-semibold text-[11px]">
              This guarantees NO overlap and NO gaps!
            </p>
          </div>
        </div>

      </div>

      {/* Raw Data Stream and Tallying Interaction */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">
                Raw Single Data ({selectedDataset.rawData.length} observations)
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Click any number to trace its group!
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedDataset.context}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedRawNumberIndex(null);
                setTallyStep(0);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Selection</span>
            </button>
          </div>
        </div>

        {/* Number Badges */}
        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
          {selectedDataset.rawData.map((num, idx) => {
            const intervalIdx = getIntervalIndexForNumber(num);
            const isSelected = selectedRawNumberIndex === idx;

            // Palette of interval colors
            const badgeColors = [
              'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
              'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
              'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
              'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
              'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
              'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
              'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
            ];
            const colorClass = badgeColors[intervalIdx % badgeColors.length];

            return (
              <button
                key={idx}
                onClick={() => setSelectedRawNumberIndex(idx)}
                className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-indigo-600 scale-110 shadow-sm bg-indigo-600 text-white border-indigo-600' 
                    : colorClass
                }`}
                title={`Belongs in group ${generatedIntervals[intervalIdx]?.lowerBound} ≤ x < ${generatedIntervals[intervalIdx]?.upperBound}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Selected Number Trace Banner */}
        {selectedRawNumberIndex !== null && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <span className="font-medium">
              You selected value: <strong className="font-mono text-sm text-indigo-700">{selectedDataset.rawData[selectedRawNumberIndex]}</strong>.
              It falls into group: <strong className="font-mono text-sm text-indigo-700">
                {generatedIntervals[getIntervalIndexForNumber(selectedDataset.rawData[selectedRawNumberIndex])]?.lowerBound} ≤ x &lt; {generatedIntervals[getIntervalIndexForNumber(selectedDataset.rawData[selectedRawNumberIndex])]?.upperBound}
              </strong>
            </span>
            <span className="text-indigo-600 font-bold bg-white px-2 py-1 rounded-md border border-indigo-200">
              Tally +1
            </span>
          </div>
        )}
      </div>

      {/* Resulting Grouped Frequency Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              Generated Cambridge Grouped Frequency Table
            </h3>
            <p className="text-xs text-slate-500">
              Each row has equal width = <strong>{intervalWidth} units</strong>. Total frequency = <strong>{selectedDataset.rawData.length}</strong>.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Equal Class Length Verified</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Class Interval (x)</th>
                <th className="py-3 px-4">Lower Bound</th>
                <th className="py-3 px-4">Upper Bound</th>
                <th className="py-3 px-4">Class Width (w)</th>
                <th className="py-3 px-4">Tally</th>
                <th className="py-3 px-4 text-indigo-700 font-extrabold">Frequency (f)</th>
                <th className="py-3 px-4 text-slate-500">Modal Class?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {generatedIntervals.map((interval, i) => {
                const maxFreqInGroup = Math.max(...generatedIntervals.map(it => it.frequency));
                const isModal = interval.frequency === maxFreqInGroup;

                return (
                  <tr key={interval.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {interval.lowerBound} ≤ x &lt; {interval.upperBound}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{interval.lowerBound}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{interval.upperBound}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{interval.classWidth}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {'|'.repeat(interval.frequency)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 text-base">
                      {interval.frequency}
                    </td>
                    <td className="py-3 px-4">
                      {isModal ? (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                          Modal Class (Tallest Bar)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 border-t border-slate-200 font-bold text-slate-900">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right">
                  Total Observations (Σf):
                </td>
                <td colSpan={3} className="py-3 px-4 font-mono text-indigo-700 text-base">
                  {generatedIntervals.reduce((sum, it) => sum + it.frequency, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <strong>Ready for the next step!</strong> This table will now be used to draw your histogram on the exam grid.
          </div>

          <button
            onClick={handleApplyAndContinue}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 3: Draw Histogram</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
