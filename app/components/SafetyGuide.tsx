'use client';
// ─── Screen 4: Contextual Safety Guide ───────────────────────────────────────
//
// BUSINESS PURPOSE
// ────────────────
//  This is the "living educational layer" of the platform.
//  It sits below Screen 1 and changes its content based on what happened last.
//  Three completely different information sets:
//
//  🔴 CRISIS tapped  → Naloxone administration steps + First Aid quick card
//  🌊 URGE tapped    → Trigger identification + caregiver de-escalation
//  ✅ SAFE tapped    → Mindfulness for long-term recovery + milestone guide
//
// GEN AI ROLE ON THIS SCREEN
// ──────────────────────────
//  In this demo, content is pre-authored per action category.
//  In production: GenAI dynamically generates educational cards based on:
//  - The patient's specific substance type
//  - Their sober day count (day 1 advice ≠ day 90 advice)
//  - Time of day (morning relapse triggers ≠ evening triggers)
//  - Historical pattern (if they always struggle on Fridays, show that)
//
// DESIGN PRINCIPLE
// ────────────────
//  Clean white cards on a warm off-white base — like a modern clinical brochure.
//  Colour-coded by urgency: red for crisis, amber for urge, green for safe.
//  Each card has a clear badge so evaluators can see context-awareness working.

import React, { useState, useEffect } from 'react';
import { LastAction } from '../types';

interface Step { icon: string; text: string; }
interface Card {
  id: string; icon: string; title: string; badge: string;
  badgeBg: string; badgeColor: string; borderColor: string; headerBg: string;
  steps: Step[]; footer: string;
}

const CARDS: Record<LastAction, Card[]> = {
  idle: [{
    id: 'welcome', icon: '💙', title: 'Welcome — How This Platform Works',
    badge: 'GETTING STARTED', badgeBg: '#0c1a2e', badgeColor: '#93c5fd',
    borderColor: '#1e40af', headerBg: '#080f1a',
    steps: [
      { icon: '🔴', text: 'Press Emergency if you or someone needs immediate medical help' },
      { icon: '🌊', text: 'Press Craving to open the AI breathing & grounding tool instantly' },
      { icon: '✅', text: 'Press Safe to log your sober day and get a motivational AI message' },
      { icon: '🎤', text: 'Hold the mic and say "help", "craving", or "safe" — no typing needed' },
      { icon: '🛡️', text: 'Caregiver panel syncs instantly — they see your status and get an AI script' },
    ],
    footer: 'Every button you press makes the AI smarter for you.',
  }],
  crisis: [
    {
      id: 'naloxone', icon: '💊', title: 'How to Administer Naloxone (Narcan)',
      badge: 'EMERGENCY GUIDE', badgeBg: '#1a0808', badgeColor: '#f87171',
      borderColor: '#7f1d1d', headerBg: '#160606',
      steps: [
        { icon: '1️⃣', text: 'Call 112 immediately — say "possible overdose" and give your address' },
        { icon: '2️⃣', text: 'Lay person on back · tilt head back to open airway' },
        { icon: '3️⃣', text: 'Insert Naloxone nasal tip into one nostril and press plunger firmly' },
        { icon: '4️⃣', text: 'If no response in 2–3 min, give second dose in the other nostril' },
        { icon: '5️⃣', text: 'Place in recovery position (on side) to prevent choking' },
      ],
      footer: '⚠️ Naloxone wears off in 30–90 min — stay until paramedics arrive.',
    },
    {
      id: 'first-aid', icon: '🩺', title: 'First Aid Quick Card',
      badge: 'FIRST RESPONSE', badgeBg: '#1e1208', badgeColor: '#fb923c',
      borderColor: '#c2410c', headerBg: '#180e06',
      steps: [
        { icon: '👀', text: 'Check consciousness — call name, tap shoulders firmly' },
        { icon: '🫁', text: 'Check breathing — look for chest rise, listen, feel for airflow' },
        { icon: '📞', text: 'Call 112 if unresponsive or breathing is abnormal or absent' },
        { icon: '🤲', text: 'Begin CPR if trained — 30 chest compressions, 2 rescue breaths' },
      ],
      footer: 'Do NOT leave them alone for any reason until help arrives.',
    },
  ],
  urge: [
    {
      id: 'triggers', icon: '🧠', title: 'Identifying Environmental Triggers',
      badge: 'URGE MANAGEMENT', badgeBg: '#1a1500', badgeColor: '#fbbf24',
      borderColor: '#78350f', headerBg: '#141000',
      steps: [
        { icon: '👁️', text: 'VISUAL: Remove bottles, paraphernalia, or associated items from sight' },
        { icon: '👃', text: 'SMELL: Certain scents trigger cravings — change rooms or open a window' },
        { icon: '🧍', text: 'SOCIAL: People linked to past use — call a sponsor or counsellor instead' },
        { icon: '😔', text: 'EMOTIONAL: Stress, loneliness, boredom are the top 3 triggers — name it' },
        { icon: '🏠', text: 'LOCATION: Leave the triggering environment immediately if you can' },
      ],
      footer: 'Urges peak at ~20 min. The breathing tool bridges this window.',
    },
    {
      id: 'deescalation', icon: '🤝', title: 'De-escalation Protocols for Families',
      badge: 'CAREGIVER GUIDE', badgeBg: '#130a1f', badgeColor: '#c084fc',
      borderColor: '#6b21a8', headerBg: '#0f0716',
      steps: [
        { icon: '🤫', text: 'LOWER YOUR VOICE — speak slowly and calmly. Anxiety is contagious.' },
        { icon: '🧎', text: 'GET TO THEIR LEVEL — sit down with them, do not stand over them' },
        { icon: '🫶', text: 'VALIDATE — say "I can see this is really hard for you right now"' },
        { icon: '🚫', text: 'AVOID — ultimatums, lectures, shame, blame. None of it helps right now.' },
        { icon: '🎯', text: 'FOCUS — one small action: "Let\'s just breathe together for 60 seconds"' },
      ],
      footer: 'Your calm is their anchor. You have this.',
    },
  ],
  safe: [
    {
      id: 'mindfulness', icon: '🌱', title: 'Celebrating Your Progress: Mindfulness Tips',
      badge: 'MILESTONE GUIDE', badgeBg: '#071a0e', badgeColor: '#34d399',
      borderColor: '#14532d', headerBg: '#051208',
      steps: [
        { icon: '🌅', text: 'MORNING ANCHOR: 5 deep breaths before getting out of bed — set your intention' },
        { icon: '📓', text: 'GRATITUDE LOG: Write 3 good things from today that didn\'t involve substances' },
        { icon: '🏃', text: 'MOVEMENT: A 10-min walk releases natural dopamine — reduces cravings' },
        { icon: '🧘', text: 'BODY SCAN: Notice tension, name it, breathe through it. Don\'t fight it.' },
        { icon: '🌙', text: 'EVENING REVIEW: What went well today? Celebrate one thing — every day counts' },
      ],
      footer: '🏆 Every sober day rewires your brain toward lasting recovery.',
    },
    {
      id: 'longterm', icon: '🎯', title: 'Long-Term Recovery Strategies',
      badge: 'SUSTAINED RECOVERY', badgeBg: '#071a17', badgeColor: '#2dd4bf',
      borderColor: '#0f766e', headerBg: '#051210',
      steps: [
        { icon: '👥', text: 'COMMUNITY: Regular AA/NA/SMART Recovery meetings — connection is medicine' },
        { icon: '🏥', text: 'MEDICAL: Monthly check-ins with your MAT provider — medication matters' },
        { icon: '🛡️', text: 'RELAPSE PLAN: Write it down — who to call, what to do. No shame attached.' },
        { icon: '💪', text: 'SELF-EFFICACY: Document every win. Each sober day is proof of your strength.' },
      ],
      footer: 'Recovery is not linear. Every day you choose it is a win.',
    },
  ],
};

