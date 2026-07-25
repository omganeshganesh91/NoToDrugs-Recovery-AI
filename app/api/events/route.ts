// ─── POST /api/events ────────────────────────────────────────────────────────
// Logs a patient event (crisis / urge / safe) to Neon DB.
// Also updates the daily summary log for streak tracking.

import { NextRequest, NextResponse } from 'next/server';
import { initSchema, insertEvent, upsertDailyLog } from '@/app/lib/db';

let schemaReady = false;

export async function POST(req: NextRequest) {
  try {
    // Lazy schema init — creates tables on first request
    if (!schemaReady) {
      await initSchema();
      schemaReady = true;
    }

    const body = await req.json();
    const { patientId, patientName, substance, eventType, soberDays, language, transcript, aiResponse } = body;

    // Basic input validation
    if (!patientId || !eventType || !['crisis', 'urge', 'safe'].includes(eventType)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const [event] = await insertEvent({
      patientId: String(patientId).slice(0, 50),
      patientName: String(patientName ?? 'Unknown').slice(0, 100),
      substance: String(substance ?? 'Unknown').slice(0, 100),
      eventType,
      soberDays: Math.max(0, parseInt(soberDays) || 0),
      language: String(language ?? 'en-IN').slice(0, 10),
      transcript: transcript ? String(transcript).slice(0, 2000) : undefined,
      aiResponse: aiResponse ? String(aiResponse).slice(0, 5000) : undefined,
    });

    await upsertDailyLog(String(patientId), eventType);

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err) {
    console.error('[/api/events]', err);
    return NextResponse.json(
      { error: 'Database error', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
