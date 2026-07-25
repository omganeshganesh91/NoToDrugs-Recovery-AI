// ─── GET /api/history?patientId=p1 ───────────────────────────────────────────
// Returns last 30 days of urge/crisis/safe events for a patient.
// Used by the caregiver panel to show the urge tracking timeline.

import { NextRequest, NextResponse } from 'next/server';
import { getPatientHistory, initSchema } from '@/app/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let schemaReady = false;

export async function GET(req: NextRequest) {
  try {
    if (!schemaReady) {
      await initSchema();
      schemaReady = true;
    }

    const patientId = req.nextUrl.searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const events = await getPatientHistory(patientId);
    return NextResponse.json({ events });
  } catch (err) {
    console.error('[/api/history]', err);
    return NextResponse.json(
      { error: 'Failed to fetch history', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
