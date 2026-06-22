import { useState } from 'react';
import { getMeasures } from './grip.js';

export const ASSESSMENT_STATUSES = [
  'not_started',
  'in_progress',
  'done',
  'not_applicable',
];

const STATUS_SET = new Set(ASSESSMENT_STATUSES);
const DEFAULT_STATUS = 'not_started';

// Maximum length of a single free-text note. Imported notes are truncated to
// this length so a crafted file cannot bloat localStorage past its quota.
export const MAX_NOTE_LENGTH = 5000;

// Keys that must never be written as object members from untrusted input, to
// avoid prototype-pollution sinks (e.g. result['__proto__'] = ...).
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Coerce a status value to a supported status, defaulting to 'not_started'.
function normalizeStatus(status) {
  return STATUS_SET.has(status) ? status : DEFAULT_STATUS;
}

// Coerce an arbitrary entry into a safe { status, note } shape.
function normalizeEntry(entry) {
  const source = isPlainObject(entry) ? entry : {};
  const note =
    typeof source.note === 'string' ? source.note.slice(0, MAX_NOTE_LENGTH) : '';
  return {
    status: normalizeStatus(source.status),
    note,
  };
}

// Normalize a measures map so every entry has a valid status/note shape.
// Uses a null-prototype object and skips dangerous keys so untrusted data can
// never pollute Object.prototype via a '__proto__'/'constructor' member.
function normalizeMeasures(measures) {
  if (!isPlainObject(measures)) return {};
  const result = Object.create(null);
  for (const code of Object.keys(measures)) {
    if (FORBIDDEN_KEYS.has(code)) continue;
    result[code] = normalizeEntry(measures[code]);
  }
  return { ...result };
}

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
    return { version: SCHEMA_VERSION, measures: normalizeMeasures(parsed.measures) };
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
    return normalizeStatus(state.measures[code]?.status);
  }

  function getEntry(code) {
    return normalizeEntry(state.measures[code]);
  }

  return { state, setStatus, setNote, reset, importMeasures, getStatus, getEntry };
}

// Returns the normalized self-evaluation entry ({ status, note }) for a measure
// code from a state object (as produced by useAssessment / parseImport). Safe
// for missing or empty state so export code can call it unconditionally.
export function entryForCode(state, code) {
  return normalizeEntry(state?.measures?.[code]);
}

// True when an entry carries meaningful self-evaluation: a non-default status
// or a non-empty note. Used to decide whether to render self-evaluation detail
// in exports.
export function hasSelfEvaluation(entry) {
  if (!entry) return false;
  return entry.status !== DEFAULT_STATUS || (entry.note ?? '').trim() !== '';
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

  // Only accept files produced by a schema version we understand. A newer or
  // unknown version may carry an incompatible shape, so reject it explicitly
  // instead of importing partially-understood data.
  if (parsed.version !== undefined && parsed.version !== SCHEMA_VERSION) {
    throw new Error('invalidVersion');
  }

  const importedMeasures = isPlainObject(parsed.measures) ? parsed.measures : {};
  const importedCodes = Object.keys(importedMeasures);
  const unknown = importedCodes.filter((c) => !knownCodes.has(c));
  const missing = [...knownCodes].filter((c) => !importedCodes.includes(c));

  // Strip codes not in the current dataset to avoid stale entries and
  // normalize each entry so a malformed file cannot store invalid shapes.
  const filteredMeasures = Object.fromEntries(
    importedCodes
      .filter((c) => knownCodes.has(c))
      .map((c) => [c, normalizeEntry(importedMeasures[c])])
  );

  return { measures: filteredMeasures, warnings: { unknown, missing } };
}
