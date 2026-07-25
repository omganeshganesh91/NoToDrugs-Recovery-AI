// ─── POST /api/sarvam/speak ──────────────────────────────────────────────────
// Converts text to speech using Sarvam Bulbul v2.
// Returns base64 WAV audio string.
// Supports all Indian languages for multilingual grounding voice.

import { NextRequest, NextResponse } from 'next/server';
import { sarvamTTS } from '@/app/lib/sarvam';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { text, language, speaker } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const audio = await sarvamTTS(
      text,
      language ?? 'en-IN',
      speaker ?? 'meera'
    );

    return NextResponse.json({ audio });
  } catch (err) {
    console.error('[/api/sarvam/speak]', err);
    return NextResponse.json(
      { error: 'TTS failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
