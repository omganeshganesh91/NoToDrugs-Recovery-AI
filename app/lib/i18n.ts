// ─── UI Label Translations ────────────────────────────────────────────────────
// All visible UI text keyed by Sarvam language code.
// When user picks a language, ALL labels update to that language.

export interface UILabels {
  // Patient Hub
  screenLabel:       string;
  screenSub:         string;
  dayOf:             string;
  recovery:          string;
  statusStable:      string;
  statusStruggling:  string;
  statusCrisis:      string;
  crisisBtn:         string;
  crisisSub:         string;
  urgeBtn:           string;
  urgeSub:           string;
  safeBtn:           string;
  safeSub:           string;
  logCount:          string;
  voiceTitle:        string;
  voiceSub:          string;
  voiceIdle:         string;
  voiceRecording:    string;
  voiceProcessing:   string;
  kw_crisis:         string;
  kw_urge:           string;
  kw_safe:           string;
  loading:           string;
  cameraTitle:       string;
  cameraSub:         string;
  cameraOpen:        string;
  cameraSnap:        string;
  cameraFlip:        string;
  cameraDone:        string;
  cameraRetake:      string;
  aiResponse:        string;
  // Caregiver Panel
  cgScreenLabel:     string;
  cgScreenSub:       string;
  cgAlertStable:     string;
  cgAlertStruggling: string;
  cgAlertCrisis:     string;
  cgScriptTitle:     string;
  cgScriptEmpty:     string;
  cgScriptEmptySub:  string;
  cgCallTitle:       string;
  cgCrisisTitle:     string;
  cgCopy:            string;
  cgCopied:          string;
  cgDay:             string;
  cgLastAction:      string;
  cgNone:            string;
}

const EN: UILabels = {
  screenLabel: 'Screen 1 · Patient Hub',
  screenSub: 'Zero typing · Sarvam AI · All Indian Languages',
  dayOf: 'Day', recovery: 'recovery',
  statusStable: '🟢 Stable', statusStruggling: '🟡 Craving', statusCrisis: '🔴 Crisis!',
  crisisBtn: 'Emergency / Crisis', crisisSub: 'I Need Medical Help Now',
  urgeBtn: 'Heavy Craving', urgeSub: 'Talk Me Down',
  safeBtn: 'I Am Safe', safeSub: 'Log Progress',
  logCount: 'times',
  voiceTitle: '🎤 Sarvam AI Voice', voiceSub: 'Hindi · Tamil · Telugu · all Indian languages',
  voiceIdle: '👆 Click mic · speak · click again to stop',
  voiceRecording: '🔴 Recording… click mic again to stop',
  voiceProcessing: '⏳ Processing your voice…',
  kw_crisis: 'help / madad / bachao',
  kw_urge: 'craving / lalach / nasha',
  kw_safe: 'safe / theek / acha',
  loading: '⏳ Sarvam AI is writing your personalised script…',
  cameraTitle: '📷 Visual Wellness Check',
  cameraSub: 'AI feedback after snapshot · Privacy-first',
  cameraOpen: 'Open Camera · Wellness Check',
  cameraSnap: 'Take Snapshot', cameraFlip: 'Flip', cameraDone: '✅ Done', cameraRetake: '📷 Retake',
  aiResponse: '🤖 AI Wellness Response',
  cgScreenLabel: 'Screen 2 · Caregiver Panel',
  cgScreenSub: 'Live sync with patient · Sarvam AI script',
  cgAlertStable: '✅ All Stable — Patient is stable, no action needed',
  cgAlertStruggling: '⚠️ CRAVING DETECTED — Patient needs your support now',
  cgAlertCrisis: '🚨 ACTIVE CRISIS — Call 112 immediately!',
  cgScriptTitle: '🤖 Sarvam AI Script',
  cgScriptEmpty: 'Waiting for patient…',
  cgScriptEmptySub: 'When patient taps a button, Sarvam AI writes a personalised script here.',
  cgCallTitle: '📞 Emergency Call Dashboard',
  cgCrisisTitle: '⚠️ IMMEDIATE ACTION CHECKLIST',
  cgCopy: '📋 Copy', cgCopied: '✅ Copied!',
  cgDay: 'Day', cgLastAction: 'Last action', cgNone: 'None yet',
};

