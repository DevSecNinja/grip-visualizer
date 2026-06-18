import { useState } from 'react';
import { getMeasures } from './grip.js';

export const ASSESSMENT_STATUSES = [
  'not_started',
  'in_progress',
  'done',
  'not_applicable',
];

// Derive a short fingerprint of the current measure set so the localStorage
// key changes automatically when the dataset is updated (dataset evolution
// detection). Uses a djb2-XOR hash (djb2a variant) over the sorted measure codes.
function dataFingerprint() {
  const str = getMeasures()
    .map((m) => m.code)
    .sort()
    .join(',');
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

export const DATA_FINGERPRINT = dataFingerprint();
export const STORAGE_KEY = `grip-assessment-${DATA_FINGERPRINT}`;

const SCHEMA_VERSION = 1;

export function emptyState() {
  return { version: SCHEMA_VERSION, measures: {} };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== SCHEMA_VERSION) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage unavailable (e.g. strict private browsing)
  }
}

// React hook that owns the assessment state and syncs it to localStorage.
export function useAssessment() {
  const [state, _setState] = useState(() => loadFromStorage());

  function _update(updater) {
    _setState((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }

  function setStatus(code, status) {
    _update((prev) => ({
      ...prev,
      measures: {
        ...prev.measures,
        [code]: { ...prev.measures[code], status },
      },
    }));
  }

  function setNote(code, note) {
    _update((prev) => ({
      ...prev,
      measures: {
        ...prev.measures,
        [code]: { ...prev.measures[code], note },
      },
    }));
  }

  function reset() {
    _update(() => emptyState());
  }

  function importMeasures(measures) {
    _update(() => ({ ...emptyState(), measures }));
  }

  function getStatus(code) {
    return state.measures[code]?.status ?? 'not_started';
  }

  function getEntry(code) {
    return state.measures[code] ?? { status: 'not_started', note: '' };
  }

  return { state, setStatus, setNote, reset, importMeasures, getStatus, getEntry };
}

// Trigger a browser download of the current assessment as a JSON file.
export function exportAssessment(state) {
  const payload = {
    schema: 'grip-assessment',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    dataFingerprint: DATA_FINGERPRINT,
    measures: state.measures,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grip-assessment-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse and validate an imported JSON string.
// Returns { measures, warnings: { unknown: string[], missing: string[] } }
// Throws Error with message 'invalidJson' or 'invalidSchema' on failure.
export function parseImport(jsonText) {
  const measures = getMeasures();
  const knownCodes = new Set(measures.map((m) => m.code));

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('invalidJson');
  }

  if (parsed?.schema !== 'grip-assessment') {
    throw new Error('invalidSchema');
  }

  const importedMeasures = parsed.measures ?? {};
  const importedCodes = Object.keys(importedMeasures);
  const unknown = importedCodes.filter((c) => !knownCodes.has(c));
  const missing = [...knownCodes].filter((c) => !importedCodes.includes(c));

  // Strip codes not in the current dataset to avoid stale entries
  const filteredMeasures = Object.fromEntries(
    importedCodes.filter((c) => knownCodes.has(c)).map((c) => [c, importedMeasures[c]])
  );

  return { measures: filteredMeasures, warnings: { unknown, missing } };
}
