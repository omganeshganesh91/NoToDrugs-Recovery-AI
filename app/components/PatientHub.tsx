'use client';
// ─── Screen 1: Patient Quick-Crisis Hub ──────────────────────────────────────
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { PatientStatus, LastAction } from '../types';
import { MOCK_PATIENTS } from '../lib/ai-engine';

interface Props {
  status: PatientStatus;
  lastAction: LastAction;
  safeLogCount: number;
  onCrisis: () => void;
  onUrge: () => void;
  onSafe: () => void;
  onVoiceResult: (keyword: string) => void;
  voiceActive: boolean;
  setVoiceActive: (v: boolean) => void;
}

const patient = MOCK_PATIENTS[0];

export default function PatientHub({
  status,
  lastAction,
  safeLogCount,
  onCrisis,
  onUrge,
  onSafe,
  onVoiceResult,
  voiceActive,
  setVoiceActive,
}: Props) {
  // use any to avoid SpeechRecognition not defined in all TS targets
  const recognitionRef = useRef<any>(null); // eslint-disable-line
  const [voiceError, setVoiceError] = useState('');
  const [voiceHint, setVoiceHint] = useState('');

  // Status badge styling
  const statusConfig = {
    stable: { label: '🟢 Stable', cls: 'bg-emerald-900 text-emerald-300 border-emerald-600' },
    struggling: { label: '🟡 Struggling', cls: 'bg-yellow-900 text-yellow-300 border-yellow-600' },
    crisis: { label: '🔴 Crisis', cls: 'bg-red-900 text-red-300 border-red-600' },
  };

  const startVoice = useCallback(() => {
    setVoiceError('');
    setVoiceHint('Listening… say "help", "craving", or "safe"');

    const SR =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SR) {
      setVoiceError('Voice not supported in this browser.');
      return;
    }

    const recognition: SpeechRecognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onresult = (e: Event) => {
      const evt = e as SpeechRecognitionEvent;
      const transcript = Array.from(evt.results)
        .flatMap((r) => Array.from(r))
        .map((alt) => alt.transcript.toLowerCase())
        .join(' ');

      setVoiceHint(`Heard: "${transcript}"`);
      setVoiceActive(false);

      if (/\b(help|emergency|overdose|dying)\b/.test(transcript)) onVoiceResult('crisis');
      else if (/\b(craving|urge|want|need|alcohol|drug)\b/.test(transcript)) onVoiceResult('urge');
      else if (/\b(safe|okay|fine|good|sober)\b/.test(transcript)) onVoiceResult('safe');
      else setVoiceHint('Not recognised — try "help", "craving", or "safe"');
    };

    recognition.onerror = (e) => {
      setVoiceError(`Voice error: ${e.error}`);
      setVoiceActive(false);
    };

    recognition.onend = () => setVoiceActive(false);

    setVoiceActive(true);
    recognition.start();
  }, [onVoiceResult, setVoiceActive]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceActive(false);
  }, [setVoiceActive]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '1') onCrisis();
      if (e.key === '2') onUrge();
      if (e.key === '3') onSafe();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCrisis, onUrge, onSafe]);

  const sc = statusConfig[status];

  return (
    <section
      aria-label="Patient Quick-Crisis Hub"
      className="flex flex-col h-full bg-slate-950 text-white p-4 gap-4 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-tight">
            👤 {patient.name}
          </h1>
          <p className="text-xs text-slate-400">Day {patient.soberDays} of recovery</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.cls}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {sc.label}
        </span>
      </div>

      {/* 🔴 Crisis Button — top half, pulsing */}
      <button
        onClick={onCrisis}
        aria-label="Emergency: I need medical help now. Press 1 as keyboard shortcut."
        className={`
          relative flex-[2] min-h-[140px] rounded-2xl border-2 border-red-500
          bg-gradient-to-br from-red-900 via-red-800 to-red-950
          flex flex-col items-center justify-center gap-2
          transition-all duration-200 active:scale-95 focus:outline-none
          focus:ring-4 focus:ring-red-400 hover:from-red-800
          ${status === 'crisis' ? 'ring-4 ring-red-400 animate-pulse' : ''}
        `}
      >
        <span className="text-5xl" aria-hidden="true">🆘</span>
        <span className="text-xl font-black text-red-100 text-center leading-tight px-2">
          Emergency
        </span>
        <span className="text-sm text-red-300 text-center px-4">
          I Need Medical Help Now
        </span>
        <span className="text-xs text-red-500 absolute top-2 right-3">[1]</span>
        {status === 'crisis' && (
          <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-30 pointer-events-none" />
        )}
      </button>

      {/* 🟡 Urge + 🟢 Safe — side by side */}
      <div className="flex gap-3 flex-1 min-h-[100px]">
        <button
          onClick={onUrge}
          aria-label="I feel a heavy craving. Press 2 as keyboard shortcut."
          className={`
            flex-1 rounded-2xl border-2 border-yellow-500
            bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-950
            flex flex-col items-center justify-center gap-1 p-3
            transition-all duration-200 active:scale-95 focus:outline-none
            focus:ring-4 focus:ring-yellow-400 hover:from-yellow-800
            ${status === 'struggling' ? 'ring-4 ring-yellow-400' : ''}
          `}
        >
          <span className="text-3xl" aria-hidden="true">🌊</span>
          <span className="text-sm font-bold text-yellow-100 text-center leading-tight">
            Heavy Craving
          </span>
          <span className="text-xs text-yellow-400 text-center">Talk Me Down</span>
          <span className="text-xs text-yellow-600">[2]</span>
        </button>

        <button
          onClick={onSafe}
          aria-label="I am safe, log today's progress. Press 3 as keyboard shortcut."
          className={`
            flex-1 rounded-2xl border-2 border-emerald-500
            bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950
            flex flex-col items-center justify-center gap-1 p-3
            transition-all duration-200 active:scale-95 focus:outline-none
            focus:ring-4 focus:ring-emerald-400 hover:from-emerald-800
            ${status === 'stable' && lastAction === 'safe' ? 'ring-4 ring-emerald-400' : ''}
          `}
        >
          <span className="text-3xl" aria-hidden="true">✅</span>
          <span className="text-sm font-bold text-emerald-100 text-center leading-tight">
            I Am Safe
          </span>
          <span className="text-xs text-emerald-400 text-center">
            Log Progress {safeLogCount > 0 ? `(${safeLogCount})` : ''}
          </span>
          <span className="text-xs text-emerald-600">[3]</span>
        </button>
      </div>

      {/* 🎤 Voice Node */}
      <div className="flex flex-col items-center gap-1">
        <button
          onPointerDown={startVoice}
          onPointerUp={stopVoice}
          onPointerLeave={stopVoice}
          aria-label={voiceActive ? 'Listening — release to stop' : 'Hold to speak: say help, craving, or safe'}
          aria-pressed={voiceActive}
          className={`
            w-16 h-16 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400
            ${voiceActive
              ? 'bg-blue-600 border-blue-400 scale-110 animate-pulse shadow-lg shadow-blue-500/50'
              : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
            }
          `}
        >
          <span className="text-2xl" aria-hidden="true">{voiceActive ? '🔴' : '🎤'}</span>
        </button>
        {voiceHint && (
          <p className="text-xs text-blue-300 text-center" aria-live="polite">{voiceHint}</p>
        )}
        {voiceError && (
          <p className="text-xs text-red-400 text-center" role="alert">{voiceError}</p>
        )}
        {!voiceHint && !voiceError && (
          <p className="text-xs text-slate-500 text-center">Hold mic · say &ldquo;help&rdquo;, &ldquo;craving&rdquo;, &ldquo;safe&rdquo;</p>
        )}
      </div>
    </section>
  );
}