const HI: UILabels = {
  screenLabel: 'Screen 1 · Patient Hub',
  screenSub: 'Bina typing · Sarvam AI · Sabhi Bhartiya Bhashayen',
  dayOf: 'Din', recovery: 'recovery',
  statusStable: '🟢 Theek Hai', statusStruggling: '🟡 Craving Aayi', statusCrisis: '🔴 Sankat!',
  crisisBtn: 'Aapaat / Sankat', crisisSub: 'Mujhe Abhi Medical Help Chahiye',
  urgeBtn: 'Craving Aayi', urgeSub: 'Mujhe Samjhao',
  safeBtn: 'Main Theek Hoon', safeSub: 'Progress Log Karo',
  logCount: 'baar',
  voiceTitle: '🎤 Sarvam AI Voice', voiceSub: 'Hindi · Tamil · Telugu · sabhi Bhartiya bhashayen',
  voiceIdle: '👆 Mic dabao · bolo · rokne ke liye phir dabao',
  voiceRecording: '🔴 Recording… rokne ke liye mic dobara dabao',
  voiceProcessing: '⏳ Awaaz process ho rahi hai…',
  kw_crisis: 'help / madad / bachao',
  kw_urge: 'craving / lalach / nasha',
  kw_safe: 'safe / theek / acha',
  loading: '⏳ Sarvam AI aapka personalised script likh raha hai…',
  cameraTitle: '📷 Visual Wellness Jaanch',
  cameraSub: 'Snapshot ke baad AI response · Privacy-first',
  cameraOpen: 'Camera Kholo · Wellness Jaanch',
  cameraSnap: 'Snapshot Lo', cameraFlip: 'Paltao', cameraDone: '✅ Ho Gaya', cameraRetake: '📷 Dobara',
  aiResponse: '🤖 AI Wellness Jawab',
  cgScreenLabel: 'Screen 2 · Caregiver Panel',
  cgScreenSub: 'Patient ke saath live sync · Sarvam AI script',
  cgAlertStable: '✅ Sab Theek Hai — Patient stable hai',
  cgAlertStruggling: '⚠️ CRAVING DETECTED — Patient ko abhi aapka saath chahiye',
  cgAlertCrisis: '🚨 SANKAT — Abhi 112 call karein!',
  cgScriptTitle: '🤖 Sarvam AI Script',
  cgScriptEmpty: 'Patient ka intezaar hai…',
  cgScriptEmptySub: 'Jaise hi patient button dabayega, Sarvam AI yahan script likhega.',
  cgCallTitle: '📞 Emergency Call Dashboard',
  cgCrisisTitle: '⚠️ TURANT KARNE WALE KAAM',
  cgCopy: '📋 Copy', cgCopied: '✅ Copy Ho Gaya!',
  cgDay: 'Din', cgLastAction: 'Aakhri action', cgNone: 'Kuch nahi',
};

