import React, { useState } from 'react';
import { StudentProgress, ExamTableRow, UnequalExamRow } from '../types';
import { exportSection4PDF, exportSection7PDF } from '../utils/pdfExport';
import confetti from 'canvas-confetti';
import {
  Download,
  CheckCircle2,
  GraduationCap,
  User,
  MessageSquare,
  FileText,
  Scale,
  BarChart3
} from 'lucide-react';

interface SummaryAndPdfExportProps {
  progress: StudentProgress;
  examRows: ExamTableRow[];
  unequalRows: UnequalExamRow[];
  onUpdateNotes: (notes: string) => void;
  onUpdateProfile: (name: string, className: string, teacher: string) => void;
}

export const SummaryAndPdfExport: React.FC<SummaryAndPdfExportProps> = ({
  progress,
  examRows,
  unequalRows,
  onUpdateNotes,
  onUpdateProfile
}) => {
  const [exportingWhich, setExportingWhich] = useState<'none' | 'sec4' | 'sec7'>('none');

  const handleDownloadSection4 = () => {
    setExportingWhich('sec4');
    try {
      exportSection4PDF(progress, examRows);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch (e) {
      console.error('Section 4 PDF export failed:', e);
    } finally {
      setExportingWhich('none');
    }
  };

  const handleDownloadSection7 = () => {
    setExportingWhich('sec7');
    try {
      exportSection7PDF(progress, unequalRows);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch (e) {
      console.error('Section 7 PDF export failed:', e);
    } finally {
      setExportingWhich('none');
    }
  };

  const studentNameDisplay = progress.profile.name.trim() || 'Student Name (Not specified)';
  const classWidth = progress.examClassWidth || 6;
  const sec4Verified = progress.examTableVerified && progress.examHistogramVerified;
  const sec7Verified = progress.unequalTableVerified && progress.unequalHistogramVerified;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              Section 8 • Separate PDF Reports (Cambridge 0580)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Download Your Section 4 &amp; Section 7 PDF Reports
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Your Equal-Width Histogram (<strong>Section 4</strong>) and Different-Width &amp; Frequency Density Histogram
              (<strong>Section 7</strong>) are exported as two separate, clear PDF worksheets ready for your teacher!
            </p>
          </div>
        </div>
      </div>

      {/* Student Details & Reflection Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Student &amp; Submission Details</span>
          </h3>
          <p className="text-xs text-slate-500">
            These details are printed on both your Section 4 and Section 7 PDF reports:
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
              <span>Student: <strong>{studentNameDisplay}</strong> • Saved automatically</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Student Reflection &amp; Key Takeaways</span>
          </h3>
          <p className="text-xs text-slate-500">
            Write a short note on what you learned (included in both PDF worksheets):
          </p>

          <textarea
            rows={5}
            value={progress.studentNotes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder={`e.g. For equal class widths (w=${classWidth}), bar height matches frequency. For different class widths, I calculate Frequency Density = Frequency ÷ Class Width so the area of each bar equals frequency.`}
            className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Two Separate PDF Download Cards: Section 4 & Section 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4 PDF CARD */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  <BarChart3 className="w-3 h-3" />
                  Section 4 PDF
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Equal Class Width Histogram
                </h3>
                <p className="text-xs text-slate-500">
                  30 Students' Heights • Chosen Class Width: <strong>w = {classWidth}</strong>
                </p>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                  sec4Verified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {sec4Verified ? 'Verified Complete' : 'In Progress'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-1.5 px-2">Interval</th>
                    <th className="py-1.5 px-2">Width</th>
                    <th className="py-1.5 px-2">Freq</th>
                    <th className="py-1.5 px-2">Drawn Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-1.5 px-2 font-mono">{row.intervalInput || row.intervalText}</td>
                      <td className="py-1.5 px-2 font-mono">{row.classWidthInput || row.targetWidth}</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-emerald-700">
                        {row.frequencyInput || row.targetFreq}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-indigo-700">
                        w={row.userBarWidth || classWidth}, h={row.userBarHeight || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleDownloadSection4}
            disabled={exportingWhich === 'sec4'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exportingWhich === 'sec4' ? 'Generating Section 4 PDF...' : 'Download Section 4 PDF (Equal Width)'}</span>
          </button>
        </div>

        {/* SECTION 7 PDF CARD */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-md p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  <Scale className="w-3 h-3" />
                  Section 7 PDF
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Different Widths &amp; Frequency Density
                </h3>
                <p className="text-xs text-slate-500">
                  30 Students' Reading Times • <strong>FD = Frequency ÷ Width</strong>
                </p>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                  sec7Verified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {sec7Verified ? 'Verified Complete' : 'In Progress'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-1.5 px-2">Interval</th>
                    <th className="py-1.5 px-2">Width</th>
                    <th className="py-1.5 px-2">Freq</th>
                    <th className="py-1.5 px-2">FD</th>
                    <th className="py-1.5 px-2">Drawn Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unequalRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-1.5 px-2 font-mono">{row.intervalInput || row.intervalText}</td>
                      <td className="py-1.5 px-2 font-mono">{row.classWidthInput || row.targetWidth}</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-700">
                        {row.frequencyInput || row.targetFreq}
                      </td>
                      <td className="py-1.5 px-2 font-mono font-bold text-purple-700">
                        {row.frequencyDensityInput || row.targetDensity}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-purple-800">
                        w={row.userBarWidth}, FD={(row.userBarDensity || 0).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleDownloadSection7}
            disabled={exportingWhich === 'sec7'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{exportingWhich === 'sec7' ? 'Generating Section 7 PDF...' : 'Download Section 7 PDF (Different Widths)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
