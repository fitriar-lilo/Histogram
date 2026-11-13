import React, { useState, useEffect } from 'react';
import { ModuleTab, StudentProgress, GroupedInterval, ExamTableRow } from './types';
import { DATASET_PRESETS, buildExamTableRows } from './data/curriculumData';
import { loadSavedProgress, saveStudentProgress, clearStudentProgress, getInitialProgress } from './utils/storage';
import { Header } from './components/Header';
import { ConceptComparison } from './components/ConceptComparison';
import { DataGroupingLab } from './components/DataGroupingLab';
import { HistogramBuilder } from './components/HistogramBuilder';
import { ExamPractice } from './components/ExamPractice';
import { SummaryAndPdfExport } from './components/SummaryAndPdfExport';
import { CambridgeGuideModal } from './components/CambridgeGuideModal';
import { 
  Sparkles, 
  RotateCcw,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(loadSavedProgress);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [hasResumedAlert, setHasResumedAlert] = useState<boolean>(() => {
    const saved = localStorage.getItem('cambridge_0580_histogram_lab_v2');
    return !!saved;
  });

  // Keep state saved to localStorage
  useEffect(() => {
    saveStudentProgress(progress);
  }, [progress]);

  // Current active dataset
  const currentDataset = DATASET_PRESETS.find(d => d.id === progress.selectedDatasetId) || DATASET_PRESETS[0];

  // Helper to switch tab
  const handleSelectTab = (tab: ModuleTab) => {
    setProgress(prev => ({ ...prev, currentTab: tab }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Profile update
  const handleUpdateProfile = (profile: StudentProgress['profile']) => {
    setProgress(prev => ({ ...prev, profile }));
  };

  // Step 1: Concept Complete
  const handleConceptComplete = (score: number) => {
    setProgress(prev => ({
      ...prev,
      conceptScore: score,
      conceptCompleted: true
    }));
  };

  // Step 2: Grouped Data Saved
  const handleSaveGroupedIntervals = (intervals: GroupedInterval[]) => {
    setProgress(prev => ({
      ...prev,
      customIntervals: intervals,
      completedTallies: true
    }));
  };

  // Step 3: Histogram Updated & Verified
  const handleUpdateIntervals = (updated: GroupedInterval[]) => {
    setProgress(prev => ({
      ...prev,
      customIntervals: updated
    }));
  };

  const handleHistogramVerified = () => {
    setProgress(prev => ({
      ...prev,
      histogramVerified: true
    }));
  };

  // Step 4 (Exam Practice): Update table rows & verification
  const handleUpdateExamTableRows = (rows: ExamTableRow[]) => {
    setProgress(prev => ({
      ...prev,
      examTableRows: rows
    }));
  };

  const handleExamTableVerified = () => {
    setProgress(prev => ({
      ...prev,
      examTableVerified: true
    }));
  };

  const handleExamHistogramVerified = () => {
    setProgress(prev => ({
      ...prev,
      examHistogramVerified: true
    }));
  };

  const handleChangeExamClassWidth = (width: number) => {
    setProgress(prev => ({
      ...prev,
      examClassWidth: width,
      examTableRows: buildExamTableRows(width),
      examTableVerified: false,
      examHistogramVerified: false
    }));
  };

  // Reset Progress
  const handleConfirmReset = () => {
    clearStudentProgress();
    setProgress(getInitialProgress());
    setShowResetConfirm(false);
    setHasResumedAlert(false);
  };

  // Check which steps are completed
  const completedSteps: Record<string, boolean> = {
    concept: progress.conceptCompleted,
    grouping: progress.completedTallies,
    histogram: progress.histogramVerified,
    practice: progress.examTableVerified && progress.examHistogramVerified,
    export: false
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        currentTab={progress.currentTab}
        onSelectTab={handleSelectTab}
        profile={progress.profile}
        onUpdateProfile={handleUpdateProfile}
        onReset={() => setShowResetConfirm(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        completedSteps={completedSteps}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Resumed Session Welcome Notice */}
        {hasResumedAlert && progress.profile.name && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-xs sm:text-sm">
                <span>Welcome back, <strong>{progress.profile.name}</strong>! Your previous learning progress and drawings are restored.</span>
              </div>
            </div>
            <button
              onClick={() => setHasResumedAlert(false)}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors self-end sm:self-center cursor-pointer"
            >
              Continue Working
            </button>
          </div>
        )}

        {/* Dynamic Content Views */}
        {progress.currentTab === 'concept' && (
          <ConceptComparison
            onComplete={handleConceptComplete}
            isCompleted={progress.conceptCompleted}
            savedScore={progress.conceptScore}
          />
        )}

        {progress.currentTab === 'grouping' && (
          <DataGroupingLab
            selectedDataset={currentDataset}
            onSelectDataset={(preset) => {
              setProgress(prev => ({
                ...prev,
                selectedDatasetId: preset.id
              }));
            }}
            intervalWidth={progress.activeIntervalWidth}
            onChangeIntervalWidth={(width) => {
              setProgress(prev => ({
                ...prev,
                activeIntervalWidth: width
              }));
            }}
            onSaveGroupedIntervals={handleSaveGroupedIntervals}
            onGoToHistogram={() => handleSelectTab('histogram')}
            isCompleted={progress.completedTallies}
          />
        )}

        {progress.currentTab === 'histogram' && (
          <HistogramBuilder
            intervals={progress.customIntervals}
            dataset={currentDataset}
            onUpdateIntervals={handleUpdateIntervals}
            onVerified={handleHistogramVerified}
            isVerified={progress.histogramVerified}
            onGoToCumulative={() => handleSelectTab('practice')}
          />
        )}

        {progress.currentTab === 'practice' && (
          <ExamPractice
            selectedClassWidth={progress.examClassWidth || 6}
            onChangeClassWidth={handleChangeExamClassWidth}
            tableRows={progress.examTableRows}
            onUpdateTableRows={handleUpdateExamTableRows}
            onTableVerified={handleExamTableVerified}
            isTableVerified={progress.examTableVerified}
            onHistogramVerified={handleExamHistogramVerified}
            isHistogramVerified={progress.examHistogramVerified}
            onGoToExport={() => handleSelectTab('export')}
          />
        )}

        {progress.currentTab === 'export' && (
          <SummaryAndPdfExport
            progress={progress}
            dataset={currentDataset}
            examRows={progress.examTableRows}
            onUpdateNotes={(notes) => setProgress(prev => ({ ...prev, studentNotes: notes }))}
            onUpdateProfile={(name, className, teacher) => {
              setProgress(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  name,
                  className,
                  teacherName: teacher
                }
              }));
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Cambridge IGCSE 0580 Mathematics</span>
            <span>•</span>
            <span>Chapter 20: Histograms (Equal Class Length = {progress.examClassWidth || 6})</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Syllabus Guide</span>
            </button>
            <span>•</span>
            <span className="text-slate-400">Continuous Auto-Save Active</span>
          </div>
        </div>
      </footer>

      {/* Guide Cheat Sheet Modal */}
      <CambridgeGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">Reset All Progress?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will clear your name, answers, custom histogram bar heights, and notes. This cannot be undone. Are you sure you want to start a fresh lesson?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Yes, Reset My Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