interface Props { lastAction: LastAction; }

export default function SafetyGuide({ lastAction }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const cards = CARDS[lastAction] ?? CARDS.idle;

  useEffect(() => { setActiveCard(0); }, [lastAction]);

  const card = cards[activeCard] ?? cards[0];

  const sectionLabels: Record<LastAction, { label: string; color: string; bg: string }> = {
    idle:   { label: 'Getting Started', color: '#93c5fd', bg: '#0c1a2e' },
    crisis: { label: '🔴 Crisis Resources',  color: '#f87171', bg: '#1a0808' },
    urge:   { label: '🌊 Urge Management',   color: '#fbbf24', bg: '#1a1500' },
    safe:   { label: '✅ Recovery Growth',   color: '#34d399', bg: '#071a0e' },
  };
  const sec = sectionLabels[lastAction];

  return (
    <section
      aria-label="Screen 4 — Contextual Safety Guide"
      className="border-t p-4"
      style={{ backgroundColor: '#0f0f0f', borderColor: '#2d1a0a' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#fb923c' }}>
            📚 Screen 4 · Safety Guide
          </p>
          <span className="ai-badge">✦ Contextual</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: sec.bg, color: sec.color, borderColor: sec.color + '40' }}
          aria-live="polite"
        >
          {sec.label}
        </span>
      </div>

      {/* Context explanation */}
      <div
        className="rounded-lg px-3 py-2 border text-xs mb-3"
        style={{ backgroundColor: '#1e1208', borderColor: '#c2410c', color: '#fb923c' }}
      >
        <strong>How GenAI powers this:</strong> Cards change automatically based on the last button pressed.
        Crisis → Naloxone. Urge → Triggers. Safe → Mindfulness. In production, AI generates these for each patient.
      </div>

      {/* Tab buttons */}
      {cards.length > 1 && (
        <div className="flex gap-2 mb-3" role="tablist" aria-label="Safety guide cards">
          {cards.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === activeCard}
              aria-controls={`card-${c.id}`}
              onClick={() => setActiveCard(i)}
              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: i === activeCard ? '#1a1a1a' : '#0f0f0f',
                borderColor: i === activeCard ? card.borderColor : '#2d1a0a',
                color: i === activeCard ? '#f5f0eb' : '#6b5040',
                boxShadow: i === activeCard ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {c.icon} {c.title.split(':')[0].slice(0, 18)}
            </button>
          ))}
        </div>
      )}

      {/* Card */}
      <div
        id={`card-${card.id}`}
        role="tabpanel"
        aria-label={card.title}
        className="rounded-xl border-2 overflow-hidden transition-all duration-300"
        style={{ backgroundColor: '#141414', borderColor: card.borderColor }}
      >
        {/* Card header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{ backgroundColor: card.headerBg, borderColor: card.borderColor }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{card.icon}</span>
            <h3 className="text-sm font-black" style={{ color: '#f5f0eb' }}>{card.title}</h3>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold border whitespace-nowrap"
            style={{ backgroundColor: card.badgeBg, color: card.badgeColor, borderColor: card.borderColor }}
          >
            {card.badge}
          </span>
        </div>

        {/* Steps */}
        <ol className="p-4 flex flex-col gap-2.5" aria-label="Steps">
          {card.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
              <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">{step.icon}</span>
              <span className="leading-snug">{step.text}</span>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t text-xs font-medium italic"
          style={{ backgroundColor: card.headerBg, borderColor: card.borderColor, color: card.badgeColor }}
        >
          {card.footer}
        </div>
      </div>
    </section>
  );
}
