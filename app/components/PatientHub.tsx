'use client';
import React, { useEffect } from 'react';
import { PatientStatus, LastAction, PatientProfile } from '../types';
import SarvamVoice from './SarvamVoice';
import CameraCheck from './CameraCheck';
import { useUI } from '../lib/i18n';

interface Props {
  patient: PatientProfile;     // ← wired from hook, changes when selector changes
  status: PatientStatus;
  lastAction: LastAction;
  safeLogCount: number;
  loading: boolean;
  onCrisis: () => void;
  onUrge: () => void;
  onSafe: () => void;
  onVoiceResult: (keyword: string, transcript: string, language: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export default function PatientHub({
  patient, status, lastAction, safeLogCount, loading,
  onCrisis, onUrge, onSafe, onVoiceResult,
  selectedLanguage, setSelectedLanguage,
}: Props) {
  const t = useUI(selectedLanguage); // all labels update when language changes

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === '1') onCrisis();
      if (e.key === '2') onUrge();
      if (e.key === '3') onSafe();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCrisis, onUrge, onSafe]);

  // Status badge — driven by live state
  const badge = {
    stable:     { label: t.statusStable,     bg: '#dcfce7', color: '#166534', border: '#86efac' },
    struggling: { label: t.statusStruggling, bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    crisis:     { label: t.statusCrisis,     bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  }[status];

  return (
    <section aria-label="Patient Quick-Crisis Hub"
      className="flex flex-col gap-4 p-4" style={{ backgroundColor: '#0f0f0f', minHeight: '100%' }}>

      {/* Screen label */}
      <div className="rounded-xl px-3 py-2 flex items-center justify-between border-2"
        style={{ backgroundColor: '#1e1208', borderColor: '#c2410c' }}>
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f97316' }}>
            {t.screenLabel}
          </p>
          <p className="text-xs" style={{ color: '#fb923c' }}>{t.screenSub}</p>
        </div>
        <span className="ai-badge">✦ Live</span>
      </div>

      {/* Patient card — updates when patient selector changes */}
      <div className="rounded-xl border-2 px-3 py-2 flex items-center justify-between transition-all duration-300"
        style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow"
            style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }} aria-hidden="true">
            {patient.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: '#f5f0eb' }}>{patient.name}</p>
            <p className="text-xs font-medium" style={{ color: '#fb923c' }}>
              {t.dayOf}{' '}
              <strong style={{ color: '#059669' }}>{patient.soberDays}</strong>
              {' · '}{patient.substanceType}
            </p>
          </div>
        </div>
        {/* Live status — updates on every button press */}
        <span className="px-3 py-1.5 rounded-full text-xs font-black border-2 transition-all duration-300"
          style={{ backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }}
          aria-live="polite" aria-atomic="true">
          {badge.label}
        </span>
      </div>

      {/* 🆘 Crisis */}
      <button
        onClick={onCrisis} disabled={loading}
        aria-label={`${t.crisisBtn} — ${t.crisisSub}. Keyboard: 1`}
        className={`relative rounded-2xl border-2 flex flex-col items-center justify-center gap-2 focus:outline-none focus:ring-4 card-lift ${status === 'crisis' ? 'crisis-glow' : ''}`}
        style={{
          minHeight: '150px',
          background: 'linear-gradient(135deg, #fff5f5, #fef2f2)',
          borderColor: status === 'crisis' ? '#dc2626' : '#fca5a5',
          boxShadow: '0 6px 20px rgba(220,38,38,0.2)',
          opacity: loading ? 0.75 : 1,
        }}>
        <span className="text-6xl" aria-hidden="true">🆘</span>
        <span className="text-xl font-black" style={{ color: '#991b1b' }}>{t.crisisBtn}</span>
        <span className="text-sm font-medium text-center px-4" style={{ color: '#dc2626' }}>{t.crisisSub}</span>
        <span className="absolute top-2 right-3 px-2 py-0.5 rounded-lg font-mono text-xs font-bold"
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>[1]</span>
        {status === 'crisis' && (
          <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-20 pointer-events-none" />
        )}
      </button>

      {/* 🌊 Urge + ✅ Safe */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUrge} disabled={loading}
          aria-label={`${t.urgeBtn}. Keyboard: 2`}
          className={`rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-4 focus:outline-none focus:ring-4 card-lift ${status === 'struggling' ? 'orange-glow' : ''}`}
          style={{
            minHeight: '110px',
            background: 'linear-gradient(135deg, #fffdf0, #fffbeb)',
            borderColor: status === 'struggling' ? '#d97706' : '#fde68a',
            boxShadow: '0 4px 14px rgba(217,119,6,0.15)',
            opacity: loading ? 0.75 : 1,
          }}>
          <span className="text-4xl" aria-hidden="true">🌊</span>
          <span className="text-sm font-black text-center" style={{ color: '#92400e' }}>{t.urgeBtn}</span>
          <span className="text-xs font-medium text-center" style={{ color: '#b45309' }}>{t.urgeSub}</span>
          <span className="text-xs px-2 py-0.5 rounded-lg font-mono mt-1"
            style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>[2]</span>
        </button>

        <button
          onClick={onSafe} disabled={loading}
          aria-label={`${t.safeBtn}. Keyboard: 3`}
          className="rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-4 focus:outline-none focus:ring-4 card-lift"
          style={{
            minHeight: '110px',
            background: lastAction === 'safe'
              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              : 'linear-gradient(135deg, #f7fffa, #f0fdf4)',
            borderColor: lastAction === 'safe' ? '#059669' : '#86efac',
            boxShadow: '0 4px 14px rgba(5,150,105,0.12)',
            opacity: loading ? 0.75 : 1,
          }}>
          <span className="text-4xl" aria-hidden="true">✅</span>
          <span className="text-sm font-black text-center" style={{ color: '#065f46' }}>{t.safeBtn}</span>
          <span className="text-xs font-medium text-center" style={{ color: '#047857' }}>
            {t.safeSub} {safeLogCount > 0 ? `(${safeLogCount}${t.logCount})` : ''}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-lg font-mono mt-1"
            style={{ backgroundColor: '#dcfce7', color: '#065f46' }}>[3]</span>
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border-2 px-3 py-2 text-center text-sm font-bold slide-down"
          style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#f97316' }}
          aria-live="polite">
          {t.loading}
        </div>
      )}

      <SarvamVoice
        onResult={onVoiceResult}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        disabled={loading}
      />

      <CameraCheck language={selectedLanguage} />
    </section>
  );
}