const TA: UILabels = {
  screenLabel: 'Screen 1 · Patient Hub',
  screenSub: 'Tட்டச்சு இல்லாமல் · Sarvam AI · அனைத்து மொழிகள்',
  dayOf: 'நாள்', recovery: 'மீட்சி',
  statusStable: '🟢 நிலையாக', statusStruggling: '🟡 ஆசை வந்தது', statusCrisis: '🔴 அவசரம்!',
  crisisBtn: 'அவசர நிலை', crisisSub: 'எனக்கு இப்போது மருத்துவ உதவி வேண்டும்',
  urgeBtn: 'ஆசை வந்தது', urgeSub: 'என்னை ஆறுதல்படுத்துங்கள்',
  safeBtn: 'நான் பாதுகாப்பாக இருக்கிறேன்', safeSub: 'முன்னேற்றம் பதிவு செய்',
  logCount: 'முறை',
  voiceTitle: '🎤 Sarvam AI குரல்', voiceSub: 'தமிழ் · ஹிந்தி · தெலுங்கு · அனைத்து மொழிகள்',
  voiceIdle: '👆 mic கிளிக் செய் · பேசு · நிறுத்த மீண்டும் கிளிக்',
  voiceRecording: '🔴 பதிவாகிறது… நிறுத்த mic கிளிக்',
  voiceProcessing: '⏳ குரல் செயலாக்கப்படுகிறது…',
  kw_crisis: 'help / உதவி / காப்பாற்று',
  kw_urge: 'craving / ஆசை / போதை',
  kw_safe: 'safe / பாதுகாப்பு / நலமாக',
  loading: '⏳ Sarvam AI உங்கள் script எழுதுகிறது…',
  cameraTitle: '📷 காட்சி ஆரோக்கிய சோதனை',
  cameraSub: 'AI கருத்து · தனியுரிமை முதல்',
  cameraOpen: 'கேமரா திற · ஆரோக்கிய சோதனை',
  cameraSnap: 'படம் எடு', cameraFlip: 'திருப்பு', cameraDone: '✅ முடிந்தது', cameraRetake: '📷 மீண்டும்',
  aiResponse: '🤖 AI ஆரோக்கிய பதில்',
  cgScreenLabel: 'Screen 2 · Caregiver Panel',
  cgScreenSub: 'நோயாளியுடன் நேரடி · Sarvam AI script',
  cgAlertStable: '✅ எல்லாம் சரி — நோயாளி நிலையாக உள்ளார்',
  cgAlertStruggling: '⚠️ ஆசை கண்டறியப்பட்டது — நோயாளிக்கு உங்கள் ஆதரவு தேவை',
  cgAlertCrisis: '🚨 அவசர நிலை — உடனடியாக 112 அழைக்கவும்!',
  cgScriptTitle: '🤖 Sarvam AI Script',
  cgScriptEmpty: 'நோயாளிக்காக காத்திருக்கிறோம்…',
  cgScriptEmptySub: 'நோயாளி button அழுத்தியவுடன் AI script எழுதும்.',
  cgCallTitle: '📞 அவசர அழைப்பு Dashboard',
  cgCrisisTitle: '⚠️ உடனடி நடவடிக்கை',
  cgCopy: '📋 நகலெடு', cgCopied: '✅ நகலெடுக்கப்பட்டது!',
  cgDay: 'நாள்', cgLastAction: 'கடைசி action', cgNone: 'இல்லை',
};

