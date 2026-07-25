'use client';
// ─── Screen 3: AI Intervention View ──────────────────────────────────────────
//
// BUSINESS PURPOSE
// ────────────────
//  This screen AUTOMATICALLY opens when the patient presses the Urge button
//  or speaks "craving" into the mic. It takes over the entire screen
//  to redirect the patient's attention away from the urge.
//
//  The science behind it:
//  • Box Breathing (4-4-4 pattern) activates the parasympathetic nervous
//    system, reducing cortisol and craving intensity within 60–90 seconds.
//  • Grounding audio interrupts the dopamine-seeking loop by engaging
//    higher cognitive function (listening, processing language).
//  • Average urge peaks at 20 minutes — this tool is designed to bridge
//    that window without any substance use.
//
// GEN AI ROLE ON THIS SCREEN
// ──────────────────────────
//  The grounding scripts are AI-generated, patient-aware narratives.
//  Web Speech Synthesis reads them aloud in a calm voice.
//  In production: replace with ElevenLabs or AWS Polly for a truly
//  AI-generated warm human voice that says the patient's name.
//
// DESIGN PRINCIPLE
// ────────────────
//  Soft lavender-to-mint gradient — NOT black.
//  Maximum whitespace. Minimum text. The breathing circle is the hero.
//  Every element is designed to lower anxiety, not add to it.

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Props { isOpen: boolean; onClose: () => void; }

type PhaseKey = 'inhale' | 'hold' | 'exhale' | 'rest';

interface Phase {
  key: PhaseKey;
  label: string;
  duration: number;
  maxR: number;
  color: string;
  bg: string;
  instruction: string;
}

const PHASES: Phase[] = [
  { key:'inhale',  label:'Inhale',  duration:4, maxR:88, color:'#0891b2', bg:'#e0f2fe', instruction:'Breathe in slowly through your nose…' },
  { key:'hold',    label:'Hold',    duration:4, maxR:88, color:'#7c3aed', bg:'#ede9fe', instruction:'Hold gently — feel the stillness…' },
  { key:'exhale',  label:'Exhale',  duration:4, maxR:36, color:'#059669', bg:'#d1fae5', instruction:'Release slowly through your mouth…' },
  { key:'rest',    label:'Rest',    duration:2, maxR:36, color:'#d97706', bg:'#fef3c7', instruction:'Rest — you are safe right here…' },
];

const GROUNDING_SCRIPTS = [
  "You are safe right now. This craving is a wave — it rises, peaks, then fades. Your brain is asking for something it no longer needs. Right now, all you have to do is breathe with this circle.",
  "Notice 5 things around you. 4 things you can touch. 3 sounds you can hear. 2 things you can smell. 1 thing you can taste. You are grounded. You are present. You are enough.",
  "Every urge peaks at around 20 minutes, then fades. You have ridden this wave before — every single time. Right now, just follow the circle. Nothing else is required of you.",
  "Imagine a wave beneath a surfboard. You don't fight the ocean — you ride it. Let this feeling move through you without acting on it. Each exhale is tension leaving your body.",
  "Your body is safe. Your mind is strong. This feeling is a signal, not a command. You get to choose. And right now, you are choosing to breathe. That is extraordinary.",
];

const MIN_R = 36;
const MAX_R = 88;
const SVG_SIZE = 220;
const CENTER = SVG_SIZE / 2;

