import React from 'react';
import { ModuleTab, StudentProfile } from '../types';
import { 
  BarChart3, 
  Table2, 
  Award, 
  Download, 
  HelpCircle, 
  CheckCircle2, 
  RotateCcw,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  onReset: () => void;
  onOpenGuide: () => void;
  completedSteps: Record<string, boolean>;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onUpdateProfile,
  onReset,
  onOpenGuide,
  completedSteps
}) => {
  const tabs: { id: ModuleTab; label: string; icon: React.ReactNode; step: string }[] = [
    { id: 'concept', label: '1. What is a Histogram?', icon: <BarChart3 className="w-4 h-4" />, step: 'Step 1' },
    { id: 'grouping', label: '2. Grouping Raw Data', icon: <Table2 className="w-4 h-4" />, step: 'Step 2' },
    { id: 'histogram', label: '3. Guided Histogram', icon: <BarChart3 className="w-4 h-4 rotate-90" />, step: 'Step 3' },
    { id: 'practice', label: '4. Exam Practice (30 Heights)', icon: <Award className="w-4 h-4" />, step: 'Step 4' },
    { id: 'export', label: '5. Download PDF', icon: <Download className="w-4 h-4" />, step: 'Step 5' },
  ];

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / tabs.length) * 100);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Cambridge Curriculum Badges and Student Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Curriculum Tag */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Cambridge IGCSE 0580
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Chapter 20: Histograms
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Histogram Interactive Learning Lab
              </h1>
            </div>
          </div>

          {/* Student Profile & Persistence Box */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <label htmlFor="student-name-input" className="text-xs font-semibold text-slate-600 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Student Name:
              </label>
              <input
                id="student-name-input"
                type="text"
                placeholder="Enter your name to save work..."
                value={profile.name}
                onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                className="bg-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-44 sm:w-56 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <input
                type="text"
                placeholder="Class (e.g. 10A)"
                value={profile.className}
                onChange={(e) => onUpdateProfile({ ...profile, className: e.target.value })}
                className="bg-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-24 text-slate-700"
                title="Your Class"
              />
            </div>

            {/* Saved indicator */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200" title="Your work is saved in browser storage!">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-Saved</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenGuide}
                className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Cambridge Formulas & Study Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cheat Sheet</span>
              </button>

              <button
                onClick={onReset}
                className="text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                title="Reset work & start over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            {completedCount} of {tabs.length} Activities Complete ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Navigation Step Tabs */}
      <nav className="bg-slate-50/80 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 py-1.5">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const isDone = completedSteps[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {isDone && !isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