const TE: UILabels = {
  screenLabel: 'Screen 1 · Patient Hub',
  screenSub: 'టైపింగ్ లేదు · Sarvam AI · అన్ని భాషలు',
  dayOf: 'రోజు', recovery: 'కోలుకోవడం',
  statusStable: '🟢 స్థిరంగా', statusStruggling: '🟡 కోరిక వచ్చింది', statusCrisis: '🔴 అత్యవసరం!',
  crisisBtn: 'అత్యవసర స్థితి', crisisSub: 'నాకు ఇప్పుడు వైద్య సహాయం కావాలి',
  urgeBtn: 'కోరిక వచ్చింది', urgeSub: 'నన్ను సముదాయించండి',
  safeBtn: 'నేను సురక్షితంగా ఉన్నాను', safeSub: 'పురోగతి నమోదు',
  logCount: 'సార్లు',
  voiceTitle: '🎤 Sarvam AI వాయిస్', voiceSub: 'తెలుగు · హిందీ · తమిళం · అన్ని భాషలు',
  voiceIdle: '👆 mic నొక్కండి · మాట్లాడండి · ఆపడానికి మళ్ళీ నొక్కండి',
  voiceRecording: '🔴 రికార్డవుతోంది… ఆపడానికి mic నొక్కండి',
  voiceProcessing: '⏳ వాయిస్ ప్రాసెస్ అవుతోంది…',
  kw_crisis: 'help / సహాయం / రక్షించండి',
  kw_urge: 'craving / కోరిక / వ్యసనం',
  kw_safe: 'safe / సురక్షితం / బాగున్నాను',
  loading: '⏳ Sarvam AI మీ script రాస్తోంది…',
  cameraTitle: '📷 విజువల్ వెల్నెస్ చెక్',
  cameraSub: 'AI స్పందన · గోప్యత మొదటి',
  cameraOpen: 'కెమెరా తెరవండి · వెల్నెస్ చెక్',
  cameraSnap: 'స్నాప్‌షాట్', cameraFlip: 'తిప్పు', cameraDone: '✅ పూర్తయింది', cameraRetake: '📷 మళ్ళీ',
  aiResponse: '🤖 AI వెల్నెస్ స్పందన',
  cgScreenLabel: 'Screen 2 · Caregiver Panel',
  cgScreenSub: 'రోగితో లైవ్ · Sarvam AI script',
  cgAlertStable: '✅ అంతా బాగుంది — రోగి స్థిరంగా ఉన్నారు',
  cgAlertStruggling: '⚠️ కోరిక కనుగొనబడింది — రోగికి మీ మద్దతు కావాలి',
  cgAlertCrisis: '🚨 అత్యవసరం — వెంటనే 112 కి కాల్ చేయండి!',
  cgScriptTitle: '🤖 Sarvam AI Script',
  cgScriptEmpty: 'రోగి కోసం వేచి ఉన్నాం…',
  cgScriptEmptySub: 'రోగి button నొక్కిన తర్వాత AI script రాస్తుంది.',
  cgCallTitle: '📞 అత్యవసర కాల్ Dashboard',
  cgCrisisTitle: '⚠️ తక్షణ చర్య అవసరం',
  cgCopy: '📋 కాపీ', cgCopied: '✅ కాపీ అయింది!',
  cgDay: 'రోజు', cgLastAction: 'చివరి action', cgNone: 'ఏమీ లేదు',
};

const KN: UILabels = {
  ...EN,
  screenLabel: 'Screen 1 · Patient Hub',
  screenSub: 'ಟೈಪಿಂಗ್ ಇಲ್ಲ · Sarvam AI · ಎಲ್ಲ ಭಾಷೆಗಳು',
  dayOf: 'ದಿನ', recovery: 'ಚೇತರಿಕೆ',
  statusStable: '🟢 ಸ್ಥಿರ', statusStruggling: '🟡 ಆಸೆ ಬಂತು', statusCrisis: '🔴 ತುರ್ತು!',
  crisisBtn: 'ತುರ್ತು ಸ್ಥಿತಿ', crisisSub: 'ನನಗೆ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕು',
  urgeBtn: 'ಆಸೆ ಬಂತು', urgeSub: 'ನನ್ನನ್ನು ಸಮಾಧಾನಪಡಿಸಿ',
  safeBtn: 'ನಾನು ಸುರಕ್ಷಿತ', safeSub: 'ಪ್ರಗತಿ ದಾಖಲಿಸಿ',
  loading: '⏳ Sarvam AI ನಿಮ್ಮ script ಬರೆಯುತ್ತಿದೆ…',
};

const ML: UILabels = {
  ...EN,
  dayOf: 'ദിവസം', recovery: 'വീണ്ടെടുക്കൽ',
  statusStable: '🟢 സ്ഥിരം', statusStruggling: '🟡 ആഗ്രഹം വന്നു', statusCrisis: '🔴 അടിയന്തരം!',
  crisisBtn: 'അടിയന്തര സ്ഥിതി', crisisSub: 'എനിക്ക് ഇപ്പോൾ സഹായം വേണം',
  urgeBtn: 'ആഗ്രഹം വന്നു', urgeSub: 'എന്നെ ആശ്വസിപ്പിക്കൂ',
  safeBtn: 'ഞാൻ സുരക്ഷിതൻ', safeSub: 'പുരോഗതി രേഖപ്പെടുത്തൂ',
  loading: '⏳ Sarvam AI നിങ്ങളുടെ script എഴുതുന്നു…',
};

