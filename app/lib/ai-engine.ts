// ─── AI Script Generation Engine ─────────────────────────────────────────────
// Simulates a generative AI response engine (no external API required for demo)
// In production: replace generateScript() body with a fetch() to OpenAI/Bedrock.

import { PatientProfile, LastAction } from '../types';

const CRISIS_SCRIPTS = [
  (p: PatientProfile) =>
    `🚨 EMERGENCY ALERT — ${p.name.toUpperCase()}, ${p.age}yrs\n\nYour family member just triggered an emergency signal at ${new Date().toLocaleTimeString()}.\n\n📍 IMMEDIATE STEPS:\n1. Call 911 now — state "possible ${p.substanceType} overdose"\n2. Do NOT leave them alone\n3. If Naloxone is available, administer immediately\n4. Stay on the line with dispatchers\n\n🏥 MEDICAL CONTEXT FOR OPERATORS:\n"Patient has a known ${p.substanceType} use disorder. ${p.medicalNotes}. Emergency contact is ${p.emergencyContact}."\n\n⏱️ They have been sober for ${p.soberDays} days — relapse indicators may be present.`,
  (p: PatientProfile) =>
    `🚨 CRISIS DETECTED — ${p.name}\n\nTime: ${new Date().toLocaleTimeString()}\n\n📞 SCRIPT FOR 911 CALL:\n"Hello, I need emergency medical assistance. My ${p.age}-year-old family member who uses ${p.substanceType} has triggered a crisis alert. They are at [your address]. Please send paramedics immediately."\n\n✅ WHILE WAITING:\n• Keep them conscious — talk to them\n• Do not give food or water\n• Unlock the front door for paramedics\n• Gather any medications they take\n\n📋 Medical notes: ${p.medicalNotes}`,
];

const URGE_SCRIPTS = [
  (p: PatientProfile) =>
    `⚠️ URGE ALERT — ${p.name} needs support right now\n\nTime: ${new Date().toLocaleTimeString()}\n\n💬 WHAT TO SAY (read this aloud or text it):\n"${p.name}, I see you. This craving is temporary — it will peak and fade in 15–20 minutes. You have ${p.soberDays} days of strength behind you. I'm here. Breathe with me."\n\n🛠️ DE-ESCALATION STEPS:\n1. Remove ${p.substanceType}-related triggers from the environment\n2. Suggest a 5-minute walk together\n3. Engage the grounding app on their phone\n4. If urge persists >20 min, call the support line: 1-800-662-4357\n\n🎯 Do NOT shame, lecture, or problem-solve right now. Just be present.`,
  (p: PatientProfile) =>
    `⚠️ CRAVING SIGNAL from ${p.name}\n\nThey pressed the urge button at ${new Date().toLocaleTimeString()}.\n\n📖 CAREGIVER SCRIPT:\n"You're doing the hardest thing. ${p.soberDays} days is real — that's YOU. This feeling is your brain asking for something it doesn't actually need anymore. Let's just breathe for the next 60 seconds together."\n\n⏰ ACTION TIMELINE:\n• 0–5 min: Stay close, reduce stimulation\n• 5–15 min: Use breathing app together\n• 15–30 min: Light activity (walk, water, music)\n• 30+ min: Check in verbally, praise their effort`,
];

const SAFE_SCRIPTS = [
  (p: PatientProfile) =>
    `✅ ${p.name.toUpperCase()} IS SAFE — Progress Logged\n\nTime: ${new Date().toLocaleTimeString()}\n\n🎉 ${p.soberDays} DAYS STRONG!\n\n💬 CELEBRATION MESSAGE:\n"${p.name}, logging in today is an act of courage. ${p.soberDays} days is not a small number — it represents ${p.soberDays} choices, ${p.soberDays} mornings, ${p.soberDays} victories. We see you and we're proud of you."\n\n📊 WELLNESS CHECK:\n• Mood: Self-reported stable\n• Last crisis: No recent alerts\n• Streak: ${p.soberDays} days\n\n🌱 SUGGESTED ACTIVITY: Share a mindfulness tip or send a short motivational message today.`,
  (p: PatientProfile) =>
    `✅ SAFE CHECK-IN from ${p.name}\n\nLogged at ${new Date().toLocaleTimeString()} • Day ${p.soberDays}\n\n🌟 POSITIVE REINFORCEMENT SCRIPT:\n"Every check-in you make tells me you're fighting for yourself. That matters more than you know. Today counts. You count."\n\n📅 MILESTONE TRACKER:\n${p.soberDays >= 30 ? '🏆 30-Day Milestone Achieved!' : `🎯 ${30 - p.soberDays} days to 30-day milestone`}\n${p.soberDays >= 7 ? '✨ 1-Week badge earned' : `📍 ${7 - p.soberDays} days to first week`}\n\n💡 TIP FOR TODAY: Reach out with a simple "thinking of you" message — connection is protective.`,
];

/**
 * Generates a personalized AI-powered caregiver script.
 * Pure function — deterministic given the same inputs for testing.
 */
export function generateAIScript(
  action: LastAction,
  profile: PatientProfile
): string {
  // Sanitize profile inputs to prevent XSS if displayed as HTML
  const safe = sanitizeProfile(profile);

  const pool =
    action === 'crisis'
      ? CRISIS_SCRIPTS
      : action === 'urge'
      ? URGE_SCRIPTS
      : action === 'safe'
      ? SAFE_SCRIPTS
      : null;

  if (!pool) return '';

  // Rotate scripts based on soberDays for variety
  const index = safe.soberDays % pool.length;
  return pool[index](safe);
}

/**
 * Sanitizes a PatientProfile to prevent injection attacks.
 */
function sanitizeProfile(p: PatientProfile): PatientProfile {
  const clean = (s: string) =>
    s.replace(/[<>&"']/g, (c) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' }[c] ?? c)
    );
  return {
    ...p,
    name: clean(p.name),
    substanceType: clean(p.substanceType),
    medicalNotes: clean(p.medicalNotes),
    emergencyContact: clean(p.emergencyContact),
  };
}

/** Mock patient profiles for demo */
export const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Alex Rivera',
    age: 34,
    substanceType: 'Opioid',
    soberDays: 47,
    emergencyContact: 'Maria Rivera (sister) — 555-0147',
    medicalNotes: 'Allergic to penicillin. Has Naloxone kit at home.',
  },
  {
    id: 'p2',
    name: 'Jordan Lee',
    age: 28,
    substanceType: 'Alcohol',
    soberDays: 12,
    emergencyContact: 'Sam Lee (partner) — 555-0289',
    medicalNotes: 'History of withdrawal seizures. Do not leave alone.',
  },
  {
    id: 'p3',
    name: 'Morgan Chen',
    age: 41,
    substanceType: 'Stimulant',
    soberDays: 91,
    emergencyContact: 'Dr. Patel (counselor) — 555-0334',
    medicalNotes: 'Cardiac history. Avoid stimulants including caffeine.',
  },
];

export const EMERGENCY_CONTACTS = [
  { label: 'Emergency Services', number: '911', type: 'emergency' as const },
  { label: 'SAMHSA Helpline', number: '1-800-662-4357', type: 'support' as const },
  { label: 'Crisis Text Line', number: '741741', type: 'support' as const },
  { label: 'Local Detox Center', number: '555-DETOX', type: 'detox' as const },
  { label: 'Poison Control', number: '1-800-222-1222', type: 'emergency' as const },
];
