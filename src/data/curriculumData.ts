import { ConceptCard, DatasetPreset, ExamTableRow, UnequalExamRow } from '../types';

export const EXAM_HEIGHTS_DATA: number[] = [
  145, 147, 148, 149,
  150, 151, 152, 153, 154, 155,
  156, 157, 158, 159, 160, 160, 161, 161,
  162, 163, 164, 165, 166, 167,
  168, 169, 170, 172,
  174, 177
];

export const EXAM_CLASS_WIDTH_OPTIONS = [5, 6, 7, 8, 9] as const;

export const getExamStartBound = (classWidth: number): number => {
  // Choose clean starting lower bounds for each width (5 to 9) so min=145 and max=177 are neatly covered
  switch (classWidth) {
    case 5:
      return 145;
    case 6:
      return 144;
    case 7:
      return 145;
    case 8:
      return 144;
    case 9:
      return 144;
    default:
      return Math.floor(145 / classWidth) * classWidth;
  }
};

export const buildExamTableRows = (classWidth: number, customStart?: number): ExamTableRow[] => {
  const width = Math.max(4, Math.min(12, Math.round(classWidth)));
  const minData = Math.min(...EXAM_HEIGHTS_DATA); // 145
  const start =
    typeof customStart === 'number' && !isNaN(customStart)
      ? Math.min(minData, Math.round(customStart))
      : getExamStartBound(width);
  const maxData = Math.max(...EXAM_HEIGHTS_DATA); // 177
  const rows: ExamTableRow[] = [];

  let currentLower = start;
  let idx = 1;

  while (currentLower <= maxData) {
    const currentUpper = currentLower + width;
    const isLast = currentUpper > maxData;
    const freq = EXAM_HEIGHTS_DATA.filter((val) =>
      isLast ? val >= currentLower && val <= currentUpper : val >= currentLower && val < currentUpper
    ).length;

    rows.push({
      id: `row-${idx}`,
      intervalInput: '',
      intervalText: isLast
        ? `${currentLower} ≤ h ≤ ${currentUpper}`
        : `${currentLower} ≤ h < ${currentUpper}`,
      lowerBoundInput: '',
      upperBoundInput: '',
      classWidthInput: '',
      frequencyInput: '',
      userBarHeight: 0,
      userBarWidth: width,
      targetLower: currentLower,
      targetUpper: currentUpper,
      targetWidth: width,
      targetFreq: freq
    });

    currentLower = currentUpper;
    idx += 1;
  }

  return rows;
};

export const INITIAL_EXAM_TABLE_ROWS: ExamTableRow[] = buildExamTableRows(6);

export const DATASET_PRESETS: DatasetPreset[] = [
  {
    id: 'math-test-scores',
    title: 'Cambridge Math Test Scores (Equal Width = 10)',
    context: 'Scores of 30 students in a Cambridge IGCSE Mathematics mock exam (out of 100).',
    unit: 'marks',
    variableName: 'Score (m)',
    rawData: [
      23, 27, 29, 31, 34, 38, 39,
      41, 42, 44, 46, 47, 49,
      51, 52, 54, 55, 57, 58, 59,
      61, 63, 66, 68, 69,
      72, 74, 76, 79, 83
    ],
    recommendedIntervalWidth: 10,
    minVal: 20,
    maxVal: 90,
    isEqualWidth: true,
    cambridgeNote: 'Notice equal intervals: 20 ≤ m < 30, 30 ≤ m < 40, etc. When intervals are equal, bar heights directly represent frequency!'
  },
  {
    id: 'plant-heights',
    title: 'Biology Experiment: Plant Heights (Equal Width = 5)',
    context: 'Heights of 25 seedlings measured after 4 weeks of growth.',
    unit: 'cm',
    variableName: 'Height (h cm)',
    rawData: [
      12.4, 13.8, 14.5,
      16.1, 17.2, 18.0, 19.3,
      20.5, 21.0, 22.8, 23.5, 24.1, 24.7,
      25.3, 26.8, 27.5, 28.2, 29.0,
      30.5, 31.4, 32.0, 33.5, 34.2,
      36.0, 38.5
    ],
    recommendedIntervalWidth: 5,
    minVal: 10,
    maxVal: 40,
    isEqualWidth: true,
    cambridgeNote: 'Heights are continuous data (can take any decimal value). There must be NO gaps between bars!'
  },
  {
    id: 'sprint-times',
    title: 'Athletics: 200m Sprint Times (Equal Width = 2)',
    context: 'Times taken by 24 school runners to complete the 200m sprint.',
    unit: 'seconds',
    variableName: 'Time (t s)',
    rawData: [
      24.8, 25.4, 25.9,
      26.1, 26.3, 26.7, 27.2, 27.8,
      28.0, 28.3, 28.5, 28.9, 29.1, 29.5, 29.8,
      30.2, 30.6, 31.1, 31.5,
      32.2, 32.8, 33.4, 34.0, 35.2
    ],
    recommendedIntervalWidth: 2,
    minVal: 24,
    maxVal: 36,
    isEqualWidth: true,
    cambridgeNote: 'Continuous data with class intervals like 24 ≤ t < 26, 26 ≤ t < 28. No gaps between bars.'
  }
];

