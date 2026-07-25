'use client';
// ─── Urge Tracker — pulls history from Neon DB ────────────────────────────────
// Shows a live timeline of every urge/crisis/safe event for the caregiver.
// Refreshes automatically when new events are logged.

import React, { useEffect, useState, useCallback } from 'react';
import { UrgeEvent } from '../lib/db';

interface Props {
  patientId: string;
  refreshTrigger: number; // increment to force refresh
}

const eventStyle = {
  crisis:  { bg: '#fff1f2', border: '#fca5a5', color: '#991b1b', icon: '🆘' },
  urge:    { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '🌊' },
  safe:    { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '✅' },
};

export default function UrgeTracker({ patientId, refreshTrigger }: Props) {
  const [events, setEvents]   = useState<UrgeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchHistory = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/history?patientId=${encodeURIComponent(patientId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load history');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory, refreshTrigger]);

  const summary = {
    crisis: events.filter((e) => e.event_type === 'crisis').length,
    urge:   events.filter((e) => e.event_type === 'urge').length,
    safe:   events.filter((e) => e.event_type === 'safe').length,
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: '#ffffff', borderColor: '#e8d5c4' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#7c3aed' }}>
            📊 Urge Tracker · Neon DB
          </p>
          <span className="text-xs ai-badge">✦ Live</span>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="text-xs px-2 py-1 rounded-lg border font-medium focus:outline-none focus:ring-2"
          style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' }}
          aria-label="Refresh event history"
        >
          {loading ? '⏳' : '↺ Refresh'}
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 mb-3">
        {(['crisis', 'urge', 'safe'] as const).map((type) => {
          const s = eventStyle[type];
          return (
            <div
              key={type}
              className="flex-1 rounded-lg border px-2 py-1.5 text-center"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            >
              <p className="text-lg font-black" style={{ color: s.color }}>
                {summary[type]}
              </p>
              <p className="text-xs capitalize font-medium" style={{ color: s.color }}>
                {s.icon} {type}
              </p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      {error && (
        <p className="text-xs text-center py-2" style={{ color: '#dc2626' }}>
          {error} — check DATABASE_URL env variable
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-xs text-center py-3" style={{ color: '#a8a29e' }}>
          No events yet — start using the platform to build your history
        </p>
      )}

      {events.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {events.map((ev) => {
            const s = eventStyle[ev.event_type];
            const time = new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = new Date(ev.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
            return (
              <div
                key={ev.id}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs"
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <span aria-hidden="true">{s.icon}</span>
                <span className="font-semibold capitalize" style={{ color: s.color }}>
                  {ev.event_type}
                </span>
                <span style={{ color: '#78716c' }}>·</span>
                <span style={{ color: '#78716c' }}>Day {ev.sober_days}</span>
                <span style={{ color: '#78716c' }}>·</span>
                <span style={{ color: '#78716c' }}>{ev.language}</span>
                <span className="ml-auto font-mono text-xs" style={{ color: s.color, opacity: 0.7 }}>
                  {date} {time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
