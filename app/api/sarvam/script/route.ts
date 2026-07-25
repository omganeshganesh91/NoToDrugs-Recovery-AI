// ─── POST /api/sarvam/script ─────────────────────────────────────────────────
// Generates personalised caregiver AI script using Sarvam-30B chat model,
// then translates it to the requested language using Sarvam Mayura.
// Falls back to local template engine if API key is missing.

import { NextRequest, NextResponse } from 'next/server';
import { sarvamChat, sarvamTranslate } from '@/app/lib/sarvam';
import { generateAIScript, MOCK_PATIENTS } from '@/app/lib/ai-engine';
import { LastAction } from '@/app/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { patientId, eventType, language } = await req.json();

    const patient = MOCK_PATIENTS.find((p) => p.id === patientId) ?? MOCK_PATIENTS[0];
    const targetLang = (language as string) ?? 'en-IN';

    let script = '';

    // Try Sarvam-30B first; fall back to local template
    if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here') {
      const system = `You are a compassionate crisis support AI for a substance use recovery platform.
Write a clear, actionable, personalised caregiver support script.
Be warm, direct and specific. Avoid jargon. Format with numbered steps.`;

      const user = `Patient: ${patient.name}, Age ${patient.age}
Substance: ${patient.substanceType}
Sober days: ${patient.soberDays}
Medical notes: ${patient.medicalNotes}
Emergency contact: ${patient.emergencyContact}
Event: ${eventType} (${eventType === 'crisis' ? 'medical emergency' : eventType === 'urge' ? 'strong craving' : 'safe check-in'})

Write a caregiver action script for this specific event. Include what to say, what to do, and who to call.`;

      script = await sarvamChat(system, user);
    } else {
      // Local fallback
      script = generateAIScript(eventType as LastAction, patient);
    }

    // Translate to requested language
    if (targetLang !== 'en-IN' && script) {
      script = await sarvamTranslate(script, targetLang, 'en-IN');
    }

    return NextResponse.json({ script });
  } catch (err) {
    console.error('[/api/sarvam/script]', err);
    // Always return something — fall back to local template
    const patient = MOCK_PATIENTS[0];
    const fallback = generateAIScript((req as any)._eventType ?? 'urge', patient);
    return NextResponse.json({ script: fallback });
  }
}
