// ─── Core Domain Types ────────────────────────────────────────────────────────

export type PatientStatus = 'stable' | 'struggling' | 'crisis';

export type LastAction = 'idle' | 'crisis' | 'urge' | 'safe';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  substanceType: string;
  soberDays: number;
  emergencyContact: string;
  medicalNotes: string;
}

export interface AppState {
  patientStatus: PatientStatus;
  lastAction: LastAction;
  timestamp: Date | null;
  interventionOpen: boolean;
  caregiverAlerted: boolean;
  aiScript: string;
  voiceActive: boolean;
  safeLogCount: number;
}

export interface SafetyCard {
  id: string;
  trigger: LastAction;
  icon: string;
  title: string;
  steps: string[];
  color: string;
}

export interface EmergencyContact {
  label: string;
  number: string;
  type: 'emergency' | 'detox' | 'support';
}
