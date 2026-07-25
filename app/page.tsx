"use client";
// ─── Recovery & Prevention Platform — Main Page ───────────────────────────────
import React, { useState } from "react";
import { useAppState } from "./hooks/useAppState";
import PatientHub from "./components/PatientHub";
import CaregiverPanel from "./components/CaregiverPanel";
import InterventionView from "./components/InterventionView";
import SafetyGuide from "./components/SafetyGuide";
import { MOCK_PATIENTS } from "./lib/ai-engine";
import { generateAIScript } from "./lib/ai-engine";
import { PatientProfile } from "./types";

// View toggle for mobile
type MobileView = "patient" | "caregiver";

export default function RecoveryPlatform() {
  const {
    state,
    triggerCrisis,
    triggerUrge,
    triggerSafe,
    closeIntervention,
    setVoiceActive,
    reset,
  } = useAppState();

  const [mobileView, setMobileView] = useState<MobileView>("patient");
  const [selectedPatientId, setSelectedPatientId] = useState(
    MOCK_PATIENTS[0].id,
  );

  // Handle voice keyword routing
  const handleVoiceResult = (keyword: string) => {
    if (keyword === "crisis") triggerCrisis();
    else if (keyword === "urge") triggerUrge();
    else if (keyword === "safe") triggerSafe();
  };

  const statusDot = {
    stable: "bg-emerald-400",
    struggling: "bg-yellow-400 animate-pulse",
    crisis: "bg-red-500 animate-ping",
  }[state.patientStatus];

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col"
      aria-label="Recovery and Prevention Platform"
    >
      {/* ── Top Header Bar ───────────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">
            💙
          </span>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">
              NoToDrugs-Recovery-AI
            </h1>
            <p className="text-xs text-slate-500">
              AI-Powered Crisis & Prevention
            </p>
          </div>
        </div>

        {/* Live status indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot}`}
              aria-hidden="true"
            />
            <span
              className="text-xs text-slate-400 capitalize"
              aria-live="polite"
              aria-label={`System status: ${state.patientStatus}`}
            >
              {state.patientStatus}
            </span>
          </div>

          {/* Patient selector */}
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            aria-label="Select patient profile"
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {MOCK_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Reset */}
          <button
            onClick={reset}
            aria-label="Reset platform state"
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            ↺ Reset
          </button>
        </div>
      </header>

      {/* ── Mobile Tab Toggle ────────────────────────────────────────────────── */}
      <div
        className="lg:hidden flex bg-slate-900 border-b border-slate-800 flex-shrink-0"
        role="tablist"
        aria-label="View selector"
      >
        <button
          role="tab"
          aria-selected={mobileView === "patient"}
          aria-controls="patient-panel"
          onClick={() => setMobileView("patient")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-400 ${
            mobileView === "patient"
              ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          👤 Patient Hub
        </button>
        <button
          role="tab"
          aria-selected={mobileView === "caregiver"}
          aria-controls="caregiver-panel"
          onClick={() => setMobileView("caregiver")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-400 ${
            mobileView === "caregiver"
              ? "text-amber-400 border-b-2 border-amber-400 bg-slate-800"
              : "text-slate-500 hover:text-slate-300"
          } relative`}
        >
          🛡️ Caregiver
          {state.caregiverAlerted && (
            <span
              className="absolute top-1 right-6 w-2 h-2 bg-red-500 rounded-full animate-ping"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* LEFT: Patient Hub (Screen 1) */}
        <div
          id="patient-panel"
          role="tabpanel"
          aria-label="Patient Quick-Crisis Hub"
          className={`
            lg:flex lg:flex-col lg:w-1/2 lg:border-r lg:border-slate-800
            flex flex-col min-h-0
            ${mobileView === "patient" ? "flex flex-col flex-1" : "hidden lg:flex"}
          `}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <PatientHub
              status={state.patientStatus}
              lastAction={state.lastAction}
              safeLogCount={state.safeLogCount}
              onCrisis={triggerCrisis}
              onUrge={triggerUrge}
              onSafe={triggerSafe}
              onVoiceResult={handleVoiceResult}
              voiceActive={state.voiceActive}
              setVoiceActive={setVoiceActive}
            />
          </div>
          {/* Safety Guide below patient hub */}
          <SafetyGuide lastAction={state.lastAction} />
        </div>

        {/* RIGHT: Caregiver Panel (Screen 2) */}
        <div
          id="caregiver-panel"
          role="tabpanel"
          aria-label="Caregiver Guardian Panel"
          className={`
            lg:flex lg:flex-col lg:w-1/2
            flex flex-col min-h-0
            ${mobileView === "caregiver" ? "flex flex-col flex-1" : "hidden lg:flex"}
          `}
        >
          <div className="flex-1 min-h-0 overflow-auto">
            <CaregiverPanel
              status={state.patientStatus}
              lastAction={state.lastAction}
              aiScript={state.aiScript}
              timestamp={state.timestamp}
              caregiverAlerted={state.caregiverAlerted}
            />
          </div>
        </div>
      </main>

      {/* ── Screen 3: Intervention Overlay (auto-opens on urge/voice) ─────────── */}
      <InterventionView
        isOpen={state.interventionOpen}
        onClose={closeIntervention}
      />

      {/* ── Skip-to-content for accessibility ────────────────────────────────── */}
      <a
        href="#patient-panel"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white"
      >
        Skip to Patient Hub
      </a>
    </div>
  );
}
