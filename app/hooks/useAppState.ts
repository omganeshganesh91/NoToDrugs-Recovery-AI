'use client';
// ─── Central App State Hook ───────────────────────────────────────────────────

import { useReducer, useCallback, useState } from 'react';
import { AppState, LastAction, PatientStatus } from '../types';
import { generateAIScript, MOCK_PATIENTS } from '../lib/ai-engine';
import { PatientProfile } from '../types';

type Action =
  | { type: 'TRIGGER'; event: LastAction; script: string }
  | { type: 'SET_SCRIPT'; script: string }
  | { type: 'CLOSE_INTERVENTION' }
  | { type: 'RESET' };

const INITIAL_STATE: AppState = {
  patientStatus: 'stable',
  lastAction: 'idle',
  timestamp: null,
  interventionOpen: false,
  caregiverAlerted: false,
  aiScript: '',
  voiceActive: false,
  safeLogCount: 0,
};

function mapToStatus(action: LastAction): PatientStatus {
  if (action === 'crisis') return 'crisis';
  if (action === 'urge') return 'struggling';
  return 'stable';
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TRIGGER':
      return {
        ...state,
        patientStatus: mapToStatus(action.event),
        lastAction: action.event,
        timestamp: new Date(),
        interventionOpen: action.event === 'urge',
        caregiverAlerted: action.event !== 'safe',
        aiScript: action.script,
        safeLogCount: action.event === 'safe' ? state.safeLogCount + 1 : state.safeLogCount,
      };
    case 'SET_SCRIPT':
      return { ...state, aiScript: action.script };
    case 'CLOSE_INTERVENTION':
      return { ...state, interventionOpen: false };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch]                       = useReducer(appReducer, INITIAL_STATE);
  const [loading, setLoading]                   = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  // FIXED: selectedPatientId is controlled state — patient selector is wired
  const [selectedPatientId, setSelectedPatientId] = useState(MOCK_PATIENTS[0].id);

  // Derive active patient from id — updates instantly when selector changes
  const patient: PatientProfile =
    MOCK_PATIENTS.find((p) => p.id === selectedPatientId) ?? MOCK_PATIENTS[0];

  const triggerEvent = useCallback(
    async (eventType: LastAction) => {
      setLoading(true);
      // Optimistic local script immediately
      const localScript = generateAIScript(eventType, patient);
      dispatch({ type: 'TRIGGER', event: eventType, script: localScript });

      try {
        // Sarvam-30B script with language translation
        const scriptRes = await fetch('/api/sarvam/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            eventType,
            language: selectedLanguage,
          }),
        });
        if (scriptRes.ok) {
          const { script } = await scriptRes.json();
          if (script) dispatch({ type: 'SET_SCRIPT', script });
        }

        // Log to Neon DB (non-blocking)
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            patientName: patient.name,
            substance: patient.substanceType,
            eventType,
            soberDays: patient.soberDays,
            language: selectedLanguage,
            aiResponse: localScript,
          }),
        }).catch(console.error);
      } catch (err) {
        console.error('triggerEvent error', err);
      } finally {
        setLoading(false);
      }
    },
    [patient, selectedLanguage]
  );

  const triggerCrisis = useCallback(() => triggerEvent('crisis'), [triggerEvent]);
  const triggerUrge   = useCallback(() => triggerEvent('urge'),   [triggerEvent]);
  const triggerSafe   = useCallback(() => triggerEvent('safe'),   [triggerEvent]);
  const closeIntervention = useCallback(() => dispatch({ type: 'CLOSE_INTERVENTION' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    loading,
    patient,           // ← exposed so all screens use the same reactive patient
    selectedPatientId,
    setSelectedPatientId,
    selectedLanguage,
    setSelectedLanguage,
    triggerCrisis,
    triggerUrge,
    triggerSafe,
    closeIntervention,
    reset,
  };
}
