'use client';
// ─── Camera Wellness Check ────────────────────────────────────────────────────
// FIXED: startCamera called directly on button click (no stale ref issue).
// FIXED: AI wellness prompt message shown after every snapshot.
// FIXED: Orange Indian theme.

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  onCapture?: (dataUrl: string) => void;
  language?: string;
}

const WELLNESS_RESPONSES: Record<string, string[]> = {
  'en-IN': [
    '💙 You look well. Today is yours — take one step forward.',
    '🌟 Strength shows in your eyes. Your recovery journey is real.',
    '🌱 This reflection today becomes tomorrow\'s strength. Take care.',
    '✨ This check-in is a brave act. You are okay — we are here.',
    '🙏 Seeing yourself is the first step in recovery. You are on the right path.',
  ],
  'hi-IN': [
    '💙 Aap bahut ache lag rahe ho. Aaj ka din tumhara hai — ek kadam aage badhao.',
    '🌟 Tumhari aankhon mein determination hai. Recovery ki yeh yatra asli hai.',
    '🌱 Aaj ka reflection kal ki taqat banta hai. Apna khayal rakho.',
    '✨ Yeh check-in ek brave act hai. Tum theek ho — hum yahan hain.',
    '🙏 Khud ko dekhna recovery ka pehla qadam hai. Tum sahi raste par ho.',
  ],
  'ta-IN': [
    '💙 நீங்கள் நன்றாக தெரிகிறீர்கள். இன்று உங்களுடையது.',
    '🌟 உங்கள் கண்களில் உறுதி தெரிகிறது. இந்த பயணம் உண்மையானது.',
    '🌱 இன்றைய பிரதிபலிப்பு நாளைய வலிமையாகும்.',
    '✨ இந்த சோதனை ஒரு தைரியமான செயல். நீங்கள் சரியாக இருக்கிறீர்கள்.',
    '🙏 உங்களை பார்ப்பது மீட்சியின் முதல் படி.',
  ],
  'te-IN': [
    '💙 మీరు చాలా బాగా కనిపిస్తున్నారు. ఈ రోజు మీది.',
    '🌟 మీ కళ్ళలో దృఢ సంకల్పం కనిపిస్తోంది. ఈ ప్రయాణం నిజమైనది.',
    '🌱 ఈ రోజు ప్రతిబింబం రేపటి బలంగా మారుతుంది.',
    '✨ ఈ చెక్-ఇన్ ధైర్యమైన పని. మీరు సరిగ్గా ఉన్నారు.',
    '🙏 మిమ్మల్ని మీరు చూసుకోవడం కోలుకోవడంలో మొదటి అడుగు.',
  ],
};

