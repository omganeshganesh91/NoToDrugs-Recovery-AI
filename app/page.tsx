'use client';
import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import PatientHub from './components/PatientHub';
import CaregiverPanel from './components/CaregiverPanel';
import InterventionView from './components/InterventionView';
import SafetyGuide from './components/SafetyGuide';
import { MOCK_PATIENTS } from './lib/ai-engine';
import { SUPPORTED_LANGUAGES } from './lib/sarvam';

type MobileView = 'patient' | 'caregiver';

export default function RecoveryPlatform() {
  const {
    state, loading, selectedLanguage, setSelectedLanguage,
    patient, selectedPatientId, setSelectedPatientId,
    triggerCrisis, triggerUrge, triggerSafe,
    closeIntervention, reset,
  } = useAppState();

  const [mobileView, setMobileView] = useState<MobileView>('patient');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const bump = () => setRefreshTrigger((n) => n + 1);

  const handleCrisis = () => { triggerCrisis(); bump(); };
  const handleUrge   = () => { triggerUrge();   bump(); };
  const handleSafe   = () => { triggerSafe();   bump(); };

  const handleVoiceResult = (keyword: string, _t: string, lang: string) => {
    if (lang && lang !== 'unknown') setSelectedLanguage(lang);
    if (keyword === 'crisis') handleCrisis();
    else if (keyword === 'urge') handleUrge();
    else if (keyword === 'safe') handleSafe();
  };

  // Dynamic status — reflects live state
  const STATUS = {
    stable:     { label: '🟢 Stable',        bg: '#dcfce7', color: '#166534', border: '#86efac', pulse: false },
    struggling: { label: '🟡 Craving Alert',  bg: '#fef9c3', color: '#854d0e', border: '#fde047', pulse: true  },
    crisis:     { label: '🔴 Crisis Active',  bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', pulse: true  },
  }[state.patientStatus];

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#0f0f0f' }}>

      {/* ── Top strip ──────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-1 text-center text-xs border-b"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2d1a0a', color: '#fb923c' }}
      >
        <span className="ai-badge mr-2">✦ Sarvam AI · Neon DB · Live</span>
        <span>Screen 1 Patient → Sarvam STT → AI Script → Screen 2 Caregiver → Neon DB</span>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 border-b z-40"
        style={{ backgroundColor: '#141414', borderColor: '#2d1a0a' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow"
            style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
            aria-hidden="true"
          >
            💙
          </div>
          <div>
            <h1 className="text-sm font-black" style={{ color: '#f5f0eb' }}>
              NoToDrugs-Recovery-AI · Recovery AI
            </h1>
            <p className="text-xs" style={{ color: '#fb923c' }}>
              Sarvam AI · Neon DB · सभी भारतीय भाषाएं
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* LIVE status pill — updates dynamically on every button press */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black border transition-all duration-300 ${STATUS.pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: STATUS.bg, color: STATUS.color, borderColor: STATUS.border }}
            aria-live="assertive"
            aria-atomic="true"
            aria-label={`Current patient status: ${STATE_LABEL[state.patientStatus]}`}
          >
            {STATUS.label}
          </span>

          {/* AI Script language selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Language for AI scripts"
            className="text-xs rounded-lg px-2 py-1 border-2 focus:outline-none focus:ring-2 font-medium"
            style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#fb923c' }}
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>

          {/* Patient selector */}
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            aria-label="Select patient"
            className="text-xs rounded-lg px-2 py-1 border-2 focus:outline-none focus:ring-2 font-medium"
            style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#fb923c' }}
          >
            {MOCK_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={reset}
            className="text-xs px-2.5 py-1 rounded-lg border-2 font-bold transition-all focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#f97316' }}
            aria-label="Reset platform"
          >
            ↺ Reset
          </button>
        </div>
      </header>

      {/* ── Mobile tabs ────────────────────────────────────────────────────── */}
      <div
        className="lg:hidden flex flex-shrink-0 border-b"
        style={{ backgroundColor: '#141414', borderColor: '#2d1a0a' }}
        role="tablist"
      >
        {(['patient', 'caregiver'] as MobileView[]).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={mobileView === v}
            onClick={() => setMobileView(v)}
            className="flex-1 py-2.5 text-sm font-bold transition-all focus:outline-none relative"
            style={{
              color: mobileView === v ? '#f97316' : '#a8896b',
              borderBottom: mobileView === v ? '3px solid #f97316' : '3px solid transparent',
              backgroundColor: mobileView === v ? '#1e1208' : 'transparent',
            }}
          >
            {v === 'patient' ? '👤 Patient Hub' : '🛡️ Caregiver'}
            {v === 'caregiver' && state.caregiverAlerted && (
              <span className="absolute top-2 right-6 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* LEFT: Patient Hub + Safety Guide */}
        <div
          id="patient-panel"
          role="tabpanel"
          aria-label="Patient Quick-Crisis Hub"
          className={`lg:w-1/2 lg:border-r flex flex-col min-h-0 ${
            mobileView === 'patient' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
          style={{ borderColor: '#2d1a0a' }}
        >
          <div className="flex-1 overflow-y-auto">
            <PatientHub
              patient={patient}
              status={state.patientStatus}
              lastAction={state.lastAction}
              safeLogCount={state.safeLogCount}
              loading={loading}
              onCrisis={handleCrisis}
              onUrge={handleUrge}
              onSafe={handleSafe}
              onVoiceResult={handleVoiceResult}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
            />
          </div>
          <SafetyGuide lastAction={state.lastAction} />
        </div>

        {/* RIGHT: Caregiver Panel */}
        <div
          id="caregiver-panel"
          role="tabpanel"
          aria-label="Caregiver Guardian Panel"
          className={`lg:w-1/2 flex flex-col min-h-0 ${
            mobileView === 'caregiver' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 overflow-y-auto">
            <CaregiverPanel
              patient={MOCK_PATIENTS[0]}
              status={state.patientStatus}
              lastAction={state.lastAction}
              aiScript={state.aiScript}
              timestamp={state.timestamp}
              caregiverAlerted={state.caregiverAlerted}
              refreshTrigger={refreshTrigger}
              selectedLanguage={selectedLanguage}
            />
          </div>
        </div>
      </main>

      {/* Screen 3: Breathing overlay */}
      <InterventionView isOpen={state.interventionOpen} onClose={closeIntervention} />

      <a href="#patient-panel" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-700 focus:text-white">
        Skip to Patient Hub
      </a>
    </div>
  );
}

const STATE_LABEL: Record<string, string> = {
  stable: 'Stable', struggling: 'Struggling — craving detected', crisis: 'Active crisis',
};
