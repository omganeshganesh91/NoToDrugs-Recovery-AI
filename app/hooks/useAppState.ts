'use client';
// ─── Central App State Hook ───────────────────────────────────────────────────
import { useReducer, useCallback, useRef } from 'react';
import { AppState, LastAction, PatientStatus } from '../types';
import { generateAIScript, MOCK_PATIENTS } from '../lib/ai-engine';

type Action =
  | { type: 'TRIGGER_CRISIS' }
  | { type: 'TRIGGER_URGE' }
  | { type: 'TRIGGER_SAFE' }
  | { type: 'CLOSE_INTERVENTION' }
  | { type: 'SET_VOICE_ACTIVE'; payload: boolean }
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

function mapActionToStatus(action: LastAction): PatientStatus {
  if (action === 'crisis') return 'crisis';
  if (action === 'urge') return 'struggling';
  return 'stable';
}

function appReducer(state: AppState, action: Action): AppState {
  const patient = MOCK_PATIENTS[0]; // default patient; switchable in UI
  switch (action.type) {
    case 'TRIGGER_CRISIS':
      return {
        ...state,
        patientStatus: 'crisis',
        lastAction: 'crisis',
        timestamp: new Date(),
        interventionOpen: false,
        caregiverAlerted: true,
        aiScript: generateAIScript('crisis', patient),
      };
    case 'TRIGGER_URGE':
      return {
        ...state,
        patientStatus: 'struggling',
        lastAction: 'urge',
        timestamp: new Date(),
        interventionOpen: true,
        caregiverAlerted: true,
        aiScript: generateAIScript('urge', patient),
      };
    case 'TRIGGER_SAFE':
      return {
        ...state,
        patientStatus: 'stable',
        lastAction: 'safe',
        timestamp: new Date(),
        interventionOpen: false,
        caregiverAlerted: false,
        aiScript: generateAIScript('safe', patient),
        safeLogCount: state.safeLogCount + 1,
      };
    case 'CLOSE_INTERVENTION':
      return { ...state, interventionOpen: false };
    case 'SET_VOICE_ACTIVE':
      return { ...state, voiceActive: action.payload };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerCrisis = useCallback(() => dispatch({ type: 'TRIGGER_CRISIS' }), []);
  const triggerUrge = useCallback(() => dispatch({ type: 'TRIGGER_URGE' }), []);
  const triggerSafe = useCallback(() => dispatch({ type: 'TRIGGER_SAFE' }), []);
  const closeIntervention = useCallback(() => dispatch({ type: 'CLOSE_INTERVENTION' }), []);
  const setVoiceActive = useCallback(
    (active: boolean) => dispatch({ type: 'SET_VOICE_ACTIVE', payload: active }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    triggerCrisis,
    triggerUrge,
    triggerSafe,
    closeIntervention,
    setVoiceActive,
    reset,
    audioRef,
  };
}
