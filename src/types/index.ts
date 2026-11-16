export type ModuleTab =
  | 'concept'
  | 'grouping'
  | 'histogram'
  | 'practice'
  | 'unequal-concept'
  | 'unequal-sample'
  | 'unequal-practice'
  | 'export';

export interface StudentProfile {
  name: string;
  className: string;
  teacherName: string;
  lastUpdated: string;
}

export interface GroupedInterval {
  id: string;
  lowerBound: number;
  upperBound: number;
  classWidth: number;
  tally: number;
  frequency: number;
  frequencyDensity: number;
  userHeight: number;
}

export interface ExamTableRow {
  id: string;
  intervalInput: string;
  intervalText: string;
  lowerBoundInput: string;
  upperBoundInput: string;
  classWidthInput: string;
  frequencyInput: string;
  userBarHeight: number;
  userBarWidth: number;
  // Target correct values for automatic feedback
  targetLower: number;
  targetUpper: number;
  targetWidth: number;
  targetFreq: number;
}

export interface UnequalExamRow {
  id: string;
  intervalInput: string;
  intervalText: string;
  lowerBoundInput: string;
  upperBoundInput: string;
  classWidthInput: string;
  frequencyInput: string;
  frequencyDensityInput: string;
  userBarWidth: number;
  userBarDensity: number;
  // Target values for scaffolding & verification
  targetLower: number;
  targetUpper: number;
  targetWidth: number;
  targetFreq: number;
  targetDensity: number;
}

export interface DatasetPreset {
  id: string;
  title: string;
  context: string;
  unit: string;
  variableName: string;
  rawData: number[];
  recommendedIntervalWidth: number;
  minVal: number;
  maxVal: number;
  isEqualWidth: boolean;
  cambridgeNote: string;
}

export interface ConceptCard {
  id: string;
  statement: string;
  correctCategory: 'barchart' | 'histogram';
  explanation: string;
  hint: string;
}

export interface StudentProgress {
  profile: StudentProfile;
  currentTab: ModuleTab;
  conceptScore: number;
  conceptCompleted: boolean;
  selectedDatasetId: string;
  activeIntervalWidth: number;
  completedTallies: boolean;
  histogramVerified: boolean;
  examTableRows: ExamTableRow[];
  examClassWidth: number;
  examTableVerified: boolean;
  examHistogramVerified: boolean;
  unequalConceptCompleted: boolean;
  unequalConceptScore: number;
  unequalSampleCompleted: boolean;
  unequalExamRows: UnequalExamRow[];
  unequalTableVerified: boolean;
  unequalHistogramVerified: boolean;
  customIntervals: GroupedInterval[];
  studentNotes: string;
}
