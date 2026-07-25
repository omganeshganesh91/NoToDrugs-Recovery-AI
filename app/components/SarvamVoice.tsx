'use client';
// ─── Sarvam AI Voice Recorder ─────────────────────────────────────────────────
// Click-to-toggle recording. Sends audio to Sarvam Saaras STT.
// Falls back to browser Web Speech API if Sarvam unavailable.
// All UI labels driven by selectedLanguage via i18n.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../lib/sarvam';
import { useUI } from '../lib/i18n';

interface Props {
  onResult: (keyword: string, transcript: string, language: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  disabled?: boolean;
}

// Multi-language keyword routing
const CRISIS_RE = /\b(help|madad|bachao|emergency|overdose|dying|maro|sos|sahayata|sankat|ambulance|bachao|救命|помощь|உதவி|సహాయం|ಸಹಾಯ|sahay)\b/i;
const URGE_RE   = /\b(craving|lalach|chahiye|urge|want|need|alcohol|drug|sharab|dawai|peena|nasha|drink|smoke|pi|pina|adat|talab|mann|போதை|వ్యసనం|ವ్యసన|中毒)\b/i;
const SAFE_RE   = /\b(safe|surakshit|theek|okay|fine|good|sober|acha|mast|thik|bilkul theek|all good|i am fine|i am safe|main theek|பாதுகாப்பு|సురక్షితం|ಸುರಕ್ಷಿತ)\b/i;

// Try to find best supported mime type
function getBestMime(): string {
  const types = [
    'audio/wav',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    '',
  ];
  return types.find((t) => !t || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t))) ?? '';
}

