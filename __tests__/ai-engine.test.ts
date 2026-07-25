// ─── AI Engine Tests ──────────────────────────────────────────────────────────
// Run with: npx jest  OR  node --experimental-vm-modules node_modules/.bin/jest

import { generateAIScript, MOCK_PATIENTS } from '../app/lib/ai-engine';

const patient = MOCK_PATIENTS[0];

describe('generateAIScript', () => {
  it('returns a non-empty string for crisis action', () => {
    const script = generateAIScript('crisis', patient);
    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(50);
  });

  it('contains patient name in crisis script', () => {
    const script = generateAIScript('crisis', patient);
    expect(script).toContain(patient.name);
  });

  it('returns a non-empty string for urge action', () => {
    const script = generateAIScript('urge', patient);
    expect(script.length).toBeGreaterThan(50);
  });

  it('returns a non-empty string for safe action', () => {
    const script = generateAIScript('safe', patient);
    expect(script.length).toBeGreaterThan(50);
  });

  it('returns empty string for idle action', () => {
    const script = generateAIScript('idle', patient);
    expect(script).toBe('');
  });

  it('sanitizes XSS in patient name', () => {
    const xssPatient = { ...patient, name: '<script>alert("xss")</script>' };
    const script = generateAIScript('crisis', xssPatient);
    expect(script).not.toContain('<script>');
    expect(script).toContain('&lt;script&gt;');
  });

  it('produces deterministic output for same soberDays', () => {
    const a = generateAIScript('urge', patient);
    const b = generateAIScript('urge', patient);
    expect(a).toBe(b);
  });

  it('produces different scripts for different patient profiles', () => {
    const patientA = { ...patient, soberDays: 0 };
    const patientB = { ...patient, soberDays: 1 };
    // With 2 scripts, 0 % 2 == 0, 1 % 2 == 1 — different scripts
    const a = generateAIScript('urge', patientA);
    const b = generateAIScript('urge', patientB);
    expect(a).not.toBe(b);
  });

  it('includes soberDays in safe script', () => {
    const script = generateAIScript('safe', patient);
    expect(script).toContain(String(patient.soberDays));
  });
});
