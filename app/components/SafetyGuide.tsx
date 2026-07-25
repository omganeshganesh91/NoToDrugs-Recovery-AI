'use client';
// ─── Screen 4: Contextual Safety Guide ───────────────────────────────────────
import React, { useState, useRef } from 'react';
import { LastAction } from '../types';

interface SafetyCard {
  id: string;
  icon: string;
  title: string;
  badge: string;
  badgeColor: string;
  steps: { icon: string; text: string }[];
  footer: string;
}

const CARDS: Record<LastAction, SafetyCard[]> = {
  idle: [
    {
      id: 'welcome',
      icon: '💙',
      title: 'Welcome to Your Recovery Hub',
      badge: 'Getting Started',
      badgeColor: 'bg-blue-900 text-blue-300',
      steps: [
        { icon: '🔴', text: 'Press the Emergency button if you need immediate medical help' },
        { icon: '🌊', text: 'Press the Craving button to open the breathing & grounding tools' },
        { icon: '✅', text: 'Press Safe to log your progress and celebrate your sobriety' },
        { icon: '🎤', text: 'Hold the mic and say a keyword for hands-free activation' },
      ],
      footer: 'You are not alone. Help is always here.',
    },
  ],
  crisis: [
    {
      id: 'naloxone',
      icon: '💊',
      title: 'How to Administer Naloxone (Narcan)',
      badge: 'EMERGENCY GUIDE',
      badgeColor: 'bg-red-900 text-red-300',
      steps: [
        { icon: '1️⃣', text: 'Call 911 immediately — tell them the location and "possible overdose"' },
        { icon: '2️⃣', text: 'Lay the person on their back. Tilt head back to open airway.' },
        { icon: '3️⃣', text: 'Insert Naloxone nasal tip into one nostril and press plunger firmly.' },
        { icon: '4️⃣', text: 'If no response in 2–3 min, give second dose in other nostril.' },
        { icon: '5️⃣', text: 'Place in recovery position (on side) to prevent choking.' },
      ],
      footer: '⚠️ Naloxone wears off in 30–90 min. Stay until paramedics arrive.',
    },
    {
      id: 'first-aid',
      icon: '🩺',
      title: 'First Aid Quick Card',
      badge: 'FIRST RESPONSE',
      badgeColor: 'bg-orange-900 text-orange-300',
      steps: [
        { icon: '👀', text: 'Check consciousness — call their name, tap shoulders' },
        { icon: '🫁', text: 'Check breathing — look for chest rise, listen, feel for air' },
        { icon: '📞', text: 'Call 911 if unresponsive or breathing is abnormal' },
        { icon: '🤲', text: 'Start CPR if trained and no breathing detected (30 compressions, 2 breaths)' },
      ],
      footer: 'Do NOT leave them alone until help arrives.',
    },
  ],
  urge: [
    {
      id: 'triggers',
      icon: '🧠',
      title: 'Identifying Environmental Triggers',
      badge: 'URGE MANAGEMENT',
      badgeColor: 'bg-yellow-900 text-yellow-300',
      steps: [
        { icon: '👁️', text: 'VISUAL: Remove bottles, paraphernalia, or associated objects from view' },
        { icon: '👃', text: 'SMELL: Certain scents can trigger cravings — change rooms or open windows' },
        { icon: '🧍', text: 'SOCIAL: Avoid people associated with past use — call a sponsor instead' },
        { icon: '😔', text: 'EMOTIONAL: Stress, loneliness, and boredom are top triggers — name the feeling' },
        { icon: '🏠', text: 'LOCATION: Leave the triggering environment immediately if possible' },
      ],
      footer: 'Urges peak at ~20 min. Use the breathing tool to ride it out.',
    },
    {
      id: 'deescalation',
      icon: '🤝',
      title: 'De-escalation Protocols for Families',
      badge: 'CAREGIVER GUIDE',
      badgeColor: 'bg-purple-900 text-purple-300',
      steps: [
        { icon: '🤫', text: 'LOWER VOICE: Speak slowly and calmly — anxiety is contagious' },
        { icon: '🧎', text: 'GET LEVEL: Sit down with them — do not stand over them' },
        { icon: '🫶', text: 'VALIDATE: Say "I can see this is really hard right now"' },
        { icon: '🚫', text: 'AVOID: Ultimatums, lectures, blame, shame — none of it helps right now' },
        { icon: '🎯', text: 'FOCUS: One small action at a time — "Let\'s just breathe for one minute"' },
      ],
      footer: 'Your calm is their anchor. You can do this.',
    },
  ],
  safe: [
    {
      id: 'mindfulness',
      icon: '🌱',
      title: 'Celebrating 7 Days: Mindfulness for Recovery',
      badge: 'MILESTONE GUIDE',
      badgeColor: 'bg-emerald-900 text-emerald-300',
      steps: [
        { icon: '🌅', text: 'MORNING ANCHOR: 5 deep breaths before getting out of bed — set your intention' },
        { icon: '📓', text: 'GRATITUDE LOG: Write 3 things that didn\'t involve substances today' },
        { icon: '🏃', text: 'MOVEMENT: 10 min walk releases dopamine naturally — reduces cravings' },
        { icon: '🧘', text: 'BODY SCAN: Notice tension, name it, breathe through it — don\'t fight it' },
        { icon: '🌙', text: 'EVENING REVIEW: What went well today? Celebrate that — every day counts' },
      ],
      footer: '🏆 Every sober day rewires your brain toward lasting recovery.',
    },
    {
      id: 'longterm',
      icon: '🎯',
      title: 'Long-Term Recovery Strategies',
      badge: 'SUSTAINED RECOVERY',
      badgeColor: 'bg-teal-900 text-teal-300',
      steps: [
        { icon: '👥', text: 'COMMUNITY: Regular AA/NA meetings or SMART Recovery — connection is medicine' },
        { icon: '🏥', text: 'MEDICAL: Schedule monthly check-ins with your MAT provider' },
        { icon: '🛡️', text: 'RELAPSE PLAN: Have a written plan — who to call, what to do, no judgment' },
        { icon: '💪', text: 'SELF-EFFICACY: Document wins — every sober day is evidence of your strength' },
      ],
      footer: 'Recovery is not linear — every day you choose it is a win.',
    },
  ],
};

