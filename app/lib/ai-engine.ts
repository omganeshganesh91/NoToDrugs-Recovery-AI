// ─── AI Script Generation Engine ─────────────────────────────────────────────
// Generates personalised caregiver scripts from real Indian patient profiles.
// Pure function — fully testable, no side effects.
// In production: swap generateAIScript() body for a Sarvam-30B API call.

import { PatientProfile, LastAction } from '../types';

// ── Real Indian patient profiles ──────────────────────────────────────────────
export const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Arjun Sharma',
    age: 32,
    substanceType: 'Opioid (Heroin)',
    soberDays: 47,
    emergencyContact: 'Priya Sharma (behen) — +91 98201 34567',
    medicalNotes: 'Naloxone kit ghar mein hai. Penicillin se allergy. AIIMS Delhi mein Dr. Meera Kapoor ke patient.',
  },
  {
    id: 'p2',
    name: 'Sneha Reddy',
    age: 26,
    substanceType: 'Sharab (Alcohol)',
    soberDays: 14,
    emergencyContact: 'Ramesh Reddy (bhai) — +91 94400 78902',
    medicalNotes: 'Withdrawal seizures ki history hai. Akele mat chhodna. Apollo Hospital Hyderabad.',
  },
  {
    id: 'p3',
    name: 'Mohammed Faraz',
    age: 38,
    substanceType: 'Nasha (Synthetic Drugs)',
    soberDays: 91,
    emergencyContact: 'Dr. Siddiqui (counselor) — +91 99001 23456',
    medicalNotes: 'Dil ki bimari hai. Stimulants se door rakhna. Nimhans Bangalore.',
  },
];

// ── Real Indian emergency contacts ────────────────────────────────────────────
export const EMERGENCY_CONTACTS = [
  { label: 'Police / Ambulance', number: '112',          type: 'emergency' as const },
  { label: 'NIMHANS Helpline',   number: '080-46110007', type: 'support'   as const },
  { label: 'iCall (TISS)',       number: '9152987821',   type: 'support'   as const },
  { label: 'Vandrevala Foundation', number: '1860-2662-345', type: 'support' as const },
  { label: 'AIIMS Drug Helpline', number: '011-26593677', type: 'detox'    as const },
  { label: 'Jeevan Aastha',      number: '1800-233-3330', type: 'support'  as const },
];

// ── Script templates ───────────────────────────────────────────────────────────
const CRISIS_SCRIPTS = [
  (p: PatientProfile) =>
    `🚨 SANKAT — ${p.name.toUpperCase()}, Umar ${p.age} saal\n\nAapke ghar ke insaan ne abhi emergency signal bheja hai — ${new Date().toLocaleTimeString('hi-IN')} baje.\n\n📍 TURANT KAREN:\n1. Abhi 112 call karen — "possible ${p.substanceType} overdose" bolen\n2. Unhe akela BILKUL mat chhodein\n3. Agar Naloxone hai to abhi lagaen\n4. Ambulance ke liye darwaza khula rakhein\n\n🏥 DOCTOR KO BATANE WALI BAAT:\n"${p.name} ko ${p.substanceType} ki bimari hai. ${p.medicalNotes}. Emergency contact: ${p.emergencyContact}."\n\n⏱️ ${p.soberDays} din sobriety ke baad — relapse ke signs hain.`,

  (p: PatientProfile) =>
    `🚨 CRISIS DETECTED — ${p.name}\n\nSamay: ${new Date().toLocaleTimeString()}\n\n📞 112 CALL SCRIPT:\n"Mujhe turant medical help chahiye. Mere ${p.age} saal ke ${p.substanceType} use disorder wale family member ne crisis button dabaya hai. Address: [apna pata bolen]. Please ambulance bhejo."\n\n✅ INTEZAAR KARTE WAQT:\n• Unse baat karte raho — hosh mein rakhein\n• Kuch khilao/pilao mat\n• ${p.medicalNotes}\n• Emergency contact: ${p.emergencyContact}`,
];

