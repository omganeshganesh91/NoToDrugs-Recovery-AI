'use client';
// ─── Screen 3: AI Intervention View ──────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface PhaseConfig {
  label: string;
  duration: number; // seconds
  size: number;     // circle scale 0–1
  color: string;
  instruction: string;
}

const PHASES: PhaseConfig[] = [
  { label: 'Inhale',  duration: 4, size: 1,    color: '#3b82f6', instruction: 'Breathe in slowly through your nose…' },
  { label: 'Hold',    duration: 4, size: 1,    color: '#8b5cf6', instruction: 'Hold gently — feel the stillness…' },
  { label: 'Exhale',  duration: 4, size: 0.35, color: '#10b981', instruction: 'Release slowly through your mouth…' },
  { label: 'Rest',    duration: 2, size: 0.35, color: '#64748b', instruction: 'Rest — you are safe…' },
];

const GROUNDING_SCRIPTS = [
  "You are safe right now. This feeling is a wave — it will rise, and it will fall. Your brain is asking for something it no longer needs. Let's just breathe for the next 60 seconds.",
  "Notice 5 things you can see around you. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. You are grounded. You are here. You are enough.",
  "This craving is temporary. The average urge peaks at 20 minutes and then fades. You have beaten this before — every single time. Right now, all you have to do is breathe. That's it.",
  "Your body is safe. Your mind is strong. The urge is a signal, not a command. You get to choose. And right now, you're choosing to breathe, and that is extraordinary.",
  "Imagine a wave under a surfboard — you don't fight it, you ride it. Let the craving wash through you without acting on it. Each breath out is tension leaving your body.",
];

export default function InterventionView({ isOpen, onClose }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0–1
  const [cycleCount, setCycleCount] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentPhase = PHASES[phaseIndex];

  // ── Breathing timer ────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setPhaseProgress((prev) => {
      const next = prev + (1 / (currentPhase.duration * 20)); // 50ms ticks
      if (next >= 1) {
        setPhaseIndex((pi) => {
          const nextPhase = (pi + 1) % PHASES.length;
          if (nextPhase === 0) setCycleCount((c) => c + 1);
          return nextPhase;
        });
        return 0;
      }
      return next;
    });
  }, [currentPhase.duration]);

  useEffect(() => {
    if (!isOpen) {
      clearInterval(intervalRef.current!);
      setPhaseIndex(0);
      setPhaseProgress(0);
      setCycleCount(0);
      return;
    }
    intervalRef.current = setInterval(tick, 50);
    return () => clearInterval(intervalRef.current!);
  }, [isOpen, tick]);

  // ── Grounding audio (Web Speech Synthesis fallback) ────────────────────────
  const speakGrounding = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (audioPlaying) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(GROUNDING_SCRIPTS[scriptIndex]);
    utter.rate = 0.8;
    utter.pitch = 0.9;
    utter.volume = 1;
    // Prefer a calm voice if available
    const voices = window.speechSynthesis.getVoices();
    const calm = voices.find((v) => /female|samantha|karen|moira|victoria/i.test(v.name));
    if (calm) utter.voice = calm;
    utter.onend = () => setAudioPlaying(false);
    utter.onerror = () => setAudioPlaying(false);
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
    setAudioPlaying(true);
    setScriptIndex((s) => (s + 1) % GROUNDING_SCRIPTS.length);
  }, [audioPlaying, scriptIndex]);

  // Stop speech on close
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
      setAudioPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // SVG circle params
  const svgSize = 240;
  const center = svgSize / 2;
  const maxR = 90;
  const minR = maxR * 0.35;
  const eased =
    phaseIndex === 0 // inhale: ease in
      ? phaseProgress * phaseProgress
      : phaseIndex === 2 // exhale: ease out
      ? 1 - (1 - phaseProgress) * (1 - phaseProgress)
      : phaseProgress;

  const currentSize =
    phaseIndex === 0
      ? minR + (maxR - minR) * eased
      : phaseIndex === 1
      ? maxR
      : phaseIndex === 2
      ? maxR - (maxR - minR) * eased
      : minR;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Intervention — Breathing and Grounding Guide"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6 overflow-y-auto"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close intervention and return to dashboard"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 z-10"
      >
        ✕
      </button>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-black text-white">Box Breathing</h2>
          <p className="text-sm text-slate-400 mt-1">
            {cycleCount > 0 ? `${cycleCount} cycle${cycleCount > 1 ? 's' : ''} complete ✨` : 'Follow the circle · inhale, hold, exhale'}
          </p>
        </div>

        {/* SVG Breathing Circle */}
        <div
          role="img"
          aria-label={`Breathing phase: ${currentPhase.label} — ${currentPhase.instruction}`}
          aria-live="polite"
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            aria-hidden="true"
          >
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={maxR}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Progress arc */}
            <circle
              cx={center}
              cy={center}
              r={maxR + 6}
              fill="none"
              stroke={currentPhase.color}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * (maxR + 6)}`}
              strokeDashoffset={`${2 * Math.PI * (maxR + 6) * (1 - phaseProgress)}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke 0.5s ease' }}
            />
            {/* Breathing circle */}
            <circle
              cx={center}
              cy={center}
              r={currentSize}
              fill={currentPhase.color}
              fillOpacity="0.2"
              stroke={currentPhase.color}
              strokeWidth="2"
              style={{ transition: 'r 0.05s linear, stroke 0.5s ease, fill 0.5s ease' }}
            />
            {/* Phase label */}
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              {currentPhase.label}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              {currentPhase.duration}s
            </text>
          </svg>
        </div>

        {/* Instruction */}
        <p
          className="text-center text-sm text-slate-300 px-4 min-h-[40px]"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentPhase.instruction}
        </p>

        {/* Phase indicator dots */}
        <div className="flex gap-3" aria-hidden="true">
          {PHASES.map((p, i) => (
            <div
              key={p.label}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === phaseIndex ? 'w-6 opacity-100' : 'w-2 opacity-30'
              }`}
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>

        {/* Grounding Audio */}
        <button
          onClick={speakGrounding}
          aria-label={audioPlaying ? 'Stop grounding audio' : 'Play AI grounding voice script'}
          aria-pressed={audioPlaying}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
            ${audioPlaying
              ? 'bg-blue-900 border-blue-500 text-blue-200 animate-pulse'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
            }
          `}
        >
          <span aria-hidden="true">{audioPlaying ? '🔊' : '🔈'}</span>
          {audioPlaying ? 'Stop Grounding Audio' : 'Play Grounding Voice'}
        </button>

        {/* Grounding script preview */}
        <div className="w-full rounded-xl bg-slate-800/60 border border-slate-700 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Grounding Script</p>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{GROUNDING_SCRIPTS[scriptIndex]}&rdquo;
          </p>
        </div>

        {/* Safe exit */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold text-sm hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Craving has passed — return to main dashboard"
        >
          ✅ Craving Has Passed — Return to Dashboard
        </button>
      </div>
    </div>
  );
}