interface Props {
  lastAction: LastAction;
}

export default function SafetyGuide({ lastAction }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const cardsForAction = CARDS[lastAction] ?? CARDS.idle;

  // Reset card index when action changes
  React.useEffect(() => {
    setActiveCard(0);
  }, [lastAction]);

  const card = cardsForAction[activeCard] ?? cardsForAction[0];

  const actionLabel: Record<LastAction, string> = {
    idle: 'Getting Started',
    crisis: '🔴 Crisis Resources',
    urge: '🌊 Urge Management',
    safe: '✅ Recovery Growth',
  };

  return (
    <section
      aria-label="Contextual Safety Guide"
      className="bg-slate-900 border-t border-slate-700 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span aria-hidden="true">📚</span> Safety Guide
        </h2>
        <span className="text-xs text-slate-500 font-medium" aria-live="polite">
          {actionLabel[lastAction]}
        </span>
      </div>

      {/* Carousel nav tabs */}
      {cardsForAction.length > 1 && (
        <div className="flex gap-2 mb-3" role="tablist" aria-label="Safety guide cards">
          {cardsForAction.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === activeCard}
              aria-controls={`card-${c.id}`}
              onClick={() => setActiveCard(i)}
              className={`
                flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-400
                ${i === activeCard
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-500 hover:bg-slate-800'
                }
              `}
            >
              {c.icon} {c.title.split(':')[0].slice(0, 20)}
            </button>
          ))}
        </div>
      )}

      {/* Card content */}
      <div
        id={`card-${card.id}`}
        role="tabpanel"
        aria-label={card.title}
        className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{card.icon}</span>
            <h3 className="text-sm font-bold text-white leading-tight">{card.title}</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${card.badgeColor}`}>
            {card.badge}
          </span>
        </div>

        {/* Steps — horizontal scroll on small screens */}
        <ol className="grid gap-2" aria-label="Steps">
          {card.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">{step.icon}</span>
              <span className="leading-snug">{step.text}</span>
            </li>
          ))}
        </ol>

        <p className="mt-3 text-xs text-slate-400 italic border-t border-slate-700 pt-3">
          {card.footer}
        </p>
      </div>
    </section>
  );
}