export default function SarvamVoice({ onResult, selectedLanguage, setSelectedLanguage, disabled }: Props) {
  const t = useUI(selectedLanguage);
  const [recording, setRecording]     = useState(false);
  const [status, setStatus]           = useState('');
  const [error, setError]             = useState('');
  const [processing, setProcessing]   = useState(false);
  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeRef   = useRef('');

  // Start recording on first click
  const startRecording = useCallback(async () => {
    if (recording || processing || disabled) return;
    setError(''); setStatus('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = getBestMime();
      mimeRef.current = mime;
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = handleStop;
      recorder.start(200); // chunk every 200ms ensures data
      mediaRef.current = recorder;
      setRecording(true);
      setStatus(t.voiceRecording);
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      setError(
        msg.includes('NotAllowed') || msg.includes('Permission')
          ? '🚫 Mic blocked — allow microphone in browser settings'
          : '🎤 Mic error: ' + msg
      );
    }
  }, [recording, processing, disabled, t.voiceRecording]); // eslint-disable-line

  // Stop recording on second click
  const stopRecording = useCallback(() => {
    if (!recording || !mediaRef.current) return;
    mediaRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    streamRef.current = null;
    setRecording(false);
    setProcessing(true);
    setStatus(t.voiceProcessing);
  }, [recording, t.voiceProcessing]);

  const handleMicClick = useCallback(() => {
    if (recording) stopRecording();
    else startRecording();
  }, [recording, startRecording, stopRecording]);

  // Process audio after recording stops
  const handleStop = useCallback(async () => {
    const chunks = chunksRef.current;
    if (!chunks.length) {
      setProcessing(false);
      setStatus('Too short — please record again');
      return;
    }

    const mime = mimeRef.current || 'audio/webm';
    const blob = new Blob(chunks, { type: mime });

    if (blob.size < 200) {
      setProcessing(false);
      setStatus('Too short — speak louder and try again');
      return;
    }

    // ── Try Sarvam API ────────────────────────────────────────────────────
    let transcript = '';
    let detectedLang = selectedLanguage;

    try {
      const form = new FormData();
      // Use .wav extension hint — Sarvam accepts most formats
      const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'mp4' : 'webm';
      form.append('audio', blob, `recording.${ext}`);
      // Always send the actual selected language; the API route will handle omitting it if needed
      form.append('language', selectedLanguage);

      const res = await fetch('/api/sarvam/transcribe', {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        const data = await res.json();
        transcript = (data.transcript ?? '').trim();
        detectedLang = data.languageCode ?? selectedLanguage;
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn('Sarvam STT failed:', err);
      }
    } catch (e) {
      console.warn('Sarvam fetch failed, falling back to browser STT', e);
    }

    // ── Browser STT fallback if Sarvam returned nothing ───────────────────
    if (!transcript && typeof window !== 'undefined') {
      transcript = await runBrowserSTT(selectedLanguage);
    }

    setProcessing(false);

    if (!transcript) {
      setError('Could not transcribe — try speaking clearly, or tap a button directly');
      return;
    }

    const lower = transcript.toLowerCase();
    setStatus(`✅ "${transcript}" [${detectedLang}]`);

    if      (CRISIS_RE.test(lower)) onResult('crisis', transcript, detectedLang);
    else if (URGE_RE.test(lower))   onResult('urge',   transcript, detectedLang);
    else if (SAFE_RE.test(lower))   onResult('safe',   transcript, detectedLang);
    else setStatus(`"${transcript}" — say help, craving, or safe`);
  }, [selectedLanguage, onResult]);

  // Cleanup
  useEffect(() => () => {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
  }, []);

  return (
    <div
      className="rounded-2xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-300"
      style={{
        backgroundColor: recording ? '#1e1208' : '#141414',
        borderColor: recording ? '#ea580c' : '#2d1a0a',
        boxShadow: recording ? '0 0 0 6px rgba(234,88,12,0.18)' : 'none',
      }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f97316' }}>
            {t.voiceTitle}
          </p>
          <p className="text-xs" style={{ color: '#fb923c' }}>{t.voiceSub}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold border"
          style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#f97316' }}>
          {SUPPORTED_LANGUAGES[selectedLanguage] ?? selectedLanguage}
        </span>
      </div>

      {/* Language selector */}
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        disabled={recording || processing}
        aria-label="Select speaking language"
        className="w-full text-xs rounded-xl px-3 py-2 border-2 font-medium focus:outline-none"
        style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#fb923c' }}
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>

      {/* Mic button */}
      <button
        onClick={handleMicClick}
        disabled={processing}
        aria-label={recording ? 'Stop recording' : 'Start voice recording'}
        aria-pressed={recording}
        className="w-20 h-20 rounded-full flex items-center justify-center select-none transition-all duration-300 focus:outline-none focus:ring-4"
        style={{
          backgroundColor: recording ? '#ea580c' : processing ? '#2d1a0a' : '#1e1208',
          border: `3px solid ${recording ? '#c2410c' : processing ? '#c2410c' : '#3d2a10'}`,
          transform: recording ? 'scale(1.1)' : 'scale(1)',
          boxShadow: recording ? '0 0 0 10px rgba(234,88,12,0.22), 0 0 0 20px rgba(234,88,12,0.08)' : 'none',
          cursor: processing ? 'wait' : 'pointer',
        }}
      >
        <span className="text-3xl select-none" aria-hidden="true">
          {processing ? '⏳' : recording ? '⏹️' : '🎙️'}
        </span>
      </button>

      {/* Instruction */}
      <p className="text-xs font-bold text-center" style={{ color: recording ? '#f97316' : '#fb923c' }}>
        {processing ? t.voiceProcessing : recording ? t.voiceRecording : t.voiceIdle}
      </p>

      {/* Keyword grid */}
      <div className="w-full rounded-xl border grid grid-cols-3 gap-0 overflow-hidden"
        style={{ borderColor: '#2d1a0a' }}>
        {[
          { label: '🆘 Crisis', kw: t.kw_crisis, bg: '#1a0808', color: '#f87171', event: 'crisis', word: 'help' },
          { label: '🌊 Craving', kw: t.kw_urge, bg: '#1a1500', color: '#fbbf24', event: 'urge', word: 'craving' },
          { label: '✅ Safe', kw: t.kw_safe, bg: '#071a0e', color: '#34d399', event: 'safe', word: 'safe' },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setStatus(`✅ Voice Command: "${item.word}" [${selectedLanguage}]`);
              onResult(item.event, item.word, selectedLanguage);
            }}
            className="flex flex-col items-center py-2 px-1 border-r last:border-r-0 hover:brightness-125 transition cursor-pointer"
            style={{ backgroundColor: item.bg, borderColor: '#2d1a0a' }}
            title={`Click to simulate speaking "${item.word}"`}
          >
            <p className="text-xs font-black" style={{ color: item.color }}>{item.label}</p>
            <p className="text-xs text-center leading-tight mt-0.5" style={{ color: item.color, opacity: 0.9 }}>
              {item.kw}
            </p>
          </button>
        ))}
      </div>

      {status && (
        <p className="text-xs font-semibold text-center w-full px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#1e1208', color: '#fb923c' }} aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="text-xs text-center w-full px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#1a0808', color: '#f87171' }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Browser Web Speech API live recognition fallback
function runBrowserSTT(lang: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { resolve(''); return; }
      const r = new SR();
      r.lang = lang || 'hi-IN';
      r.continuous = false;
      r.interimResults = false;
      r.maxAlternatives = 5;
      let resolved = false;
      r.onresult = (e: any) => {
        const txt = Array.from(e.results as SpeechRecognitionResultList)
          .flatMap((res: SpeechRecognitionResult) => Array.from(res))
          .map((a: SpeechRecognitionAlternative) => a.transcript)
          .join(' ');
        resolved = true;
        resolve(txt);
      };
      r.onerror = () => { if (!resolved) resolve(''); };
      r.onend   = () => { if (!resolved) resolve(''); };
      r.start();
      setTimeout(() => { try { r.stop(); } catch {} if (!resolved) resolve(''); }, 5000);
    } catch { resolve(''); }
  });
}
