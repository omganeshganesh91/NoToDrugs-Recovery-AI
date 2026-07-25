// ─── Sarvam AI Client ─────────────────────────────────────────────────────────
// REST wrapper for Sarvam's Speech-to-Text, Text-to-Speech, Translation,
// and Chat Completion APIs.
// Docs: https://docs.sarvam.ai/api-reference

const SARVAM_BASE = 'https://api.sarvam.ai';

function sarvamHeaders() {
  return {
    'api-subscription-key': process.env.SARVAM_API_KEY ?? '',
  };
}

// ── Language map ─────────────────────────────────────────────────────────────
// Sarvam language codes for Indian languages + English
export const SUPPORTED_LANGUAGES: Record<string, string> = {
  'en-IN': 'English (India)',
  'hi-IN': 'Hindi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'mr-IN': 'Marathi',
  'gu-IN': 'Gujarati',
  'bn-IN': 'Bengali',
  'od-IN': 'Odia',
  'pa-IN': 'Punjabi',
};

// ── Speech to Text ────────────────────────────────────────────────────────────
/**
 * Transcribe audio blob using Sarvam Saaras STT.
 * Accepts any Indian language + English audio.
 * Returns transcript + detected language code.
 */
export async function sarvamTranscribe(
  audioBlob: Blob,
  languageCode = 'unknown'
): Promise<{ transcript: string; languageCode: string }> {
  const fallback = {
    transcript: '',
    languageCode: languageCode && languageCode !== 'unknown' ? languageCode : 'en-IN',
  };

  const apiKey = process.env.SARVAM_API_KEY ?? '';
  if (!apiKey || apiKey.includes('your_sarvam_api_key_here')) {
    return fallback;
  }

  const form = new FormData();
  form.append('file', audioBlob, 'audio.webm');
  form.append('model', 'saarika:v2');
  // Only append language_code when a valid known code is provided.
  // Sending 'unknown' causes a 400 from Sarvam's API.
  const validCode = languageCode && languageCode !== 'unknown' ? languageCode : null;
  if (validCode) {
    form.append('language_code', validCode);
  }
  form.append('with_timestamps', 'false');

  try {
    const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
      method: 'POST',
      headers: sarvamHeaders(),
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('Sarvam STT unavailable, using browser fallback.', err);
      return fallback;
    }

    const data = await res.json();
    return {
      transcript: String(data.transcript ?? '').trim(),
      languageCode: String(data.language_code ?? data.languageCode ?? fallback.languageCode),
    };
  } catch (err) {
    console.warn('Sarvam STT request failed.', err);
    return fallback;
  }
}

// ── Text to Speech ────────────────────────────────────────────────────────────
/**
 * Convert text to speech using Sarvam Bulbul TTS.
 * Returns base64-encoded WAV audio.
 */
export async function sarvamTTS(
  text: string,
  languageCode = 'en-IN',
  speaker = 'meera'
): Promise<string> {
  const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
    method: 'POST',
    headers: {
      ...sarvamHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [text.slice(0, 500)], // Bulbul max per call
      target_language_code: languageCode,
      speaker,
      model: 'bulbul:v2',
      pace: 0.85,
      loudness: 1.2,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sarvam TTS error ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Returns array of base64 audio chunks
  return (data.audios?.[0] as string) ?? '';
}

// ── Translation ───────────────────────────────────────────────────────────────
/**
 * Translate text to the target Indian language using Sarvam Mayura.
 */
export async function sarvamTranslate(
  text: string,
  targetLanguageCode: string,
  sourceLanguageCode = 'en-IN'
): Promise<string> {
  if (targetLanguageCode === sourceLanguageCode || targetLanguageCode === 'en-IN') {
    return text;
  }

  const res = await fetch(`${SARVAM_BASE}/translate`, {
    method: 'POST',
    headers: {
      ...sarvamHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      source_language_code: sourceLanguageCode,
      target_language_code: targetLanguageCode,
      model: 'mayura:v1',
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) return text; // fallback to original
  const data = await res.json();
  return data.translated_text ?? text;
}

// ── Chat Completion (AI Script generation via Sarvam 30B) ────────────────────
/**
 * Generate a personalised caregiver script using Sarvam-30B.
 * Falls back to the local template engine if API key is not set.
 */
export async function sarvamChat(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetch(`${SARVAM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      ...sarvamHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sarvam-m',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`Sarvam Chat error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
