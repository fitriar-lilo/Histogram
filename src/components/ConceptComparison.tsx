import React, { useState } from 'react';
import { CONCEPT_CARDS } from '../data/curriculumData';
import { ConceptCard } from '../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Lightbulb, 
  Info,
  Check,
  RefreshCw
} from 'lucide-react';

interface ConceptComparisonProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
  savedScore: number;
}

export const ConceptComparison: React.FC<ConceptComparisonProps> = ({
  onComplete,
  isCompleted,
  savedScore
}) => {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'visual' | 'quiz' | 'summary'>('visual');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'barchart' | 'histogram'>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [activeVisualHighlight, setActiveVisualHighlight] = useState<'all' | 'gaps' | 'axis' | 'area'>('all');

  const handleSelectAnswer = (cardId: string, choice: 'barchart' | 'histogram') => {
    const updated = { ...selectedAnswers, [cardId]: choice };
    setSelectedAnswers(updated);
    setShowExplanations(prev => ({ ...prev, [cardId]: true }));

    // Check if all answered
    if (Object.keys(updated).length === CONCEPT_CARDS.length) {
      let correct = 0;
      CONCEPT_CARDS.forEach(c => {
        if (updated[c.id] === c.correctCategory) correct += 1;
      });
      onComplete(correct);
      if (correct >= CONCEPT_CARDS.length - 1) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanations({});
  };

  const correctCount = CONCEPT_CARDS.filter(c => selectedAnswers[c.id] === c.correctCategory).length;
  const isQuizFinished = Object.keys(selectedAnswers).length === CONCEPT_CARDS.length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Intro Banner for Middle-to-Low Students */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              Syllabus 0580 • Chapter 20 Key Concept
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              What is a Histogram vs a Bar Chart?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              They both use rectangular bars, but they represent <strong>completely different types of data</strong>.
              Learn the 3 golden rules every Cambridge examiner looks for!
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 text-center">
            <div className="text-xs uppercase font-semibold text-blue-200">Examiner Rule #1</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">NO GAPS BETWEEN BARS</div>
            <div className="text-xs text-blue-100 mt-1">Histogram bars must touch!</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mt-6 border-t border-white/20 pt-4">
          <button
            onClick={() => setActiveInteractiveTab('visual')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeInteractiveTab === 'visual'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            1. Visual Side-by-Side Comparison
          </button>
          <button
            onClick={() => setActiveInteractiveTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeInteractiveTab === 'quiz'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <span>2. Sorting Game Challenge</span>
            {isQuizFinished && (
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {correctCount}/{CONCEPT_CARDS.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. VISUAL COMPARISON TAB */}
      {activeInteractiveTab === 'visual' && (
        <div className="space-y-6">
          {/* Interactive Feature Highlighter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Click to highlight key differences on the charts below:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveVisualHighlight('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeVisualHighlight === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Features
              </button>
              <button
                onClick={() => setActiveVisualHighlight('gaps')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeVisualHighlight === 'gaps'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Gaps vs No Gaps (Crucial!)
              </button>
              <button
                onClick={() => setActiveVisualHighlight('axis')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeVisualHighlight === 'axis'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Horizontal Axis Scale
              </button>
              <button
                onClick={() => setActiveVisualHighlight('area')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeVisualHighlight === 'area'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Area = Frequency
              </button>
            </div>
          </div>

          {/* Side-by-Side Visual Illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT: BAR CHART */}
            <div className={`bg-white rounded-2xl border-2 transition-all p-5 shadow-xs ${
              activeVisualHighlight === 'gaps' ? 'border-rose-400 ring-4 ring-rose-100' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <h3 className="font-bold text-slate-900 text-lg">Ordinary Bar Chart</h3>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                  Categorical / Discrete Data
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <p>Example: <strong>Favourite Fruit</strong> of 25 students.</p>
                <p className="text-slate-500">Categories are distinct words: Apple, Banana, Orange.</p>
              </div>

              {/* Chart SVG */}
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                <svg viewBox="0 0 320 180" className="w-full h-44">
                  {/* Grid lines */}
                  <line x1="40" y1="30" x2="300" y2="30" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="70" x2="300" y2="70" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="110" x2="300" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="140" x2="300" y2="140" stroke="#64748b" strokeWidth="2" />
                  <line x1="40" y1="20" x2="40" y2="140" stroke="#64748b" strokeWidth="2" />

                  {/* Y-axis Ticks & Labels */}
                  <text x="32" y="34" fontSize="10" textAnchor="end" fill="#64748b">12</text>
                  <text x="32" y="74" fontSize="10" textAnchor="end" fill="#64748b">8</text>
                  <text x="32" y="114" fontSize="10" textAnchor="end" fill="#64748b">4</text>
                  <text x="32" y="144" fontSize="10" textAnchor="end" fill="#64748b">0</text>

                  {/* Bar 1 - Apple (Height 10 -> y=40, h=100) */}
                  <rect x="60" y="50" width="45" height="90" fill="#94a3b8" rx="2" />
                  <text x="82.5" y="80" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">10</text>
                  <text x="82.5" y="156" fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">Apple</text>

                  {/* GAP INDICATOR */}
                  {(activeVisualHighlight === 'gaps' || activeVisualHighlight === 'all') && (
                    <g>
                      <rect x="107" y="115" width="28" height="24" fill="#fee2e2" stroke="#f87171" strokeDasharray="2,2" rx="3" />
                      <text x="121" y="130" fontSize="8" fontWeight="bold" fill="#b91c1c" textAnchor="middle">GAP</text>
                    </g>
                  )}

                  {/* Bar 2 - Banana (Height 7 -> y=80, h=60) */}
                  <rect x="138" y="75" width="45" height="65" fill="#94a3b8" rx="2" />
                  <text x="160.5" y="100" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">7</text>
                  <text x="160.5" y="156" fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">Banana</text>

                  {/* GAP INDICATOR */}
                  {(activeVisualHighlight === 'gaps' || activeVisualHighlight === 'all') && (
                    <g>
                      <rect x="185" y="115" width="28" height="24" fill="#fee2e2" stroke="#f87171" strokeDasharray="2,2" rx="3" />
                      <text x="199" y="130" fontSize="8" fontWeight="bold" fill="#b91c1c" textAnchor="middle">GAP</text>
                    </g>
                  )}

                  {/* Bar 3 - Orange (Height 8 -> y=70, h=70) */}
                  <rect x="215" y="65" width="45" height="75" fill="#94a3b8" rx="2" />
                  <text x="237.5" y="95" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">8</text>
                  <text x="237.5" y="156" fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">Orange</text>
                </svg>
              </div>

              {/* Bullet Points */}
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Spaces between bars:</strong> You MUST leave equal gaps between bars.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">•</span>
                  <span><strong>Data type:</strong> Distinct categories or discrete counts (e.g., shoe size, car colours).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">•</span>
                  <span><strong>Bar width:</strong> Does not represent any mathematical quantity.</span>
                </li>
              </ul>
            </div>

            {/* RIGHT: HISTOGRAM */}
            <div className={`bg-white rounded-2xl border-2 transition-all p-5 shadow-md ${
              activeVisualHighlight === 'gaps' || activeVisualHighlight === 'axis'
                ? 'border-indigo-500 ring-4 ring-indigo-100'
                : 'border-indigo-300'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                  <h3 className="font-bold text-indigo-950 text-lg">Cambridge Histogram</h3>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                  Continuous Scaled Data
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <p>Example: <strong>Student Heights in cm</strong> (140 to 170 cm).</p>
                <p className="text-indigo-700 font-medium">Class intervals: 140 ≤ h &lt; 150, 150 ≤ h &lt; 160, 160 ≤ h &lt; 170.</p>
              </div>

              {/* Histogram SVG */}
              <div className="mt-4 cambridge-grid rounded-xl p-4 border border-indigo-200 relative">
                <svg viewBox="0 0 320 180" className="w-full h-44">
                  {/* Grid lines */}
                  <line x1="40" y1="30" x2="300" y2="30" stroke="#cbd5e1" strokeDasharray="3,3" />
                  <line x1="40" y1="70" x2="300" y2="70" stroke="#cbd5e1" strokeDasharray="3,3" />
                  <line x1="40" y1="110" x2="300" y2="110" stroke="#cbd5e1" strokeDasharray="3,3" />
                  <line x1="40" y1="140" x2="300" y2="140" stroke="#1e293b" strokeWidth="2" />
                  <line x1="40" y1="20" x2="40" y2="140" stroke="#1e293b" strokeWidth="2" />

                  {/* Y-axis Ticks & Labels */}
                  <text x="32" y="34" fontSize="10" textAnchor="end" fill="#1e293b" fontWeight="600">12</text>
                  <text x="32" y="74" fontSize="10" textAnchor="end" fill="#1e293b" fontWeight="600">8</text>
                  <text x="32" y="114" fontSize="10" textAnchor="end" fill="#1e293b" fontWeight="600">4</text>
                  <text x="32" y="144" fontSize="10" textAnchor="end" fill="#1e293b" fontWeight="600">0</text>

                  {/* HISTOGRAM BARS - TOUCHING WITHOUT ANY GAP */}
                  {/* Bar 1: 140 to 150 (x=50 to x=125, w=75, f=6 -> y=85, h=55) */}
                  <rect x="50" y="85" width="75" height="55" fill="#6366f1" stroke="#312e81" strokeWidth="1.5" />
                  <text x="87.5" y="115" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">f = 6</text>

                  {/* Bar 2: 150 to 160 (x=125 to x=200, w=75, f=11 -> y=40, h=100) */}
                  <rect x="125" y="40" width="75" height="100" fill="#4f46e5" stroke="#312e81" strokeWidth="1.5" />
                  <text x="162.5" y="85" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">f = 11</text>

                  {/* Bar 3: 160 to 170 (x=200 to x=275, w=75, f=8 -> y=68, h=72) */}
                  <rect x="200" y="68" width="75" height="72" fill="#4338ca" stroke="#312e81" strokeWidth="1.5" />
                  <text x="237.5" y="105" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">f = 8</text>

                  {/* Touching arrows label */}
                  {(activeVisualHighlight === 'gaps' || activeVisualHighlight === 'all') && (
                    <g>
                      <path d="M 125,120 L 125,95" stroke="#fbbf24" strokeWidth="3" />
                      <circle cx="125" cy="95" r="4" fill="#d97706" />
                      <rect x="100" y="24" width="80" height="18" fill="#fef3c7" stroke="#f59e0b" rx="4" />
                      <text x="140" y="36" fontSize="8" fontWeight="bold" fill="#92400e" textAnchor="middle">NO GAP! Touching</text>
                    </g>
                  )}

                  {/* Continuous Number Scale at Class Boundaries */}
                  <text x="50" y="156" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">140</text>
                  <text x="125" y="156" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">150</text>
                  <text x="200" y="156" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">160</text>
                  <text x="275" y="156" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">170</text>
                  <text x="162.5" y="172" fontSize="9" fontWeight="bold" fill="#4338ca" textAnchor="middle">Height (cm) - Continuous Scale</text>
                </svg>
              </div>

              {/* Bullet Points */}
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>NO spaces between bars:</strong> Adjacent bars touch because where 140-150 ends, 150-160 starts immediately!</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Continuous data:</strong> Measurable numbers with decimals (e.g. mass, length, time).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cambridge Rule:</strong> The horizontal axis is a continuous number line showing exact boundary numbers (140, 150, 160).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Summary Matrix for Cambridge 0580 */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Summary Table: The 4 Cambridge 0580 Exam Rules
            </h4>
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-semibold">Feature</th>
                    <th className="pb-3 font-semibold text-slate-400">Bar Chart</th>
                    <th className="pb-3 font-bold text-indigo-300">Histogram (Chapter 20)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-3 font-medium text-slate-300">Data Type</td>
                    <td className="py-3 text-slate-400">Categorical / Discrete (separate names or whole counts)</td>
                    <td className="py-3 font-semibold text-emerald-400">Continuous measurements (length, mass, time)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-slate-300">Spaces Between Bars?</td>
                    <td className="py-3 text-slate-400">YES, always has equal gaps</td>
                    <td className="py-3 font-bold text-amber-300">NEVER! Bars touch each other without gaps</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-slate-300">Horizontal (X) Axis</td>
                    <td className="py-3 text-slate-400">Names or labels under each bar</td>
                    <td className="py-3 text-indigo-300">Continuous number line with class boundary numbers</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-slate-300">What Represents Frequency?</td>
                    <td className="py-3 text-slate-400">Height of the bar</td>
                    <td className="py-3 text-indigo-200">
                      <strong>Area of the bar</strong> (When widths are equal, height is proportional to frequency)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveInteractiveTab('quiz')}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md"
              >
                <span>Ready to test yourself? Play the Sorting Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE QUIZ / SORTING CHALLENGE */}
      {activeInteractiveTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Sorting Challenge: Bar Chart or Histogram?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Read each statement below and choose whether it describes an <strong>Ordinary Bar Chart</strong> or a <strong>Histogram</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                Score: {correctCount} / {CONCEPT_CARDS.length}
              </div>
              <button
                onClick={resetQuiz}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONCEPT_CARDS.map((card, index) => {
              const selected = selectedAnswers[card.id];
              const isAnswered = !!selected;
              const isCorrect = selected === card.correctCategory;

              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    isAnswered
                      ? isCorrect
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-200 hover:border-indigo-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Card #{index + 1}
                      </span>
                      {isAnswered && (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-slate-900 text-sm leading-snug">
                      "{card.statement}"
                    </p>
                  </div>

                  {/* Choice Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSelectAnswer(card.id, 'barchart')}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all ${
                          selected === 'barchart'
                            ? card.correctCategory === 'barchart'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Bar Chart
                      </button>

                      <button
                        onClick={() => handleSelectAnswer(card.id, 'histogram')}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all ${
                          selected === 'histogram'
                            ? card.correctCategory === 'histogram'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Histogram
                      </button>
                    </div>

                    {/* Feedback Explanation */}
                    {isAnswered && (
                      <div className="mt-3 text-xs p-2.5 rounded-lg bg-slate-100 text-slate-700 space-y-1">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Why:</span>
                        </div>
                        <p>{card.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Celebration Banner */}
          {isQuizFinished && (
            <div className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
              correctCount >= 6
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  correctCount >= 6 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">
                    {correctCount >= 6 ? 'Outstanding Understanding!' : 'Good Effort! Review & Try Again'}
                  </h4>
                  <p className="text-xs opacity-90">
                    You scored {correctCount} out of {CONCEPT_CARDS.length}. You understand the critical differences needed for Cambridge exams!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // Trigger step 2
                  const nextBtn = document.querySelector('button[data-step="grouping"]') as HTMLButtonElement;
                  if (nextBtn) nextBtn.click();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-md"
              >
                Continue to Step 2: Grouping Data →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