const URGE_SCRIPTS = [
  (p: PatientProfile) =>
    `⚠️ CRAVING ALERT — ${p.name} ko abhi support chahiye\n\nSamay: ${new Date().toLocaleTimeString()}\n\n💬 YEH BOLEN (zor se padhein ya message karein):\n"${p.name}, main dekh raha/rahi hoon. Yeh talab aayi hai aur jayegi — 15-20 minute mein peak hogi aur khatam ho jayegi. Tumhare paas ${p.soberDays} din ki taqat hai. Main yahan hoon. Mere saath saans lo."\n\n🛠️ DE-ESCALATION:\n1. ${p.substanceType} se judi cheezein hatao\n2. 5 minute ki sair ka suggestion do\n3. Phone pe breathing app chalao\n4. Agar 20 min baad bhi hai: iCall call karo 9152987821\n\n🎯 Abhi lecture ya sharam mat dilao — sirf saath raho.`,

  (p: PatientProfile) =>
    `⚠️ CRAVING SIGNAL — ${p.name}\n\nButton dabaya: ${new Date().toLocaleTimeString()}\n\n📖 CAREGIVER SCRIPT:\n"Tum sabse mushkil kaam kar rahe ho. ${p.soberDays} din asli hain — yeh TUM ho. Yeh feeling tumhara dimag kuch maang raha hai jo use ab chahiye nahi. Abhi sirf ek kaam karo — ek minute mere saath saans lo."\n\n⏰ TIMELINE:\n• 0–5 min: Paas raho, shor-sharaba kam karo\n• 5–15 min: Saath breathing app use karo\n• 15–30 min: Chalna, paani, sangeet\n• 30+ min: Unki himmat ki tarif karo`,
];

const SAFE_SCRIPTS = [
  (p: PatientProfile) =>
    `✅ ${p.name.toUpperCase()} SURAKSHIT HAI — Progress Log Ho Gayi\n\nSamay: ${new Date().toLocaleTimeString()}\n\n🎉 ${p.soberDays} DIN KI JEET!\n\n💬 CELEBRATION MESSAGE:\n"${p.name}, aaj log karna ek himmat ka kaam hai. ${p.soberDays} din chhota number nahi hai — yeh ${p.soberDays} subah, ${p.soberDays} faisle, ${p.soberDays} jitein hain. Hum tumpe garv karte hain."\n\n📊 WELLNESS:\n• Mood: Stable\n• Streak: ${p.soberDays} din\n\n${p.soberDays >= 30 ? '🏆 30-Din Milestone Pura!' : `🎯 ${30 - p.soberDays} din baad 30-din badge`}`,

  (p: PatientProfile) =>
    `✅ SAFE CHECK-IN — ${p.name}\n\nLog kiya: ${new Date().toLocaleTimeString()} • Din ${p.soberDays}\n\n🌟 POSITIVE MESSAGE:\n"Har check-in bataata hai ki tum apne liye lad rahe ho. Yeh bahut matter karta hai. Aaj bhi count karta hai. TUM count karte ho."\n\n📅 MILESTONES:\n${p.soberDays >= 30 ? '🏆 Ek mahina complete!' : `🎯 ${30 - p.soberDays} din aur 30-din badge ke liye`}\n${p.soberDays >= 7 ? '✨ Pehla hafte ka badge mila!' : `📍 ${7 - p.soberDays} din aur pehle hafte ke liye`}`,
];

/**
 * Generates personalised caregiver script.
 * Pure function — deterministic, XSS-safe.
 */
export function generateAIScript(action: LastAction, profile: PatientProfile): string {
  const safe = sanitizeProfile(profile);
  const pool =
    action === 'crisis' ? CRISIS_SCRIPTS :
    action === 'urge'   ? URGE_SCRIPTS   :
    action === 'safe'   ? SAFE_SCRIPTS   : null;
  if (!pool) return '';
  return pool[safe.soberDays % pool.length](safe);
}

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
