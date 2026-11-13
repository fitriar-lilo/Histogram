import { StudentProgress } from '../types';
import { DATASET_PRESETS, INITIAL_EXAM_TABLE_ROWS } from '../data/curriculumData';

const STORAGE_KEY = 'cambridge_0580_histogram_lab_v2';

export const getInitialProgress = (): StudentProgress => {
  const defaultPreset = DATASET_PRESETS[0];
  const defaultIntervals = [
    { id: 'int-1', lowerBound: 20, upperBound: 30, classWidth: 10, tally: 3, frequency: 3, frequencyDensity: 0.3, userHeight: 0 },
    { id: 'int-2', lowerBound: 30, upperBound: 40, classWidth: 10, tally: 4, frequency: 4, frequencyDensity: 0.4, userHeight: 0 },
    { id: 'int-3', lowerBound: 40, upperBound: 50, classWidth: 10, tally: 6, frequency: 6, frequencyDensity: 0.6, userHeight: 0 },
    { id: 'int-4', lowerBound: 50, upperBound: 60, classWidth: 10, tally: 7, frequency: 7, frequencyDensity: 0.7, userHeight: 0 },
    { id: 'int-5', lowerBound: 60, upperBound: 70, classWidth: 10, tally: 5, frequency: 5, frequencyDensity: 0.5, userHeight: 0 },
    { id: 'int-6', lowerBound: 70, upperBound: 80, classWidth: 10, tally: 4, frequency: 4, frequencyDensity: 0.4, userHeight: 0 },
    { id: 'int-7', lowerBound: 80, upperBound: 90, classWidth: 10, tally: 1, frequency: 1, frequencyDensity: 0.1, userHeight: 0 },
  ];

  return {
    profile: {
      name: '',
      className: 'IGCSE Year 10 / 11',
      teacherName: 'Mathematics Department',
      lastUpdated: new Date().toISOString()
    },
    currentTab: 'concept',
    conceptScore: 0,
    conceptCompleted: false,
    selectedDatasetId: defaultPreset.id,
    activeIntervalWidth: 10,
    completedTallies: false,
    histogramVerified: false,
    examTableRows: INITIAL_EXAM_TABLE_ROWS,
    examClassWidth: 6,
    examTableVerified: false,
    examHistogramVerified: false,
    customIntervals: defaultIntervals,
    studentNotes: ''
  };
};

export const loadSavedProgress = (): StudentProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialProgress();
    const parsed = JSON.parse(raw);
    const merged = { ...getInitialProgress(), ...parsed };
    if (!merged.examClassWidth || merged.examClassWidth < 5 || merged.examClassWidth > 9) {
      merged.examClassWidth = 6;
    }
    return merged;
  } catch (e) {
    console.warn('Failed to load saved progress:', e);
    return getInitialProgress();
  }
};

export const saveStudentProgress = (progress: StudentProgress) => {
  try {
    const dataWithTimestamp = {
      ...progress,
      profile: {
        ...progress.profile,
        lastUpdated: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (e) {
    console.warn('Failed to save student progress:', e);
  }
};

export const clearStudentProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear student progress:', e);
  }
};