export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: 'c1',
    statement: 'Represents CONTINUOUS data (like height, weight, time, speed)',
    correctCategory: 'histogram',
    explanation: 'Histograms are specifically used for continuous variables that can take any value along a scale.',
    hint: 'Think about measurements you use a ruler, timer, or scale for.'
  },
  {
    id: 'c2',
    statement: 'Has GAPS between bars to show distinct categories',
    correctCategory: 'barchart',
    explanation: 'Bar charts have equal gaps between bars because the categories are separate and discrete (e.g. favourite sports or shoe sizes).',
    hint: 'Look at categorical data where one item does not touch the next.'
  },
  {
    id: 'c3',
    statement: 'NO GAPS between bars (adjacent bars touch each other)',
    correctCategory: 'histogram',
    explanation: 'Bars touch each other because class boundaries are continuous — where one interval ends, the next begins immediately!',
    hint: '20 to 30, then 30 to 40... the boundary 30 is shared!'
  },
  {
    id: 'c4',
    statement: 'Represents DISCRETE or CATEGORICAL data (e.g. pet type, eye colour)',
    correctCategory: 'barchart',
    explanation: 'Bar charts are for discrete counts and named categories.',
    hint: 'You cannot be halfway between a cat and a dog.'
  },
  {
    id: 'c5',
    statement: 'The AREA of each bar is proportional to the FREQUENCY',
    correctCategory: 'histogram',
    explanation: 'In Cambridge 0580, the golden rule of a histogram is: Area = Frequency (or Area ∝ Frequency).',
    hint: 'Frequency Density × Class Width = Area = Frequency!'
  },
  {
    id: 'c6',
    statement: 'The width of the bars has NO mathematical meaning',
    correctCategory: 'barchart',
    explanation: 'In a bar chart, bar width is chosen arbitrarily for neat visual display, with equal spaces in between.',
    hint: 'Does making a bar wider change the number of people who chose apples?'
  },
  {
    id: 'c7',
    statement: 'Horizontal axis is a continuous NUMBER LINE with class boundaries',
    correctCategory: 'histogram',
    explanation: 'In a histogram, the x-axis is an accurate, scaled number line showing lower and upper class boundaries.',
    hint: 'Just like coordinates on graph paper!'
  },
  {
    id: 'c8',
    statement: 'Vertical axis height directly represents frequency in equal class intervals',
    correctCategory: 'histogram',
    explanation: 'When all class widths are equal (e.g. each width is 6 or 10), height is directly proportional to frequency!',
    hint: 'Height = Frequency / Class Width; if Width is constant, Height is directly proportional to Frequency.'
  }
];

export const CAMBRIDGE_GUIDE_SECTIONS = [
  {
    title: '1. What is a Histogram?',
    content: 'A graphical display of continuous numerical data grouped into class intervals. Bars touch because measurements flow continuously without gaps.'
  },
  {
    title: '2. Bar Chart vs Histogram',
    content: 'Bar chart = discrete categories + spaces between bars. Histogram = continuous numbers + NO spaces between bars.'
  },
  {
    title: '3. Equal Class Length',
    content: 'Class Width = Upper Boundary − Lower Boundary. When all intervals have equal length (e.g. width 5–9), bar height directly represents frequency!'
  },
  {
    title: '4. Different Class Widths & Frequency Density',
    content: 'When class widths are unequal, Frequency Density = Frequency ÷ Class Width. Plot Frequency Density on the y-axis so Area of bar = Frequency.'
  }
];

export interface FrequencyVsDensityCard {
  id: string;
  statement: string;
  correctCategory: 'frequency' | 'density';
  explanation: string;
}

export const UNEQUAL_CONCEPT_CARDS: FrequencyVsDensityCard[] = [
  {
    id: 'fd-1',
    statement: 'The exact COUNT of items or people inside a class interval (e.g. 8 students)',
    correctCategory: 'frequency',
    explanation: 'Frequency is simply how many data values fall inside a group.'
  },
  {
    id: 'fd-2',
    statement: 'Calculated using Frequency ÷ Class Width (how crowded the data is per 1 unit)',
    correctCategory: 'density',
    explanation: 'Frequency Density tells us the frequency per single unit on the horizontal axis: FD = Frequency ÷ Class Width.'
  },
  {
    id: 'fd-3',
    statement: 'Plotted on the VERTICAL (Y) axis when bars have DIFFERENT widths',
    correctCategory: 'density',
    explanation: 'When class widths are unequal, we MUST plot Frequency Density on the vertical axis so wider bars do not look artificially huge!'
  },
  {
    id: 'fd-4',
    statement: 'Represented by the AREA of each bar (Width × Height) in an unequal-width histogram',
    correctCategory: 'frequency',
    explanation: 'Area = Class Width × Frequency Density = Frequency!'
  },
  {
    id: 'fd-5',
    statement: 'Can be a decimal number like 0.4, 1.2, or 1.6',
    correctCategory: 'density',
    explanation: 'Because Frequency Density comes from dividing Frequency by Class Width, it is very often a decimal.'
  },
  {
    id: 'fd-6',
    statement: 'Always a whole counting number (0, 1, 2, 3...) that sums to the total sample size',
    correctCategory: 'frequency',
    explanation: 'You count whole observations (students, cars, plants), so frequency is always a whole number.'
  }
];

