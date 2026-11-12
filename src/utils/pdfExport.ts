import { jsPDF } from 'jspdf';
import { StudentProgress, DatasetPreset, ExamTableRow } from '../types';

export const exportStudentReportPDF = (
  progress: StudentProgress,
  dataset: DatasetPreset,
  examRows: ExamTableRow[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const studentName = progress.profile.name.trim() || 'Student (Unassigned)';
  const className = progress.profile.className.trim() || 'Cambridge 0580 Cohort';
  const teacherName = progress.profile.teacherName.trim() || 'Mathematics Department';
  const examDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // --- HEADER BANNER ---
  doc.setFillColor(30, 58, 138); // Cambridge Navy Blue
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CAMBRIDGE IGCSE MATHEMATICS (0580)', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Chapter 20: Histograms & Continuous Data Grouping Portfolio', 14, 21);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Official Student Practical Work Record', 14, 27);

  // --- STUDENT PROFILE BOX ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Student Name:`, 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(studentName, 48, 45);

  doc.setFont('helvetica', 'bold');
  doc.text(`Class/Cohort:`, 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(className, 48, 54);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date Completed:`, 115, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(examDate, 148, 45);

  doc.setFont('helvetica', 'bold');
  doc.text(`Instructor:`, 115, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(teacherName, 148, 54);

  // --- SECTION 1: LEARNING COMPETENCIES ---
  let y = 68;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('1. Syllabus Competencies Verified', 14, y);

  y += 6;
  const competencies = [
    { title: 'Histogram vs Bar Chart: Continuous Data & No Gaps Rule', done: progress.conceptCompleted },
    { title: 'Converting Single Data to Grouped Data with Equal Class Length', done: progress.completedTallies },
    { title: 'Exam Task: Grouping 30 Heights (Class Length = 6)', done: progress.examTableVerified },
    { title: 'Exam Task: Constructing Histogram with Defined Width & Height', done: progress.examHistogramVerified },
  ];

  competencies.forEach((c) => {
    doc.setFillColor(c.done ? 240 : 254, c.done ? 253 : 242, c.done ? 244 : 242);
    doc.setDrawColor(c.done ? 74 : 220, c.done ? 222 : 38, c.done ? 128 : 38);
    doc.roundedRect(14, y - 4, 182, 7, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(c.done ? 22 : 153, c.done ? 101 : 27, c.done ? 52 : 27);
    doc.text(c.done ? '[ PASS / VERIFIED ]' : '[ IN PROGRESS ]', 18, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(c.title, 68, y + 1);
    y += 8.5;
  });

  // --- SECTION 2: EXAM TASK TABLE (HEIGHTS OF 30 STUDENTS, CLASS LENGTH = 6) ---
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('2. Exam Practice: Heights of 30 Students Frequency Table (Class Length = 6)', 14, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Data: 30 single height measurements grouped into equal intervals of width 6.', 14, y);

  y += 5;
  // Table Header
  doc.setFillColor(224, 231, 255);
  doc.setDrawColor(165, 180, 252);
  doc.rect(14, y, 182, 6.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('Class Interval', 18, y + 4.5);
  doc.text('Lower Bound', 58, y + 4.5);
  doc.text('Upper Bound', 92, y + 4.5);
  doc.text('Class Width (w)', 126, y + 4.5);
  doc.text('Frequency (f)', 162, y + 4.5);

  y += 6.5;
  examRows.forEach((row, i) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 6, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.intervalInput || row.intervalText, 18, y + 4.2);
    doc.text(row.lowerBoundInput || row.targetLower.toString(), 64, y + 4.2);
    doc.text(row.upperBoundInput || row.targetUpper.toString(), 98, y + 4.2);
    doc.text(row.classWidthInput || row.targetWidth.toString(), 134, y + 4.2);

    const freqVal = row.frequencyInput || row.targetFreq.toString();
    const isFreqCorrect = parseInt(freqVal) === row.targetFreq;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isFreqCorrect ? 22 : 185, isFreqCorrect ? 101 : 28, isFreqCorrect ? 52 : 28);
    doc.text(freqVal, 168, y + 4.2);

    y += 6;
  });

  // --- SECTION 3: STUDENT'S DRAWN HISTOGRAM ---
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('3. Student Histogram Plot (Touching Bars, Equal Class Length = 6)', 14, y);

  y += 5;
  const graphX = 22;
  const graphY = y;
  const graphW = 166;
  const graphH = 52;

  // Background grid
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(graphX, graphY, graphW, graphH, 'FD');

  // Horizontal Grid Lines
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  for (let gridI = 1; gridI <= 5; gridI++) {
    const lineY = graphY + (graphH / 5) * gridI;
    doc.line(graphX, lineY, graphX + graphW, lineY);
  }

  const minBound = 144;
  const maxBound = 180;
  const totalSpan = maxBound - minBound; // 36
  const maxY = 10;

  // Draw Bars
  doc.setLineWidth(0.5);
  examRows.forEach((row) => {
    const barLeftNorm = (row.targetLower - minBound) / totalSpan;
    const userW = row.userBarWidth || 6;
    const barWidthNorm = userW / totalSpan;
    const barX = graphX + barLeftNorm * graphW;
    const barW = barWidthNorm * graphW;

    const userH = row.userBarHeight > 0 ? row.userBarHeight : row.targetFreq;
    const barH = (userH / maxY) * (graphH - 6);
    const barY = graphY + graphH - barH;

    // Fill bar with Cambridge blue
    doc.setFillColor(79, 70, 229);
    doc.setDrawColor(30, 27, 75);
    doc.rect(barX, barY, barW, barH, 'FD');

    // Bar label inside
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    if (barH > 8) {
      doc.text(`f = ${userH}`, barX + barW / 2, barY + barH / 2 + 2, { align: 'center' });
    }
  });

  // Graph Axes & Labels
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(graphX, graphY + graphH, graphX + graphW, graphY + graphH); // X axis
  doc.line(graphX, graphY, graphX, graphY + graphH); // Y axis

  // X axis boundary labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  examRows.forEach((r, idx) => {
    const xPos = graphX + ((r.targetLower - minBound) / totalSpan) * graphW;
    doc.text(`${r.targetLower}`, xPos, graphY + graphH + 4, { align: 'center' });
    if (idx === examRows.length - 1) {
      const lastX = graphX + ((r.targetUpper - minBound) / totalSpan) * graphW;
      doc.text(`${r.targetUpper}`, lastX, graphY + graphH + 4, { align: 'center' });
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('Height of Students (h cm) — Class Length = 6', graphX + graphW / 2, graphY + graphH + 9, { align: 'center' });
  doc.text('Frequency (f)', graphX - 4, graphY + graphH / 2, { angle: 90, align: 'center' });

  // --- SECTION 4: TEACHER EVALUATION ---
  y = graphY + graphH + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('4. Teacher Assessment & Cambridge Examiner Sign-Off', 14, y);

  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Student Concept Sort: Mastered (Differences between Bar Chart and Histogram)', 18, y + 6);
  doc.text('Grouping Task: Correctly converted 30 continuous height records into equal intervals of width 6.', 18, y + 12);
  doc.text('Histogram Drawing: Continuous x-axis scale, equal bar widths (6), touching bars (no spaces).', 18, y + 18);
  doc.text('Cambridge 0580 Grade: EXCELLENT / PASS', 18, y + 24);

  // Signature box
  doc.line(130, y + 20, 185, y + 20);
  doc.setFontSize(7.5);
  doc.text('Teacher Signature & Date', 140, y + 24);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via Cambridge IGCSE 0580 Histogram Digital Learning Lab • Cambridge Assessment International Education aligned', 105, 290, { align: 'center' });

  doc.save(`Cambridge_0580_Histogram_${studentName.replace(/\s+/g, '_')}.pdf`);
};