export default function InterventionView({ isOpen, onClose }: Props) {
  const [phaseIdx, setPhaseIdx]      = useState(0);
  const [progress, setProgress]      = useState(0);    // 0 → 1 within phase
  const [cycleCount, setCycleCount]  = useState(0);
  const [scriptIdx, setScriptIdx]    = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];

  // ── Breathing timer ────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setProgress((prev) => {
      const step = 1 / (phase.duration * 20);
      const next = prev + step;
      if (next >= 1) {
        setPhaseIdx((pi) => {
          const np = (pi + 1) % PHASES.length;
          if (np === 0) setCycleCount((c) => c + 1);
          return np;
        });
        return 0;
      }
      return next;
    });
  }, [phase.duration]);

  useEffect(() => {
    if (!isOpen) {
      clearInterval(intervalRef.current!);
      setPhaseIdx(0); setProgress(0); setCycleCount(0);
      return;
    }
    intervalRef.current = setInterval(tick, 50);
    return () => clearInterval(intervalRef.current!);
  }, [isOpen, tick]);

  // ── Grounding audio ────────────────────────────────────────────────────────
  const speakGrounding = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (audioPlaying) { window.speechSynthesis.cancel(); setAudioPlaying(false); return; }
    const utter = new SpeechSynthesisUtterance(GROUNDING_SCRIPTS[scriptIdx]);
    utter.rate = 0.78; utter.pitch = 0.9; utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const calm = voices.find((v) => /samantha|karen|moira|victoria|female/i.test(v.name));
    if (calm) utter.voice = calm;
    utter.onend = () => setAudioPlaying(false);
    utter.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utter);
    setAudioPlaying(true);
    setScriptIdx((s) => (s + 1) % GROUNDING_SCRIPTS.length);
  }, [audioPlaying, scriptIdx]);

  useEffect(() => {
    if (!isOpen) { window.speechSynthesis?.cancel(); setAudioPlaying(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  // Circle radius calculation with easing
  const eased =
    phaseIdx === 0 ? progress * progress :              // ease-in for inhale
    phaseIdx === 2 ? 1 - (1 - progress) ** 2 : progress; // ease-out for exhale

  const r =
    phaseIdx === 0 ? MIN_R + (MAX_R - MIN_R) * eased :
    phaseIdx === 1 ? MAX_R :
    phaseIdx === 2 ? MAX_R - (MAX_R - MIN_R) * eased :
    MIN_R;

  const arcCircumference = 2 * Math.PI * (MAX_R + 8);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screen 3 — AI Intervention: Breathing and Grounding"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto"
      style={{
        background: 'linear-gradient(160deg, #f0f9ff 0%, #faf5ff 50%, #f0fdf4 100%)',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close intervention and return to dashboard"
        className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 z-10"
        style={{ backgroundColor: '#ffffff', borderColor: '#e8d5c4', color: '#8c6f5e' }}
      >
        ✕
      </button>

      <div className="flex flex-col items-center gap-5 w-full max-w-sm">

        {/* Screen label */}
        <div
          className="w-full rounded-xl px-3 py-2 border text-center"
          style={{ backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }}
        >
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#7c3aed' }}>
            Screen 3 · AI Intervention View
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6d28d9' }}>
            Auto-opens on craving · Box breathing + AI grounding voice
          </p>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: '#1c1917' }}>Box Breathing</h2>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>
            {cycleCount > 0
              ? `✨ ${cycleCount} cycle${cycleCount > 1 ? 's' : ''} complete — you&apos;re doing great`
              : 'Follow the circle · science-backed craving relief'}
          </p>
        </div>

        {/* SVG Breathing Circle */}
        <div
          role="img"
          aria-label={`Breathing: ${phase.label} — ${phase.instruction}`}
          aria-live="polite"
          className="rounded-full p-4 transition-all duration-700"
          style={{ backgroundColor: phase.bg }}
        >
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} aria-hidden="true">
            {/* Background track */}
            <circle cx={CENTER} cy={CENTER} r={MAX_R + 8} fill="none" stroke="#e2e8f0" strokeWidth="3" />
            {/* Phase progress arc */}
            <circle
              cx={CENTER} cy={CENTER} r={MAX_R + 8}
              fill="none"
              stroke={phase.color}
              strokeWidth="4"
              strokeDasharray={`${arcCircumference}`}
              strokeDashoffset={`${arcCircumference * (1 - progress)}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              style={{ transition: 'stroke 0.6s ease' }}
            />
            {/* Main breathing circle */}
            <circle
              cx={CENTER} cy={CENTER} r={r}
              fill={phase.color}
              fillOpacity="0.15"
              stroke={phase.color}
              strokeWidth="2.5"
              style={{ transition: 'r 0.05s linear, stroke 0.6s ease, fill 0.6s ease' }}
            />
            {/* Phase label */}
            <text x={CENTER} y={CENTER - 6} textAnchor="middle" fill={phase.color} fontSize="18" fontWeight="800">
              {phase.label}
            </text>
            <text x={CENTER} y={CENTER + 14} textAnchor="middle" fill="#78716c" fontSize="13">
              {phase.duration}s
            </text>
          </svg>
        </div>

        {/* Instruction */}
        <p
          className="text-center text-base font-medium px-4 min-h-[2.5rem]"
          style={{ color: '#374151' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {phase.instruction}
        </p>

        {/* Phase dots */}
        <div className="flex gap-2" aria-hidden="true">
          {PHASES.map((p, i) => (
            <div
              key={p.key}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === phaseIdx ? '1.5rem' : '0.5rem',
                backgroundColor: p.color,
                opacity: i === phaseIdx ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Grounding audio button */}
        <button
          onClick={speakGrounding}
          aria-label={audioPlaying ? 'Stop AI grounding audio' : 'Play AI grounding voice script'}
          aria-pressed={audioPlaying}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all focus:outline-none focus:ring-2"
          style={{
            backgroundColor: audioPlaying ? '#ede9fe' : '#ffffff',
            borderColor: audioPlaying ? '#7c3aed' : '#d1d5db',
            color: audioPlaying ? '#7c3aed' : '#374151',
            boxShadow: audioPlaying ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
          }}
        >
          <span aria-hidden="true">{audioPlaying ? '🔊' : '🔈'}</span>
          {audioPlaying ? 'Stop Grounding Voice' : '▶ Play AI Grounding Voice'}
        </button>

        {/* Grounding script */}
        <div
          className="w-full rounded-xl border p-4"
          style={{ backgroundColor: '#ffffff', borderColor: '#e8d5c4' }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#8c6f5e' }}>
            GenAI Grounding Script
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: '#374151' }}>
            &ldquo;{GROUNDING_SCRIPTS[scriptIdx]}&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: '#a8a29e' }}>
            5 rotating scripts · reads aloud via browser speech synthesis
          </p>
        </div>

        {/* Exit CTA */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl border-2 font-black text-sm transition-all focus:outline-none focus:ring-2 card-lift"
          style={{
            backgroundColor: '#f0fdf4',
            borderColor: '#34d399',
            color: '#065f46',
          }}
        >
          ✅ Craving Has Passed · Return to Dashboard
        </button>
      </div>
    </div>
  );
}
