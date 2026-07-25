// ─── Neon DB Client + Schema ───────────────────────────────────────────────────
// Uses @neondatabase/serverless — works in both Node.js API routes and Edge.
// Stores every urge event with timestamp, patient ID, substance type & duration.

import { neon } from '@neondatabase/serverless';

// Singleton SQL client
export const sql = neon(process.env.DATABASE_URL!);

/**
 * Create tables if they don't exist yet.
 * Call this once from an API route on first boot.
 */
export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS urge_events (
      id          SERIAL PRIMARY KEY,
      patient_id  VARCHAR(50)  NOT NULL,
      patient_name VARCHAR(100) NOT NULL,
      substance   VARCHAR(100) NOT NULL,
      event_type  VARCHAR(20)  NOT NULL CHECK (event_type IN ('crisis','urge','safe')),
      sober_days  INTEGER      NOT NULL DEFAULT 0,
      language    VARCHAR(10)  NOT NULL DEFAULT 'en-IN',
      transcript  TEXT,
      ai_response TEXT,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id          SERIAL PRIMARY KEY,
      patient_id  VARCHAR(50)  NOT NULL,
      log_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
      safe_count  INTEGER      NOT NULL DEFAULT 0,
      urge_count  INTEGER      NOT NULL DEFAULT 0,
      crisis_count INTEGER     NOT NULL DEFAULT 0,
      UNIQUE(patient_id, log_date)
    );
  `;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface UrgeEvent {
  id: number;
  patient_id: string;
  patient_name: string;
  substance: string;
  event_type: 'crisis' | 'urge' | 'safe';
  sober_days: number;
  language: string;
  transcript?: string;
  ai_response?: string;
  created_at: string;
}

/**
 * Insert a new event when a patient taps a button or uses voice.
 */
export async function insertEvent(params: {
  patientId: string;
  patientName: string;
  substance: string;
  eventType: 'crisis' | 'urge' | 'safe';
  soberDays: number;
  language?: string;
  transcript?: string;
  aiResponse?: string;
}): Promise<UrgeEvent[]> {
  const rows = await sql`
    INSERT INTO urge_events
      (patient_id, patient_name, substance, event_type, sober_days, language, transcript, ai_response)
    VALUES
      (${params.patientId}, ${params.patientName}, ${params.substance},
       ${params.eventType}, ${params.soberDays}, ${params.language ?? 'en-IN'},
       ${params.transcript ?? null}, ${params.aiResponse ?? null})
    RETURNING *
  `;
  return rows as unknown as UrgeEvent[];
}

/**
 * Get recent events for a patient (last 30 days).
 */
export async function getPatientHistory(patientId: string): Promise<UrgeEvent[]> {
  const rows = await sql`
    SELECT * FROM urge_events
    WHERE patient_id = ${patientId}
      AND created_at > NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows as unknown as UrgeEvent[];
}

/**
 * Upsert daily summary log.
 */
export async function upsertDailyLog(
  patientId: string,
  eventType: 'crisis' | 'urge' | 'safe'
): Promise<void> {
  const col =
    eventType === 'crisis' ? sql`crisis_count = daily_logs.crisis_count + 1` :
    eventType === 'urge'   ? sql`urge_count   = daily_logs.urge_count   + 1` :
                             sql`safe_count   = daily_logs.safe_count   + 1`;

  await sql`
    INSERT INTO daily_logs (patient_id, log_date, safe_count, urge_count, crisis_count)
    VALUES (${patientId}, CURRENT_DATE,
      ${eventType === 'safe'   ? 1 : 0},
      ${eventType === 'urge'   ? 1 : 0},
      ${eventType === 'crisis' ? 1 : 0}
    )
    ON CONFLICT (patient_id, log_date) DO UPDATE SET
      safe_count   = daily_logs.safe_count   + ${eventType === 'safe'   ? 1 : 0},
      urge_count   = daily_logs.urge_count   + ${eventType === 'urge'   ? 1 : 0},
      crisis_count = daily_logs.crisis_count + ${eventType === 'crisis' ? 1 : 0}
  `;
}
