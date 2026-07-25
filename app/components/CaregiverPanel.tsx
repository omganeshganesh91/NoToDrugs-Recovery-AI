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
      bg: '#071a0e', border: '#14532d', leftBorder: '#059669', color: '#34d399',
      label: t.cgAlertStable,
    },
    struggling: {
      bg: '#1a1500', border: '#78350f', leftBorder: '#d97706', color: '#fbbf24',
      label: t.cgAlertStruggling,
    },
    crisis: {
      bg: '#1a0808', border: '#7f1d1d', leftBorder: '#dc2626', color: '#f87171',
      label: t.cgAlertCrisis,
    },
  }[status];

  const contactColors: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    emergency: { bg: '#1a0808', border: '#7f1d1d', color: '#f87171', icon: '🚨' },
    support:   { bg: '#1e1208', border: '#c2410c', color: '#fb923c', icon: '💬' },
    detox:     { bg: '#0c1a2e', border: '#1e40af', color: '#93c5fd', icon: '🏥' },
  };

  return (
    <section
      aria-label="Caregiver Guardian Panel"
      className="flex flex-col"
      style={{ backgroundColor: '#0f0f0f', minHeight: '100%' }}
    >
      {/* Screen label */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b-2"
        style={{ backgroundColor: '#141414', borderColor: '#2d1a0a' }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f97316' }}>
            {t.cgScreenLabel}
          </p>
          <p className="text-xs" style={{ color: '#fb923c' }}>
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
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2d1a0a' }}
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
              <p className="text-sm font-black" style={{ color: '#f5f0eb' }}>{patient.name}</p>
              <p className="text-xs" style={{ color: '#fb923c' }}>
                Din {patient.soberDays} · {patient.substanceType}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#a8896b' }}>Last action</p>
            <p className="text-sm font-black capitalize" style={{
              color: lastAction === 'crisis' ? '#f87171' : lastAction === 'urge' ? '#fbbf24' : '#34d399',
            }}>
              {lastAction === 'idle' ? 'Kuch nahi' : lastAction}
            </p>
          </div>
        </div>

        {/* AI Script Box */}
        <div ref={scriptRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f97316' }}>
                🤖 Sarvam AI Script
              </p>
              <span className="ai-badge">✦ Personalised</span>
            </div>
            {aiScript && (
              <button
                onClick={handleCopy}
                className="text-xs px-2.5 py-1 rounded-lg border-2 font-bold transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: copied ? '#071a0e' : '#1e1208',
                  borderColor: copied ? '#059669' : '#c2410c',
                  color: copied ? '#34d399' : '#f97316',
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
              backgroundColor: '#1a1a1a',
              borderColor: caregiverAlerted && aiScript ? '#c2410c' : '#2d1a0a',
              borderLeftWidth: '4px',
              borderLeftColor: caregiverAlerted && aiScript ? '#f97316' : '#2d1a0a',
              boxShadow: caregiverAlerted && aiScript ? '0 4px 20px rgba(234,88,12,0.25)' : 'none',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {aiScript ? (
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{ color: '#f5f0eb' }}>
                {aiScript}
              </pre>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center gap-2" style={{ color: '#a8896b' }}>
                <span className="text-3xl" aria-hidden="true">💬</span>
                <p className="text-sm text-center font-medium">Patient ka intezaar hai…</p>
                <p className="text-xs text-center" style={{ color: '#6b5040' }}>
                  Jaise hi patient button dabayega, Sarvam AI personalised script yahan likhega.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Call Dashboard — Real Indian numbers */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>
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
              backgroundColor: '#1a0808',
              borderColor: '#7f1d1d',
              borderLeftWidth: '5px',
              borderLeftColor: '#dc2626',
              boxShadow: '0 4px 20px rgba(220,38,38,0.25)',
            }}
          >
            <p className="font-black text-sm mb-3" style={{ color: '#f87171' }}>
              ⚠️ TURANT KARNE WALE KAAM
            </p>
            <ol className="space-y-2 text-sm" style={{ color: '#fca5a5' }}>
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
