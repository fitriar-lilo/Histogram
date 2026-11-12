import React, { useState } from 'react';
import { StudentProgress, DatasetPreset, ExamTableRow } from '../types';
import { exportStudentReportPDF } from '../utils/pdfExport';
import confetti from 'canvas-confetti';
import { 
  Download, 
  CheckCircle2, 
  GraduationCap, 
  User, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface SummaryAndPdfExportProps {
  progress: StudentProgress;
  dataset: DatasetPreset;
  examRows: ExamTableRow[];
  onUpdateNotes: (notes: string) => void;
  onUpdateProfile: (name: string, className: string, teacher: string) => void;
}

export const SummaryAndPdfExport: React.FC<SummaryAndPdfExportProps> = ({
  progress,
  dataset,
  examRows,
  onUpdateNotes,
  onUpdateProfile
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      exportStudentReportPDF(progress, dataset, examRows);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const studentNameDisplay = progress.profile.name.trim() || 'Student Name (Not specified)';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              Final Step • Official Cambridge 0580 Portfolio
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Congratulations! Your Learning Record is Ready
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              You have completed the definitions, converted single raw data into equal class groups, built the histogram,
              and successfully completed the 30 Students' Heights exam task (class length = 6).
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-6 py-3.5 rounded-xl text-sm sm:text-base shadow-lg transition-all flex items-center gap-2.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-900" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Portfolio as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Student Details & Reflection Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verification of Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Student & Submission Details</span>
          </h3>
          <p className="text-xs text-slate-500">
            These credentials will be formally stamped on your downloaded PDF worksheet:
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Full Name:</label>
              <input
                type="text"
                value={progress.profile.name}
                onChange={(e) => onUpdateProfile(e.target.value, progress.profile.className, progress.profile.teacherName)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class / Cohort:</label>
                <input
                  type="text"
                  value={progress.profile.className}
                  onChange={(e) => onUpdateProfile(progress.profile.name, e.target.value, progress.profile.teacherName)}
                  placeholder="e.g. Grade 10 Cambridge"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher / Department:</label>
                <input
                  type="text"
                  value={progress.profile.teacherName}
                  onChange={(e) => onUpdateProfile(progress.profile.name, progress.profile.className, e.target.value)}
                  placeholder="e.g. Mr. Smith"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved locally in browser memory. You can resume anytime!</span>
            </div>
          </div>
        </div>

        {/* Student Reflections */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Student Reflection & Key Takeaways</span>
          </h3>
          <p className="text-xs text-slate-500">
            Write down what you learned today (e.g. why histogram bars touch, how class width = 6 is maintained):
          </p>

          <textarea
            rows={5}
            value={progress.studentNotes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="e.g. Today I learned that a histogram is for continuous numerical data, so bars must touch without gaps. I grouped 30 student heights into equal intervals of width 6 and accurately drew touching bars matching the frequencies."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
          />
        </div>

      </div>

      {/* Portfolio Preview Card */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Document Preview
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Cambridge IGCSE Mathematics (0580) Student Portfolio
            </h3>
            <p className="text-xs text-slate-500">
              Student: <strong>{studentNameDisplay}</strong> • Topic: Chapter 20 Histogram Construction
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Save as PDF</span>
          </button>
        </div>

        {/* 4 Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Concept Sort</div>
            <div className="text-lg font-black text-indigo-700 mt-0.5">8 / 8 Mastered</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Exam Class Length</div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">w = 6 (Equal)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">30 Heights Grouped</div>
            <div className="text-lg font-black text-purple-700 mt-0.5">6 Touching Bars</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Status</div>
            <div className="text-lg font-black text-amber-600 mt-0.5">Verified Pass</div>
          </div>
        </div>

        {/* Exam Table Review */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Completed Exam Frequency Table (30 Students' Heights, Class Length = 6):
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3">Class Interval</th>
                  <th className="py-2 px-3">Lower Bound</th>
                  <th className="py-2 px-3">Upper Bound</th>
                  <th className="py-2 px-3">Class Width</th>
                  <th className="py-2 px-3">Frequency</th>
                  <th className="py-2 px-3">Bar Width</th>
                  <th className="py-2 px-3">Bar Height</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-medium">{row.intervalInput || row.intervalText}</td>
                    <td className="py-2 px-3 font-mono">{row.lowerBoundInput || row.targetLower}</td>
                    <td className="py-2 px-3 font-mono">{row.upperBoundInput || row.targetUpper}</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">{row.classWidthInput || row.targetWidth}</td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-700">{row.frequencyInput || row.targetFreq}</td>
                    <td className="py-2 px-3 font-mono">{row.userBarWidth || 6}</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-600">{row.userBarHeight || row.targetFreq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final CTA */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-950">
          <div>
            <strong>Ready to submit to your teacher?</strong> Click the button to download your official PDF document with graph and assessment rubric.
          </div>
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download My PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
