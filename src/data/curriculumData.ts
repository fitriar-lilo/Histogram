import { ConceptCard, DatasetPreset, ExamTableRow } from '../types';

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

export const buildExamTableRows = (classWidth: number): ExamTableRow[] => {
  const width = Math.max(5, Math.min(9, Math.round(classWidth)));
  const start = getExamStartBound(width);
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
    title: '3. Equal Class Length (Class Width = 6)',
    content: 'Class Width = Upper Boundary − Lower Boundary. For equal length 6: 144 ≤ h < 150 (width 6), 150 ≤ h < 156 (width 6), etc. Bars touch and height directly represents frequency!'
  },
  {
    title: '4. Frequency Density (Cambridge Extended)',
    content: 'When class widths are unequal: Frequency Density = Frequency ÷ Class Width. Area of bar = Frequency.'
  }
];
