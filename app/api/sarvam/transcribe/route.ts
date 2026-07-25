// ─── POST /api/sarvam/transcribe ─────────────────────────────────────────────
// Accepts audio/webm blob, sends to Sarvam Saaras STT.
// Returns transcript + detected language code.
// Supports all Indian languages + English (auto-detect).

import { NextRequest, NextResponse } from 'next/server';
import { sarvamTranscribe } from '@/app/lib/sarvam';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const languageCode = (formData.get('language') as string) ?? 'unknown';

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Size limit: 10MB
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 10MB)' }, { status: 413 });
    }

    const result = await sarvamTranscribe(audioFile, languageCode);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/sarvam/transcribe]', err);
    return NextResponse.json(
      { error: 'Transcription failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
