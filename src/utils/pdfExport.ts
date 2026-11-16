import { jsPDF } from 'jspdf';
import { StudentProgress, ExamTableRow, UnequalExamRow } from '../types';

const drawStudentHeader = (
  doc: jsPDF,
  subtitle: string,
  progress: StudentProgress
): { studentName: string; safeName: string } => {
  const studentName = progress.profile.name.trim() || 'Student (Unassigned)';
  const safeName = studentName.replace(/[^a-zA-Z0-9_-]+/g, '_');
  const className = progress.profile.className.trim() || 'Cambridge 0580 Cohort';
  const teacherName = progress.profile.teacherName.trim() || 'Mathematics Department';
  const examDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Header Banner
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CAMBRIDGE IGCSE MATHEMATICS (0580)', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(subtitle, 14, 21);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Chapter 20: Histograms & Continuous Data Grouping Portfolio', 14, 27);

  // Student Profile Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Student Name:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(studentName, 48, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Class/Cohort:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(className, 48, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Date Completed:', 115, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(examDate, 148, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Instructor:', 115, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(teacherName, 148, 54);

  return { studentName, safeName };
};

export const exportSection4PDF = (
  progress: StudentProgress,
  examRows: ExamTableRow[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const chosenWidth = progress.examClassWidth || 6;
  const { safeName } = drawStudentHeader(
    doc,
    `Section 4 Exam Practice: Equal Class Width Histogram (w = ${chosenWidth})`,
    progress
  );

  // --- SECTION 1: LEARNING COMPETENCIES ---
  let y = 68;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('1. Equal-Width Histogram Competencies', 14, y);

  y += 6;
  const competencies = [
    { title: 'Histogram vs Bar Chart: Continuous Data & No Gaps Rule', done: progress.conceptCompleted },
    { title: 'Converting Single Data to Grouped Data with Equal Class Length', done: progress.completedTallies },
    { title: `Section 4 Table: Grouping 30 Heights (Class Length = ${chosenWidth})`, done: progress.examTableVerified },
    { title: 'Section 4 Plot: Constructing Histogram with Equal Width & Frequency Height', done: progress.examHistogramVerified }
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
    doc.text(c.title, 62, y + 1);
    y += 8.5;
  });

  // --- SECTION 2: FREQUENCY TABLE ---
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`2. Section 4 Frequency Table: 30 Students' Heights (Class Length = ${chosenWidth})`, 14, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Single height data (145 cm to 177 cm) grouped into equal intervals of width ${chosenWidth}.`, 14, y);

  y += 5;
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
    const isFreqCorrect = parseInt(freqVal, 10) === row.targetFreq;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isFreqCorrect ? 22 : 185, isFreqCorrect ? 101 : 28, isFreqCorrect ? 52 : 28);
    doc.text(freqVal, 168, y + 4.2);

    y += 6;
  });

  // --- SECTION 3: EQUAL-WIDTH HISTOGRAM PLOT ---
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`3. Section 4 Histogram Plot (Touching Bars, Equal Class Length = ${chosenWidth})`, 14, y);

  y += 5;
  const graphX = 24;
  const graphY = y;
  const graphW = 164;
  const graphH = 52;

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(graphX, graphY, graphW, graphH, 'FD');

  const parsedBounds = examRows.map((row) => {
    const l = parseFloat(row.lowerBoundInput);
    const u = parseFloat(row.upperBoundInput);
    return {
      lower: !isNaN(l) ? l : row.targetLower,
      upper: !isNaN(u) ? u : row.targetUpper
    };
  });

  const minBound = parsedBounds[0]?.lower ?? 144;
  const maxBound = parsedBounds[parsedBounds.length - 1]?.upper ?? 180;

  let cursor4X = minBound;
  const barGeoms4 = examRows.map((row) => {
    const w = Math.max(1, row.userBarWidth || chosenWidth);
    const start = cursor4X;
    const end = start + w;
    cursor4X = end;
    return { start, end, w };
  });
  const totalSpan = Math.max(1, cursor4X - minBound, maxBound - minBound);
  const maxFreqVal = Math.max(...examRows.map((r) => Math.max(r.userBarHeight || 0, r.targetFreq)), 10);
  const maxY = Math.ceil((maxFreqVal + 1) / 2) * 2;

  // Grid & Y labels
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  for (let gridI = 0; gridI <= 4; gridI++) {
    const val = Math.round((maxY / 4) * gridI);
    const lineY = graphY + graphH - (val / maxY) * (graphH - 6);
    doc.line(graphX, lineY, graphX + graphW, lineY);
    doc.text(`${val}`, graphX - 3, lineY + 1, { align: 'right' });
  }

  // Draw Bars (Sequential Non-Overlapping)
  doc.setLineWidth(0.5);
  examRows.forEach((row, idx) => {
    const geom = barGeoms4[idx];
    const barX = graphX + ((geom.start - minBound) / totalSpan) * graphW;
    const barW = (geom.w / totalSpan) * graphW;

    const userH = row.userBarHeight > 0 ? row.userBarHeight : row.targetFreq;
    const barH = (userH / maxY) * (graphH - 6);
    const barY = graphY + graphH - barH;

    doc.setFillColor(79, 70, 229);
    doc.setDrawColor(30, 27, 75);
    doc.rect(barX, barY, barW, barH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (barH > 8 && barW > 14) {
      doc.setTextColor(255, 255, 255);
      doc.text(`f=${userH}`, barX + barW / 2, barY + barH / 2 + 2, { align: 'center' });
    } else if (barH > 6 && barW > 7) {
      doc.setTextColor(255, 255, 255);
      doc.text(`${userH}`, barX + barW / 2, barY + barH / 2 + 2, { align: 'center' });
    }
  });

  // Axes
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(graphX, graphY + graphH, graphX + graphW, graphY + graphH);
  doc.line(graphX, graphY, graphX, graphY + graphH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  let lastTick4X = -Infinity;
  barGeoms4.forEach((g, idx) => {
    const xPos = graphX + ((g.start - minBound) / totalSpan) * graphW;
    const stagger = xPos - lastTick4X < 7;
    lastTick4X = xPos;
    doc.text(`${Number(g.start.toFixed(1))}`, xPos, graphY + graphH + (stagger ? 7 : 4), { align: 'center' });
    if (idx === barGeoms4.length - 1) {
      const lastX = graphX + ((g.end - minBound) / totalSpan) * graphW;
      const staggerLast = lastX - lastTick4X < 7;
      doc.text(`${Number(g.end.toFixed(1))}`, lastX, graphY + graphH + (staggerLast ? 7 : 4), { align: 'center' });
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text(`Height of Students (h cm) — Equal Class Length = ${chosenWidth}`, graphX + graphW / 2, graphY + graphH + 11, { align: 'center' });
  doc.text('Frequency (f)', graphX - 9, graphY + graphH / 2, { angle: 90, align: 'center' });

  // --- SECTION 4: STUDENT NOTES & TEACHER SIGN-OFF ---
  y = graphY + graphH + 17;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('4. Student Reflection & Teacher Sign-Off', 14, y);

  y += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const reflection = progress.studentNotes.trim() || 'Equal class intervals plotted with touching bars and accurate frequencies.';
  const splitNotes = doc.splitTextToSize(`Student Notes: ${reflection}`, 172);
  doc.text(splitNotes.slice(0, 2), 18, y + 6);

  const statusText = progress.examTableVerified && progress.examHistogramVerified ? 'VERIFIED PASS' : 'IN PROGRESS';
  doc.setFont('helvetica', 'bold');
  doc.text(`Section 4 Status: ${statusText} (Equal Width w = ${chosenWidth})`, 18, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.line(130, y + 24, 185, y + 24);
  doc.setFontSize(7.5);
  doc.text('Teacher Signature & Date', 140, y + 28);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cambridge IGCSE 0580 Histogram Digital Learning Lab • Section 4 Report', 105, 290, { align: 'center' });

  doc.save(`Cambridge_0580_Section4_Equal_Width_${safeName}.pdf`);
};

export const exportSection7PDF = (
  progress: StudentProgress,
  unequalRows: UnequalExamRow[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { safeName } = drawStudentHeader(
    doc,
    'Section 7 Exam Practice: Different Class Widths & Frequency Density',
    progress
  );

  // --- SECTION 1: UNEQUAL WIDTH COMPETENCIES ---
  let y = 68;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text('1. Unequal-Width Histogram Competencies', 14, y);

  y += 6;
  const competencies = [
    { title: 'Section 5: Frequency vs Frequency Density (FD = Frequency ÷ Class Width)', done: progress.unequalConceptCompleted },
    { title: 'Section 6: Worked Sample — Converting Single Data to Unequal-Width Histogram', done: progress.unequalSampleCompleted },
    { title: 'Section 7 Table: Grouping 30 Reading Times & Calculating Frequency Density', done: progress.unequalTableVerified },
    { title: 'Section 7 Plot: Drawing Bars with Different Widths & Height = Frequency Density', done: progress.unequalHistogramVerified }
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
    doc.text(c.title, 62, y + 1);
    y += 8.5;
  });

  // --- SECTION 2: 6-COLUMN FREQUENCY DENSITY TABLE ---
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text('2. Section 7 Frequency Density Table: 30 Reading Times (t minutes)', 14, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Different class widths require Frequency Density = Frequency ÷ Class Width so Area of Bar = Frequency.', 14, y);

  y += 5;
  doc.setFillColor(243, 232, 255);
  doc.setDrawColor(192, 132, 252);
  doc.rect(14, y, 182, 6.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(88, 28, 135);
  doc.text('Class Interval', 17, y + 4.5);
  doc.text('Lower', 53, y + 4.5);
  doc.text('Upper', 76, y + 4.5);
  doc.text('Width (w)', 99, y + 4.5);
  doc.text('Freq (f)', 128, y + 4.5);
  doc.text('Freq Density (f/w)', 155, y + 4.5);

  y += 6.5;
  unequalRows.forEach((row, i) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 6.2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.intervalInput || row.intervalText, 17, y + 4.3);
    doc.text(row.lowerBoundInput || row.targetLower.toString(), 55, y + 4.3);
    doc.text(row.upperBoundInput || row.targetUpper.toString(), 78, y + 4.3);
    doc.text(row.classWidthInput || row.targetWidth.toString(), 104, y + 4.3);
    doc.text(row.frequencyInput || row.targetFreq.toString(), 132, y + 4.3);

    const fdText = row.frequencyDensityInput || row.targetDensity.toFixed(1);
    const fdNum = parseFloat(fdText);
    const isFdOk = !isNaN(fdNum) && Math.abs(fdNum - row.targetDensity) <= 0.05;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isFdOk ? 22 : 185, isFdOk ? 101 : 28, isFdOk ? 52 : 28);
    doc.text(fdText, 165, y + 4.3);

    y += 6.2;
  });

  // --- SECTION 3: UNEQUAL-WIDTH FREQUENCY DENSITY HISTOGRAM ---
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text('3. Section 7 Histogram Plot (Different Widths, Y-Axis = Frequency Density)', 14, y);

  y += 5;
  const graphX = 25;
  const graphY = y;
  const graphW = 163;
  const graphH = 56;

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(graphX, graphY, graphW, graphH, 'FD');

  const parsedBounds = unequalRows.map((row) => {
    const l = parseFloat(row.lowerBoundInput);
    const u = parseFloat(row.upperBoundInput);
    return {
      lower: !isNaN(l) ? l : row.targetLower,
      upper: !isNaN(u) ? u : row.targetUpper
    };
  });

  const minBound = parsedBounds[0]?.lower ?? 0;
  const maxBound = parsedBounds[parsedBounds.length - 1]?.upper ?? 45;

  let cursor7X = minBound;
  const barGeoms7 = unequalRows.map((row) => {
    const w = Math.max(1, row.userBarWidth > 0 ? row.userBarWidth : row.targetWidth);
    const start = cursor7X;
    const end = start + w;
    cursor7X = end;
    return { start, end, w };
  });
  const totalSpan = Math.max(1, cursor7X - minBound, maxBound - minBound);
  const maxFD = Math.max(
    ...unequalRows.map((r) => Math.max(r.userBarDensity || 0, r.targetDensity)),
    1.6
  );
  const maxY = Math.max(2.0, Math.ceil((maxFD + 0.2) / 0.4) * 0.4);

  // Horizontal grid lines + Y ticks
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const stepCount = 5;
  for (let i = 0; i <= stepCount; i++) {
    const tickVal = Number(((maxY / stepCount) * i).toFixed(2));
    const lineY = graphY + graphH - (tickVal / maxY) * (graphH - 6);
    doc.line(graphX, lineY, graphX + graphW, lineY);
    doc.text(tickVal.toFixed(1), graphX - 3, lineY + 1, { align: 'right' });
  }

  // Draw Unequal Bars (Sequential Non-Overlapping)
  doc.setLineWidth(0.5);
  unequalRows.forEach((row, idx) => {
    const geom = barGeoms7[idx];
    const userFD = row.userBarDensity > 0 ? row.userBarDensity : row.targetDensity;

    const barX = graphX + ((geom.start - minBound) / totalSpan) * graphW;
    const barW = (geom.w / totalSpan) * graphW;
    const barH = (userFD / maxY) * (graphH - 6);
    const barY = graphY + graphH - barH;

    doc.setFillColor(124, 58, 237);
    doc.setDrawColor(46, 16, 101);
    doc.rect(barX, barY, barW, barH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (barH > 10 && barW > 12) {
      doc.setTextColor(255, 255, 255);
      doc.text(`${userFD.toFixed(1)}`, barX + barW / 2, barY + barH / 2 + 1.5, { align: 'center' });
    } else if (userFD > 0) {
      doc.setTextColor(88, 28, 135);
      doc.text(`${userFD.toFixed(1)}`, barX + barW / 2, Math.max(graphY + 3, barY - 1.5), { align: 'center' });
    }
  });

  // Axes & X boundary labels
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(graphX, graphY + graphH, graphX + graphW, graphY + graphH);
  doc.line(graphX, graphY, graphX, graphY + graphH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  let lastTick7X = -Infinity;
  barGeoms7.forEach((g, idx) => {
    const xPos = graphX + ((g.start - minBound) / totalSpan) * graphW;
    const stagger = xPos - lastTick7X < 7;
    lastTick7X = xPos;
    doc.text(`${Number(g.start.toFixed(1))}`, xPos, graphY + graphH + (stagger ? 7 : 4), { align: 'center' });
    if (idx === barGeoms7.length - 1) {
      const lastX = graphX + ((g.end - minBound) / totalSpan) * graphW;
      const staggerLast = lastX - lastTick7X < 7;
      doc.text(`${Number(g.end.toFixed(1))}`, lastX, graphY + graphH + (staggerLast ? 7 : 4), { align: 'center' });
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(88, 28, 135);
  doc.text('Daily Reading Time (t minutes) — Different Class Widths', graphX + graphW / 2, graphY + graphH + 11, { align: 'center' });
  doc.text('Frequency Density', graphX - 10, graphY + graphH / 2, { angle: 90, align: 'center' });

  // --- SECTION 4: STUDENT NOTES & TEACHER SIGN-OFF ---
  y = graphY + graphH + 17;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text('4. Student Reflection & Teacher Sign-Off', 14, y);

  y += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const reflection =
    progress.studentNotes.trim() ||
    'Calculated Frequency Density = Frequency ÷ Class Width so bar area represents frequency.';
  const splitNotes = doc.splitTextToSize(`Student Notes: ${reflection}`, 172);
  doc.text(splitNotes.slice(0, 2), 18, y + 6);

  const statusText = progress.unequalTableVerified && progress.unequalHistogramVerified ? 'VERIFIED PASS' : 'IN PROGRESS';
  doc.setFont('helvetica', 'bold');
  doc.text(`Section 7 Status: ${statusText} (Different Class Widths & FD)`, 18, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.line(130, y + 24, 185, y + 24);
  doc.setFontSize(7.5);
  doc.text('Teacher Signature & Date', 140, y + 28);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cambridge IGCSE 0580 Histogram Digital Learning Lab • Section 7 Report', 105, 290, { align: 'center' });

  doc.save(`Cambridge_0580_Section7_Unequal_Width_${safeName}.pdf`);
};
