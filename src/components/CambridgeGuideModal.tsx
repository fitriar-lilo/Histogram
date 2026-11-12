import React from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle2, Bookmark, Lightbulb } from 'lucide-react';
import { CAMBRIDGE_GUIDE_SECTIONS } from '../data/curriculumData';

interface CambridgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CambridgeGuideModal: React.FC<CambridgeGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Cambridge IGCSE 0580 Chapter 20
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Quick Revision Cheat Sheet & Examiner Guide
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm text-slate-700">
          
          {/* Key Formulas Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Core Cambridge Formulas</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                <span className="text-slate-500 block">Class Width (w):</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  Upper Boundary − Lower Boundary
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                <span className="text-slate-500 block">Frequency Density (FD):</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  Frequency ÷ Class Width
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                <span className="text-slate-500 block">Area of Histogram Bar:</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  Area = Frequency
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                <span className="text-slate-500 block">Equal Class Length Rule:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  Bar Height = Frequency
                </span>
              </div>
            </div>
          </div>

          {/* Syllabus Concept Guide */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <span>Chapter 20 Key Notes</span>
            </h4>
            <div className="space-y-3">
              {CAMBRIDGE_GUIDE_SECTIONS.map((sec, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-xs mb-1">{sec.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Examiner Traps to Avoid */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <h4 className="font-bold text-rose-950 flex items-center gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Top Examiner Mistakes to Avoid in Cambridge Exams!</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-rose-900">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">1.</span>
                <span><strong>Leaving spaces between bars:</strong> In histograms, bars MUST touch because continuous data has no breaks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">2.</span>
                <span><strong>Incorrect bar widths:</strong> With equal class length (e.g. 6), every bar width must span exactly 6 units on the continuous x-axis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">3.</span>
                <span><strong>Confusing Bar Chart with Histogram:</strong> Bar charts are for distinct named groups (e.g. favourite sports). Histograms are for measured continuous scales.</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors"
            >
              Got it, back to learning!
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