const MR: UILabels = {
  ...HI,
  screenSub: 'टाइपिंग नाही · Sarvam AI · सर्व भारतीय भाषा',
  dayOf: 'दिवस', recovery: 'पुनर्प्राप्ती',
  statusStable: '🟢 ठीक आहे', statusStruggling: '🟡 लालसा आली', statusCrisis: '🔴 संकट!',
  crisisBtn: 'आपत्कालीन', crisisSub: 'मला आत्ता वैद्यकीय मदत हवी',
  urgeBtn: 'लालसा आली', urgeSub: 'मला समजावून सांगा',
  safeBtn: 'मी ठीक आहे', safeSub: 'प्रगती नोंदवा',
  loading: '⏳ Sarvam AI तुमचा script लिहित आहे…',
};

const GU: UILabels = {
  ...HI,
  screenSub: 'ટાઇપ વગર · Sarvam AI · બધી ભારતીય ભાષાઓ',
  dayOf: 'દિવસ', recovery: 'પુનઃપ્રાપ્તિ',
  statusStable: '🟢 ઠીક છે', statusStruggling: '🟡 ઇચ્છા આવી', statusCrisis: '🔴 સંકટ!',
  crisisBtn: 'કટોકટી', crisisSub: 'મને હમણાં તબીબી મદદ જોઈએ',
  urgeBtn: 'ઇચ્છા આવી', urgeSub: 'મને સમજાવો',
  safeBtn: 'હું ઠીક છું', safeSub: 'પ્રગતિ નોંધો',
  loading: '⏳ Sarvam AI તમારી script લખી રહ્યો છે…',
};

const BN: UILabels = {
  ...EN,
  dayOf: 'দিন', recovery: 'পুনরুদ্ধার',
  statusStable: '🟢 ঠিক আছি', statusStruggling: '🟡 চাহিদা এলো', statusCrisis: '🔴 জরুরী!',
  crisisBtn: 'জরুরী অবস্থা', crisisSub: 'আমার এখনই চিকিৎসা দরকার',
  urgeBtn: 'চাহিদা এলো', urgeSub: 'আমাকে বোঝাও',
  safeBtn: 'আমি নিরাপদ', safeSub: 'অগ্রগতি লগ করুন',
  loading: '⏳ Sarvam AI আপনার script লিখছে…',
};

const PA: UILabels = {
  ...HI,
  screenSub: 'ਟਾਈਪਿੰਗ ਨਹੀਂ · Sarvam AI · ਸਾਰੀਆਂ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ',
  dayOf: 'ਦਿਨ', recovery: 'ਸੁਧਾਰ',
  statusStable: '🟢 ਠੀਕ ਹਾਂ', statusStruggling: '🟡 ਇੱਛਾ ਆਈ', statusCrisis: '🔴 ਸੰਕਟ!',
  crisisBtn: 'ਐਮਰਜੈਂਸੀ', crisisSub: 'ਮੈਨੂੰ ਹੁਣੇ ਮਦਦ ਚਾਹੀਦੀ',
  urgeBtn: 'ਇੱਛਾ ਆਈ', urgeSub: 'ਮੈਨੂੰ ਸਮਝਾਓ',
  safeBtn: 'ਮੈਂ ਸੁਰੱਖਿਅਤ ਹਾਂ', safeSub: 'ਤਰੱਕੀ ਦਰਜ ਕਰੋ',
  loading: '⏳ Sarvam AI ਤੁਹਾਡੀ script ਲਿਖ ਰਿਹਾ ਹੈ…',
};

export const UI_TRANSLATIONS: Record<string, UILabels> = {
  'en-IN': EN,
  'hi-IN': HI,
  'ta-IN': TA,
  'te-IN': TE,
  'kn-IN': KN,
  'ml-IN': ML,
  'mr-IN': MR,
  'gu-IN': GU,
  'bn-IN': BN,
  'od-IN': EN, // Odia — fallback to EN until localised
  'pa-IN': PA,
};

export function useUI(languageCode: string): UILabels {
  return UI_TRANSLATIONS[languageCode] ?? UI_TRANSLATIONS['en-IN'];
}
