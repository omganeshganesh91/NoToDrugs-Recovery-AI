'use client';
// ─── Screen 2: Caregiver Guardian Panel ──────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { PatientStatus, LastAction } from '../types';
import { EMERGENCY_CONTACTS, MOCK_PATIENTS } from '../lib/ai-engine';

interface Props {
  status: PatientStatus;
  lastAction: LastAction;
  aiScript: string;
  timestamp: Date | null;
  caregiverAlerted: boolean;
}

const patient = MOCK_PATIENTS[0];

export default function CaregiverPanel({
  status,
  lastAction,
  aiScript,
  timestamp,
  caregiverAlerted,
}: Props) {
  const [copied, setCopied] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  // Scroll into view when alerted
  useEffect(() => {
    if (caregiverAlerted && scriptRef.current) {
      scriptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [caregiverAlerted, aiScript]);

  const statusConfig: Record<PatientStatus, { label: string; cls: string; banner: string }> = {
    stable: {
      label: '🟢 STABLE',
      cls: 'border-emerald-500 bg-emerald-950',
      banner: 'bg-emerald-900 text-emerald-200',
    },
    struggling: {
      label: '🟡 STRUGGLING — URGE DETECTED',
      cls: 'border-yellow-500 bg-yellow-950',
      banner: 'bg-yellow-900 text-yellow-200',
    },
    crisis: {
      label: '🔴 ACTIVE CRISIS — CALL 911 NOW',
      cls: 'border-red-500 bg-red-950',
      banner: 'bg-red-900 text-red-100',
    },
  };

  const sc = statusConfig[status];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = aiScript;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contactColors: Record<string, string> = {
    emergency: 'bg-red-900 hover:bg-red-800 border-red-600 text-red-100',
    detox: 'bg-blue-900 hover:bg-blue-800 border-blue-600 text-blue-100',
    support: 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100',
  };

  return (
    <section
      aria-label="Caregiver Guardian Panel"
      className="flex flex-col h-full bg-slate-900 text-white overflow-y-auto"
    >
      {/* Alert Banner */}
      <div
        className={`px-4 py-3 flex items-center justify-between transition-all duration-500 ${sc.banner} ${
          caregiverAlerted && status === 'crisis' ? 'animate-pulse' : ''
        }`}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        <span className="font-black text-sm tracking-wide">{sc.label}</span>
        {timestamp && (
          <span className="text-xs opacity-75">
            {timestamp.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 flex-1">
        {/* Patient Status Card */}
        <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${sc.cls}`}>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Patient</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">{patient.name}</p>
              <p className="text-sm text-slate-300">
                Day {patient.soberDays} · {patient.substanceType} recovery
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Last action</p>
              <p className="text-sm font-semibold capitalize text-white">
                {lastAction === 'idle' ? 'None yet' : lastAction}
              </p>
            </div>
          </div>
        </div>

        {/* AI Script Box */}
        <div ref={scriptRef} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <span aria-hidden="true">🤖</span> AI Generated Script
            </h2>
            {aiScript && (
              <button
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Copy script to clipboard"
              >
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            )}
          </div>

          <div
            className={`
              rounded-xl border transition-all duration-500 min-h-[120px]
              ${caregiverAlerted && aiScript
                ? 'border-amber-500 bg-slate-800'
                : 'border-slate-700 bg-slate-800/50'
              }
            `}
            aria-live="polite"
            aria-atomic="true"
          >
            {aiScript ? (
              <pre className="p-4 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {aiScript}
              </pre>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                <span className="text-3xl" aria-hidden="true">💬</span>
                <p className="text-sm text-center">
                  Waiting for patient input…
                  <br />
                  <span className="text-xs">Scripts generate automatically on crisis, urge, or safe events.</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Call Dashboard */}
        <div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span aria-hidden="true">📞</span> Rapid Call Dashboard
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number.replace(/\D/g, '')}`}
                aria-label={`Call ${c.label} at ${c.number}`}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg border
                  text-sm font-medium transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${contactColors[c.type]}
                `}
              >
                <span>{c.label}</span>
                <span className="font-mono font-bold text-xs">{c.number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Crisis action reminder */}
        {status === 'crisis' && (
          <div
            role="alert"
            className="rounded-xl border border-red-500 bg-red-950 p-4 animate-pulse"
          >
            <p className="text-red-200 text-sm font-bold">⚠️ IMMEDIATE ACTION REQUIRED</p>
            <ul className="mt-2 space-y-1 text-xs text-red-300 list-none">
              <li>→ Call 911 immediately</li>
              <li>→ Do NOT leave patient alone</li>
              <li>→ Administer Naloxone if available</li>
              <li>→ Unlock front door for paramedics</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