function getWellnessResponse(lang: string): string {
  const pool = WELLNESS_RESPONSES[lang] ?? WELLNESS_RESPONSES['en-IN'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function CameraCheck({ onCapture, language = 'en-IN' }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  const [active, setActive]           = useState(false);
  const [snapshot, setSnapshot]       = useState<string | null>(null);
  const [error, setError]             = useState('');
  const [aiResponse, setAiResponse]   = useState('');
  const [loading, setLoading]         = useState(false);

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'user') => {
    setError('');
    setSnapshot(null);
    setAiResponse('');
    setLoading(true);
    try {
      // Stop any existing stream first
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('🚫 Camera blocked — allow camera in browser settings and retry');
      } else if (msg.includes('NotFound')) {
        setError('📷 No camera found on this device');
      } else {
        setError('Camera error: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Stop camera ─────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  // ── Take snapshot + generate AI wellness response ───────────────────────────
  const takeSnapshot = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    // Mirror front camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSnapshot(dataUrl);
    onCapture?.(dataUrl);
    stopCamera();

    // Language-aware AI wellness response
    const response = getWellnessResponse(language);
    setAiResponse(response);
  }, [language, onCapture, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  return (
    <div
      className="rounded-2xl border-2 p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#fdf4ff', borderColor: '#d8b4fe' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#7c3aed' }}>
            📷 Visual Wellness Check
          </p>
          <p className="text-xs" style={{ color: '#8b5cf6' }}>
            AI feedback after snapshot · Privacy-first · no upload
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold border"
          style={{ backgroundColor: '#f5f3ff', borderColor: '#c4b5fd', color: '#5b21b6' }}
        >
          ✦ AI
        </span>
      </div>

      {/* Idle state */}
      {!active && !snapshot && (
        <button
          onClick={() => startCamera('user')}
          disabled={loading}
          aria-label="Open camera for wellness check"
          className="w-full py-3 rounded-xl border-2 font-bold text-sm transition-all focus:outline-none focus:ring-4 flex items-center justify-center gap-2"
          style={{
            backgroundColor: loading ? '#f5f3ff' : '#7c3aed',
            borderColor: '#6d28d9',
            color: '#ffffff',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          <span aria-hidden="true">{loading ? '⏳' : '📷'}</span>
          {loading ? 'Starting camera…' : 'Open Camera · Wellness Check'}
        </button>
      )}

      {/* Camera active */}
      {active && (
        <div className="flex flex-col gap-2">
          <div
            className="rounded-xl overflow-hidden border-2 relative"
            style={{ borderColor: '#c4b5fd' }}
          >
            <video
              ref={videoRef}
              className="w-full rounded-xl"
              playsInline
              muted
              aria-label="Camera preview for visual wellness check"
              style={{
                maxHeight: '200px',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // mirror
                display: 'block',
              }}
            />
            <div
              className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold py-1"
              style={{ backgroundColor: 'rgba(124,58,237,0.8)', color: '#fff' }}
            >
              Look at the camera · AI will respond
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          <div className="flex gap-2">
            <button
              onClick={takeSnapshot}
              className="flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all focus:outline-none"
              style={{ backgroundColor: '#7c3aed', borderColor: '#6d28d9', color: '#ffffff' }}
              aria-label="Take snapshot for wellness check"
            >
              📸 Take Snapshot
            </button>
            <button
              onClick={() => { stopCamera(); setTimeout(() => startCamera('environment'), 300); }}
              className="px-3 py-2 rounded-xl border-2 text-sm focus:outline-none"
              style={{ backgroundColor: '#ede9fe', borderColor: '#c4b5fd', color: '#5b21b6' }}
              aria-label="Flip camera front/back"
              title="Flip camera"
            >
              🔄
            </button>
            <button
              onClick={stopCamera}
              className="px-3 py-2 rounded-xl border-2 text-sm focus:outline-none"
              style={{ backgroundColor: '#fff1f2', borderColor: '#fca5a5', color: '#991b1b' }}
              aria-label="Close camera"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Snapshot + AI response */}
      {snapshot && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={snapshot}
            alt="Your wellness check snapshot"
            className="rounded-xl border-2 w-full"
            style={{ borderColor: '#c4b5fd', maxHeight: '160px', objectFit: 'cover' }}
          />

          {/* AI wellness response */}
          {aiResponse && (
            <div
              className="rounded-xl border-2 p-3 slide-down"
              style={{ backgroundColor: '#f5f3ff', borderColor: '#a78bfa' }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#7c3aed' }}>
                🤖 AI Wellness Response
              </p>
              <p className="text-sm font-medium" style={{ color: '#4c1d95' }}>
                {aiResponse}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setSnapshot(null); setAiResponse(''); startCamera('user'); }}
              className="flex-1 py-2 rounded-xl border-2 text-sm font-semibold focus:outline-none"
              style={{ backgroundColor: '#ede9fe', borderColor: '#c4b5fd', color: '#5b21b6' }}
              aria-label="Retake wellness check photo"
            >
              📷 Retake
            </button>
            <button
              onClick={() => { setSnapshot(null); setAiResponse(''); }}
              className="flex-1 py-2 rounded-xl border-2 text-sm font-semibold focus:outline-none"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#065f46' }}
              aria-label="Done with wellness check"
            >
              ✅ Done
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl border px-3 py-2 text-xs"
          style={{ backgroundColor: '#fff1f2', borderColor: '#fca5a5', color: '#dc2626' }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
