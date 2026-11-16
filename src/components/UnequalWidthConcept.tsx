import React, { useState } from 'react';
import { UNEQUAL_CONCEPT_CARDS } from '../data/curriculumData';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Lightbulb,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  RefreshCw,
  Scale,
  Calculator
} from 'lucide-react';

interface UnequalWidthConceptProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
  savedScore: number;
  onGoToSample: () => void;
}

export const UnequalWidthConcept: React.FC<UnequalWidthConceptProps> = ({
  onComplete,
  isCompleted,
  savedScore,
  onGoToSample
}) => {
  const [graphMode, setGraphMode] = useState<'density' | 'wrong-freq'>('density');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'frequency' | 'density'>>({});

  const handleSelectAnswer = (cardId: string, choice: 'frequency' | 'density') => {
    const updated = { ...selectedAnswers, [cardId]: choice };
    setSelectedAnswers(updated);

    if (Object.keys(updated).length === UNEQUAL_CONCEPT_CARDS.length) {
      let correct = 0;
      UNEQUAL_CONCEPT_CARDS.forEach((c) => {
        if (updated[c.id] === c.correctCategory) correct += 1;
      });
      onComplete(correct);
      if (correct >= UNEQUAL_CONCEPT_CARDS.length - 1) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
  };

  const correctCount = UNEQUAL_CONCEPT_CARDS.filter(
    (c) => selectedAnswers[c.id] === c.correctCategory
  ).length;
  const isQuizFinished = Object.keys(selectedAnswers).length === UNEQUAL_CONCEPT_CARDS.length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-purple-100">
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              Section 5 • Cambridge 0580 Extended Concept
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Histograms with Different Class Widths &amp; Frequency Density
            </h2>
            <p className="text-purple-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Sometimes class intervals do <strong>not</strong> have the same width (for example, width <strong>10</strong> and width <strong>5</strong>).
              When widths are different, we cannot just plot Frequency — we must use <strong>Frequency Density</strong>!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 text-center">
            <div className="text-xs uppercase font-semibold text-purple-200">Golden Formula</div>
            <div className="text-base sm:text-lg font-black text-amber-300 mt-1 font-mono">
              FD = Frequency ÷ Width
            </div>
            <div className="text-xs text-purple-100 mt-1">Area of Bar = Frequency</div>
          </div>
        </div>
      </div>

      {/* Part 1: Why Different Class Widths Need Frequency Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Visual Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Why Not Just Plot Frequency?
            </h3>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
              Interactive Demo
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Suppose <strong>6 students</strong> scored between 0–10 (width = 10) and <strong>6 students</strong> scored between 10–15 (width = 5).
            Toggle below to see why Frequency Density makes the bars fair!
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setGraphMode('density')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                graphMode === 'density'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Correct: Plot Frequency Density
            </button>
            <button
              onClick={() => setGraphMode('wrong-freq')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                graphMode === 'wrong-freq'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✕ Wrong: Plot Raw Frequency
            </button>
          </div>

          {/* Demo SVG */}
          <div className="cambridge-grid rounded-xl border border-slate-200 p-3">
            <svg viewBox="0 0 340 195" className="w-full h-48 select-none">
              <line x1="48" y1="20" x2="48" y2="150" stroke="#1e293b" strokeWidth="2" />
              <line x1="48" y1="150" x2="310" y2="150" stroke="#1e293b" strokeWidth="2" />

              {/* Horizontal guidelines */}
              <line x1="48" y1="40" x2="310" y2="40" stroke="#cbd5e1" strokeDasharray="3,3" />
              <line x1="48" y1="95" x2="310" y2="95" stroke="#cbd5e1" strokeDasharray="3,3" />

              {graphMode === 'density' ? (
                <>
                  {/* Y axis labels */}
                  <text x="42" y="44" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">1.2</text>
                  <text x="42" y="99" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">0.6</text>
                  <text x="42" y="153" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">0</text>
                  <text x="14" y="88" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle" transform="rotate(-90 14 88)">
                    Freq Density
                  </text>

                  {/* Bar 1: 0 to 10 (width=10 -> 140px), FD=0.6 -> height 55px (y=95) */}
                  <rect x="60" y="95" width="140" height="55" fill="#7c3aed" stroke="#3b0764" strokeWidth="1.5" />
                  <text x="130" y="119" fontSize="9.5" fontWeight="bold" fill="#fff" textAnchor="middle">
                    FD = 6 ÷ 10 = 0.6
                  </text>
                  <text x="130" y="133" fontSize="9" fill="#fde68a" fontWeight="bold" textAnchor="middle">
                    Area = 10 × 0.6 = 6
                  </text>

                  {/* Bar 2: 10 to 15 (width=5 -> 70px), FD=1.2 -> height 110px (y=40) */}
                  <rect x="200" y="40" width="70" height="110" fill="#6d28d9" stroke="#3b0764" strokeWidth="1.5" />
                  <text x="235" y="90" fontSize="9" fontWeight="bold" fill="#fff" textAnchor="middle">
                    FD = 1.2
                  </text>
                  <text x="235" y="104" fontSize="8.5" fill="#fde68a" fontWeight="bold" textAnchor="middle">
                    Area = 6
                  </text>
                </>
              ) : (
                <>
                  {/* Y axis labels */}
                  <text x="42" y="44" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">6</text>
                  <text x="42" y="99" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">3</text>
                  <text x="42" y="153" fontSize="10" textAnchor="end" fill="#334155" fontFamily="JetBrains Mono">0</text>
                  <text x="14" y="88" fontSize="9" fontWeight="bold" fill="#be123c" textAnchor="middle" transform="rotate(-90 14 88)">
                    Frequency (WRONG)
                  </text>

                  {/* Misleading equal heights */}
                  <rect x="60" y="40" width="140" height="110" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" />
                  <text x="130" y="92" fontSize="9.5" fontWeight="bold" fill="#fff" textAnchor="middle">
                    Height = 6
                  </text>
                  <text x="130" y="106" fontSize="8.5" fill="#ffe4e6" textAnchor="middle">
                    Looks 2× bigger! (Wrong)
                  </text>

                  <rect x="200" y="40" width="70" height="110" fill="#e11d48" stroke="#881337" strokeWidth="1.5" />
                  <text x="235" y="92" fontSize="9.5" fontWeight="bold" fill="#fff" textAnchor="middle">
                    Height = 6
                  </text>
                </>
              )}

              {/* X Axis Labels */}
              <text x="60" y="165" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">0</text>
              <text x="200" y="165" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">10</text>
              <text x="270" y="165" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">15</text>
              <text x="165" y="182" fontSize="9.5" fontWeight="bold" fill="#475569" textAnchor="middle">
                Width 10 (0 to 10) vs Width 5 (10 to 15)
              </text>
            </svg>
          </div>

          <div className={`p-3 rounded-xl text-xs border ${
            graphMode === 'density'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {graphMode === 'density' ? (
              <span>
                <strong>Why this works:</strong> Both groups have <strong>6 students</strong>, so both bars have the exact same <strong>AREA = 6</strong>! The narrower group (10–15) is more crowded, so its bar is taller.
              </span>
            ) : (
              <span>
                <strong>Why this is wrong:</strong> Plotting raw frequency makes the 0–10 bar look <strong>twice as big</strong> in area even though both bars only contain 6 students!
              </span>
            )}
          </div>
        </div>

        {/* Definition & Formulas Card */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>What is Frequency Density?</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>Frequency Density</strong> measures <em>how crowded</em> the data is inside each class interval — it tells you the <strong>frequency per 1 unit of class width</strong>.
            </p>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-2.5">
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Formula to Memorise
                </div>
                <div className="text-base sm:text-lg font-mono font-black text-purple-950 mt-1">
                  Frequency Density = Frequency ÷ Class Width
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <div className="text-slate-500">Find Class Width</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">Upper − Lower</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <div className="text-slate-500">Check with Area</div>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">Width × FD = Freq</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Easy Memory Trick:</strong> Think of people in rooms! <strong>6 people</strong> in a <strong>big room (width 10)</strong> are spread out (density = 0.6). <strong>6 people</strong> in a <strong>small room (width 5)</strong> are twice as crowded (density = 1.2)!
              </span>
            </div>
          </div>

          {/* Difference Between Frequency and Frequency Density Table */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-3">
            <h4 className="font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Difference: Frequency vs. Frequency Density</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300 uppercase text-[10px]">
                    <th className="pb-2 pr-2">Feature</th>
                    <th className="pb-2 pr-2 text-blue-300">Frequency (f)</th>
                    <th className="pb-2 text-purple-300">Frequency Density (FD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-2 pr-2 font-semibold text-slate-300">Meaning</td>
                    <td className="py-2 pr-2 text-slate-200">Total count in a group</td>
                    <td className="py-2 text-purple-200">Count per 1 unit width (crowdedness)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold text-slate-300">Formula</td>
                    <td className="py-2 pr-2 font-mono text-blue-300">Count values (or Width × FD)</td>
                    <td className="py-2 font-mono text-purple-300">Frequency ÷ Class Width</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold text-slate-300">Values</td>
                    <td className="py-2 pr-2 text-slate-200">Always whole numbers (4, 6, 9)</td>
                    <td className="py-2 text-purple-200">Often decimals (0.4, 1.2, 1.6)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold text-slate-300">On the Graph</td>
                    <td className="py-2 pr-2 font-bold text-emerald-400">AREA of the bar</td>
                    <td className="py-2 font-bold text-amber-300">HEIGHT (Y-axis) of the bar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Quick Sorting Check (Frequency vs Frequency Density) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Quick Check: Frequency or Frequency Density?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sort each description below to test your understanding before looking at the worked example.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
              Score: {isCompleted && Object.keys(selectedAnswers).length === 0 ? savedScore : correctCount} / {UNEQUAL_CONCEPT_CARDS.length}
            </span>
            <button
              onClick={resetQuiz}
              className="text-xs font-medium text-slate-600 hover:text-purple-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNEQUAL_CONCEPT_CARDS.map((card, idx) => {
            const selected = selectedAnswers[card.id];
            const isAnswered = !!selected;
            const isCorrect = selected === card.correctCategory;

            return (
              <div
                key={card.id}
                className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-rose-300 bg-rose-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Question #{idx + 1}
                    </span>
                    {isAnswered && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isCorrect ? 'Correct!' : 'Try again'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">"{card.statement}"</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSelectAnswer(card.id, 'frequency')}
                      className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        selected === 'frequency'
                          ? card.correctCategory === 'frequency'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Frequency (f)
                    </button>

                    <button
                      onClick={() => handleSelectAnswer(card.id, 'density')}
                      className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                        selected === 'density'
                          ? card.correctCategory === 'density'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Frequency Density
                    </button>
                  </div>

                  {isAnswered && (
                    <div className="mt-2.5 text-xs p-2.5 rounded-lg bg-slate-100 text-slate-700 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{card.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            {isQuizFinished
              ? `Great job! You scored ${correctCount}/${UNEQUAL_CONCEPT_CARDS.length}. Next, let's walk through a full worked example!`
              : 'Complete the 6 quick questions above or proceed to see a full step-by-step sample.'}
          </div>
          <button
            onClick={onGoToSample}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Section 6: Worked Sample</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
