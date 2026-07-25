'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PatientStatus, LastAction, PatientProfile } from '../types';
import { EMERGENCY_CONTACTS } from '../lib/ai-engine';
import UrgeTracker from './UrgeTracker';
import { useUI } from '../lib/i18n';

interface Props {
  patient: PatientProfile;
  status: PatientStatus;
  lastAction: LastAction;
  aiScript: string;
  timestamp: Date | null;
  caregiverAlerted: boolean;
  refreshTrigger: number;
  selectedLanguage: string;
}

export default function CaregiverPanel({
  patient,
  status,
  lastAction,
  aiScript,
  timestamp,
  caregiverAlerted,
  refreshTrigger,
  selectedLanguage,
}: Props) {
  const t = useUI(selectedLanguage);
  const [copied, setCopied] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to AI script on alert
  useEffect(() => {
    if (caregiverAlerted && scriptRef.current) {
      scriptRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [caregiverAlerted, aiScript]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(aiScript); }
    catch { /* fallback */ const el = document.createElement('textarea'); el.value = aiScript; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dynamic alert banner — updates instantly on every patient action
  const alert = {
    stable: {
      bg: '#f0fdf4', border: '#86efac', leftBorder: '#059669', color: '#166534',
      label: t.cgAlertStable,
    },
    struggling: {
      bg: '#fffbeb', border: '#fde68a', leftBorder: '#d97706', color: '#854d0e',
      label: t.cgAlertStruggling,
    },
    crisis: {
      bg: '#fff1f2', border: '#fca5a5', leftBorder: '#dc2626', color: '#991b1b',
      label: t.cgAlertCrisis,
    },
  }[status];

  const contactColors: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    emergency: { bg: '#fff1f2', border: '#fca5a5', color: '#991b1b', icon: '🚨' },
    support:   { bg: '#fff7ed', border: '#fb923c', color: '#9a3412', icon: '💬' },
    detox:     { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: '🏥' },
  };

  return (
    <section
      aria-label="Caregiver Guardian Panel"
      className="flex flex-col"
      style={{ backgroundColor: '#fffdf9', minHeight: '100%' }}
    >
      {/* Screen label */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b-2"
        style={{ backgroundColor: '#fff7ed', borderColor: '#fb923c' }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#ea580c' }}>
            {t.cgScreenLabel}
          </p>
          <p className="text-xs" style={{ color: '#9a3412' }}>
            {t.cgScreenSub}
          </p>
        </div>
        <span className="ai-badge">✦ Live Sync</span>
      </div>

      {/* LIVE Alert banner — animates on state change */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b-2 transition-all duration-500 ${
          caregiverAlerted && status === 'crisis' ? 'animate-pulse' : ''
        } slide-down`}
        style={{
          backgroundColor: alert.bg,
          borderColor: alert.border,
          borderLeftWidth: '5px',
          borderLeftStyle: 'solid',
          borderLeftColor: alert.leftBorder,
        }}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        <span className="font-black text-sm" style={{ color: alert.color }}>{alert.label}</span>
        {timestamp && (
          <span className="text-xs font-mono ml-2 opacity-70" style={{ color: alert.color }}>
            {timestamp.toLocaleTimeString('hi-IN')}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4">

        {/* Patient context */}
        <div
          className="rounded-xl border-2 px-3 py-2 flex items-center justify-between"
          style={{ backgroundColor: '#ffffff', borderColor: '#fed7aa' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
              style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
              aria-hidden="true"
            >
              {patient.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: '#1c0a00' }}>{patient.name}</p>
              <p className="text-xs" style={{ color: '#78350f' }}>
                Din {patient.soberDays} · {patient.substanceType}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#9a3412' }}>Last action</p>
            <p className="text-sm font-black capitalize" style={{
              color: lastAction === 'crisis' ? '#dc2626' : lastAction === 'urge' ? '#d97706' : '#059669',
            }}>
              {lastAction === 'idle' ? 'Kuch nahi' : lastAction}
            </p>
          </div>
        </div>

        {/* AI Script Box */}
        <div ref={scriptRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#ea580c' }}>
                🤖 Sarvam AI Script
              </p>
              <span className="ai-badge">✦ Personalised</span>
            </div>
            {aiScript && (
              <button
                onClick={handleCopy}
                className="text-xs px-2.5 py-1 rounded-lg border-2 font-bold transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: copied ? '#dcfce7' : '#fff7ed',
                  borderColor: copied ? '#86efac' : '#fb923c',
                  color: copied ? '#166534' : '#ea580c',
                }}
                aria-label="Copy script to clipboard"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>

          <div
            className="rounded-xl border-2 transition-all duration-500 min-h-[100px]"
            style={{
              backgroundColor: '#ffffff',
              borderColor: caregiverAlerted && aiScript ? '#fb923c' : '#fed7aa',
              borderLeftWidth: '4px',
              borderLeftColor: caregiverAlerted && aiScript ? '#ea580c' : '#fed7aa',
              boxShadow: caregiverAlerted && aiScript ? '0 4px 20px rgba(234,88,12,0.18)' : 'none',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {aiScript ? (
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{ color: '#1c0a00' }}>
                {aiScript}
              </pre>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center gap-2" style={{ color: '#d4a574' }}>
                <span className="text-3xl" aria-hidden="true">💬</span>
                <p className="text-sm text-center font-medium">Patient ka intezaar hai…</p>
                <p className="text-xs text-center" style={{ color: '#c2967a' }}>
                  Jaise hi patient button dabayega, Sarvam AI personalised script yahan likhega.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Call Dashboard — Real Indian numbers */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#1c0a00' }}>
            📞 Emergency Call Dashboard
          </p>
          <div className="flex flex-col gap-2">
            {EMERGENCY_CONTACTS.map((c) => {
              const cs = contactColors[c.type];
              return (
                <a
                  key={c.number}
                  href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                  aria-label={`${c.label} ko call karein: ${c.number}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 card-lift"
                  style={{ backgroundColor: cs.bg, borderColor: cs.border, color: cs.color }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span aria-hidden="true">{cs.icon}</span>
                    {c.label}
                  </span>
                  <span className="font-mono font-black text-sm">{c.number}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Crisis checklist */}
        {status === 'crisis' && (
          <div
            role="alert"
            className="rounded-xl border-2 p-4 slide-down"
            style={{
              backgroundColor: '#fff1f2',
              borderColor: '#f87171',
              borderLeftWidth: '5px',
              borderLeftColor: '#dc2626',
              boxShadow: '0 4px 20px rgba(220,38,38,0.2)',
            }}
          >
            <p className="font-black text-sm mb-3" style={{ color: '#991b1b' }}>
              ⚠️ TURANT KARNE WALE KAAM
            </p>
            <ol className="space-y-2 text-sm" style={{ color: '#b91c1c' }}>
              {[
                '112 call karein — "possible overdose" bolen aur apna pata den',
                'Patient ko akela BILKUL mat chhodein',
                'Agar Naloxone kit hai to abhi lagaen',
                'Ambulance ke liye darwaza khula rakhein',
                'Patient ki saari dawaiyan ambulance walon ko den',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-black flex-shrink-0 w-5">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Urge Tracker — Neon DB */}
        <UrgeTracker patientId={patient.id} refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}