// Section 6 Worked Sample: 25 Puzzle Completion Times (minutes)
export const UNEQUAL_SAMPLE_DATA: number[] = [
  2, 4, 5, 7, 8, 9,
  10, 11, 12, 13, 14, 14,
  15, 16, 17, 17, 18, 19, 19, 19,
  21, 23, 25, 27, 29
];

export interface UnequalSampleInterval {
  id: string;
  intervalText: string;
  lower: number;
  upper: number;
  width: number;
  frequency: number;
  frequencyDensity: number;
  values: number[];
}

export const UNEQUAL_SAMPLE_INTERVALS: UnequalSampleInterval[] = [
  {
    id: 'sample-1',
    intervalText: '0 ≤ t < 10',
    lower: 0,
    upper: 10,
    width: 10,
    frequency: 6,
    frequencyDensity: 0.6,
    values: [2, 4, 5, 7, 8, 9]
  },
  {
    id: 'sample-2',
    intervalText: '10 ≤ t < 15',
    lower: 10,
    upper: 15,
    width: 5,
    frequency: 6,
    frequencyDensity: 1.2,
    values: [10, 11, 12, 13, 14, 14]
  },
  {
    id: 'sample-3',
    intervalText: '15 ≤ t < 20',
    lower: 15,
    upper: 20,
    width: 5,
    frequency: 8,
    frequencyDensity: 1.6,
    values: [15, 16, 17, 17, 18, 19, 19, 19]
  },
  {
    id: 'sample-4',
    intervalText: '20 ≤ t ≤ 30',
    lower: 20,
    upper: 30,
    width: 10,
    frequency: 5,
    frequencyDensity: 0.5,
    values: [21, 23, 25, 27, 29]
  }
];

// Section 7 Exam Practice: Daily Reading Time (t minutes) of 30 Students
export const UNEQUAL_EXAM_DATA: number[] = [
  3, 5, 7, 9,
  10, 11, 12, 13, 14, 14,
  15, 16, 16, 17, 18, 18, 19, 19,
  20, 21, 22, 24, 25, 26, 27, 28, 29,
  32, 38, 44
];

export const UNEQUAL_WIDTH_PRESETS: { id: string; label: string; widths: number[]; start: number }[] = [
  { id: 'preset-5a', label: '5 Groups: 10, 5, 5, 10, 15', widths: [10, 5, 5, 10, 15], start: 0 },
  { id: 'preset-5b', label: '5 Groups: 10, 10, 5, 5, 15', widths: [10, 10, 5, 5, 15], start: 0 },
  { id: 'preset-4a', label: '4 Groups: 15, 5, 10, 15', widths: [15, 5, 10, 15], start: 0 }
];

export const buildUnequalExamRows = (widths: number[], startBound = 0): UnequalExamRow[] => {
  const safeStart = Math.max(0, Math.min(Math.min(...UNEQUAL_EXAM_DATA), Math.round(startBound)));
  const rows: UnequalExamRow[] = [];
  let currentLower = safeStart;

  widths.forEach((rawW, idx) => {
    const w = Math.max(2, Math.min(30, Math.round(rawW)));
    const currentUpper = currentLower + w;
    const isLast = idx === widths.length - 1;
    const freq = UNEQUAL_EXAM_DATA.filter((val) =>
      isLast ? val >= currentLower && val <= currentUpper : val >= currentLower && val < currentUpper
    ).length;
    const fd = Number((freq / w).toFixed(2));

    rows.push({
      id: `urow-${idx + 1}`,
      intervalInput: '',
      intervalText: isLast
        ? `${currentLower} ≤ t ≤ ${currentUpper}`
        : `${currentLower} ≤ t < ${currentUpper}`,
      lowerBoundInput: '',
      upperBoundInput: '',
      classWidthInput: '',
      frequencyInput: '',
      frequencyDensityInput: '',
      userBarWidth: 5,
      userBarDensity: 0,
      targetLower: currentLower,
      targetUpper: currentUpper,
      targetWidth: w,
      targetFreq: freq,
      targetDensity: fd
    });

    currentLower = currentUpper;
  });

  return rows;
};

export const INITIAL_UNEQUAL_EXAM_ROWS: UnequalExamRow[] = buildUnequalExamRows([10, 5, 5, 10, 15], 0);
