import { createContext, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

export type AppLanguage = 'en' | 'hi' | 'mr';
const languageNames: Record<AppLanguage, string> = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
const locale: Record<AppLanguage, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

const messages: Record<AppLanguage, Record<string, string>> = {
  en: {
    safety: 'Decision-support prototype, not an official emergency service. In emergencies, contact official emergency services.', dismiss: 'Dismiss safety notice',
    map: 'Early-Warning Map', accuracy: 'Model Accuracy', data: 'Data & Limitations', notifications: 'Notifications', enableAlerts: 'Enable alerts',
    adminNotifications: 'Admin notification center', navigation: 'Navigation', home: 'Home / Overview', accuracyTrust: 'Model Accuracy & Trust',
    adminSandbox: 'Admin & Sandbox', replay: 'Historical Replay', pilot: 'Pune Municipal Corridor Pilot', darkTheme: 'Switch to Dark Theme', lightTheme: 'Switch to Light Theme',
    inboxEmpty: 'No notifications yet.', closeNotifications: 'Close notifications', speak: 'Read notification aloud', stop: 'Stop reading', language: 'Language',
    mapTab: 'Map', report: 'Report', routes: 'Routes', rain: 'Rain', admin: 'Admin', subscribed: 'This device is subscribed to JalDrishti updates.',
    pushError: 'Could not enable notifications.', speechUnsupported: 'Speech playback is not supported in this browser.',
    search: 'Search roads or locations in Pune', noMatches: 'No matching road or location found in pilot corridor',
    rainfall: 'Live Rainfall', risk: 'Waterlogging Risk', riskLevels: 'Waterlogging Risk Levels', riskLegend: 'Risk legend',
    severe: 'Severe', high: 'High', moderate: 'Moderate', low: 'Low', noRisk: 'No significant risk',
    severeDesc: 'Likely road inundation >15cm', highDesc: 'Significant water accumulation risk', moderateDesc: 'Partial waterlogging / slow traffic', lowDesc: 'Passable, minimal predicted pooling', dryDesc: 'Dry / normal road conditions',
    events: 'Events', details: 'Details', hide: 'Hide', forecast: 'Forecast Overview', highRiskCorridor: 'High Risk Corridor', localizedWaterlogging: 'Localized Waterlogging', minimalInundation: 'Minimal Inundation', severeHigh: 'Severe / High', moderateRisk: 'Moderate Risk', radarAge: 'IMD Radar Age', segments: 'segments', ago: 'ago', settings: 'Settings', appearance: 'Appearance', close: 'Close',
  },
  hi: {
    safety: 'यह निर्णय-सहायता प्रोटोटाइप है, आधिकारिक आपातकालीन सेवा नहीं। आपात स्थिति में आधिकारिक आपातकालीन सेवाओं से संपर्क करें।', dismiss: 'सुरक्षा सूचना हटाएँ',
    map: 'बाढ़ पूर्व चेतावनी मानचित्र', accuracy: 'मॉडल की सटीकता', data: 'डेटा और सीमाएँ', notifications: 'सूचनाएँ', enableAlerts: 'सूचनाएँ चालू करें',
    adminNotifications: 'व्यवस्थापक सूचना केंद्र', navigation: 'नेविगेशन', home: 'होम / अवलोकन', accuracyTrust: 'मॉडल सटीकता और भरोसा',
    adminSandbox: 'व्यवस्थापक और सैंडबॉक्स', replay: 'ऐतिहासिक पूर्वावलोकन', pilot: 'पुणे नगर गलियारा पायलट', darkTheme: 'डार्क थीम चालू करें', lightTheme: 'लाइट थीम चालू करें',
    inboxEmpty: 'अभी कोई सूचना नहीं है।', closeNotifications: 'सूचनाएँ बंद करें', speak: 'सूचना सुनें', stop: 'पढ़ना रोकें', language: 'भाषा',
    mapTab: 'मानचित्र', report: 'रिपोर्ट', routes: 'मार्ग', rain: 'बारिश', admin: 'व्यवस्थापक', subscribed: 'यह डिवाइस JalDrishti अपडेट के लिए सदस्य है।',
    pushError: 'सूचनाएँ चालू नहीं हो सकीं।', speechUnsupported: 'इस ब्राउज़र में आवाज़ सुनाने की सुविधा उपलब्ध नहीं है।',
    search: 'पुणे में सड़कें या स्थान खोजें', noMatches: 'पायलट क्षेत्र में सड़क या स्थान नहीं मिला',
    rainfall: 'वर्तमान बारिश', risk: 'जलभराव का जोखिम', riskLevels: 'जलभराव के जोखिम के स्तर', riskLegend: 'जोखिम संकेत',
    severe: 'अत्यधिक', high: 'उच्च', moderate: 'मध्यम', low: 'कम', noRisk: 'कोई खास जोखिम नहीं',
    severeDesc: 'सड़क पर 15 सेमी से अधिक पानी भरने की आशंका', highDesc: 'पानी जमा होने का अधिक जोखिम', moderateDesc: 'आंशिक जलभराव / धीमा यातायात', lowDesc: 'रास्ता चलने योग्य, कम पानी जमा होने की आशंका', dryDesc: 'सूखी / सामान्य सड़क स्थिति',
    events: 'घटनाएँ', details: 'विवरण', hide: 'छिपाएँ', forecast: 'पूर्वानुमान सारांश', highRiskCorridor: 'उच्च जोखिम गलियारा', localizedWaterlogging: 'स्थानीय जलभराव', minimalInundation: 'न्यूनतम जलभराव', severeHigh: 'अत्यधिक / उच्च', moderateRisk: 'मध्यम जोखिम', radarAge: 'IMD रडार की आयु', segments: 'खंड', ago: 'पहले', settings: 'सेटिंग्स', appearance: 'रूप', close: 'बंद करें',
  },
  mr: {
    safety: 'हे निर्णय-सहाय्य प्रोटोटाइप आहे, अधिकृत आपत्कालीन सेवा नाही. आपत्कालीन परिस्थितीत अधिकृत सेवांशी संपर्क साधा.', dismiss: 'सुरक्षा सूचना बंद करा',
    map: 'पूर पूर्वसूचना नकाशा', accuracy: 'मॉडेलची अचूकता', data: 'माहिती आणि मर्यादा', notifications: 'सूचना', enableAlerts: 'सूचना सुरू करा',
    adminNotifications: 'प्रशासक सूचना केंद्र', navigation: 'नेव्हिगेशन', home: 'मुख्यपृष्ठ / आढावा', accuracyTrust: 'मॉडेल अचूकता आणि विश्वास',
    adminSandbox: 'प्रशासक आणि सॅन्डबॉक्स', replay: 'ऐतिहासिक पुनरावलोकन', pilot: 'पुणे महानगर कॉरिडॉर पायलट', darkTheme: 'डार्क थीम सुरू करा', lightTheme: 'लाइट थीम सुरू करा',
    inboxEmpty: 'अद्याप कोणतीही सूचना नाही.', closeNotifications: 'सूचना बंद करा', speak: 'सूचना ऐका', stop: 'वाचन थांबवा', language: 'भाषा',
    mapTab: 'नकाशा', report: 'अहवाल', routes: 'मार्ग', rain: 'पाऊस', admin: 'प्रशासक', subscribed: 'हे डिव्हाइस JalDrishti अपडेटसाठी सदस्य झाले आहे.',
    pushError: 'सूचना सुरू करता आल्या नाहीत.', speechUnsupported: 'या ब्राउझरमध्ये आवाज वाचन उपलब्ध नाही.',
    search: 'पुण्यातील रस्ते किंवा ठिकाणे शोधा', noMatches: 'पायलट क्षेत्रात रस्ता किंवा ठिकाण सापडले नाही',
    rainfall: 'सध्याचा पाऊस', risk: 'पाणी साचण्याचा धोका', riskLevels: 'पाणी साचण्याच्या धोक्याचे स्तर', riskLegend: 'धोका दर्शक',
    severe: 'तीव्र', high: 'उच्च', moderate: 'मध्यम', low: 'कमी', noRisk: 'लक्षणीय धोका नाही',
    severeDesc: 'रस्त्यावर १५ सेमीपेक्षा जास्त पाणी साचण्याची शक्यता', highDesc: 'पाणी साचण्याचा मोठा धोका', moderateDesc: 'अंशतः पाणी साचणे / मंद वाहतूक', lowDesc: 'रस्ता वापरण्यायोग्य, कमी पाणी साचण्याची शक्यता', dryDesc: 'कोरडी / सामान्य रस्त्याची स्थिती',
    events: 'घटना', details: 'तपशील', hide: 'लपवा', forecast: 'अंदाजाचा आढावा', highRiskCorridor: 'उच्च धोका क्षेत्र', localizedWaterlogging: 'स्थानिक पाणी साचणे', minimalInundation: 'किमान पाणी साचणे', severeHigh: 'तीव्र / उच्च', moderateRisk: 'मध्यम धोका', radarAge: 'IMD रडारचे वय', segments: 'भाग', ago: 'पूर्वी', settings: 'सेटिंग्ज', appearance: 'दिसणे', close: 'बंद करा',
  },
};

interface LanguageContextValue { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: string) => string }
const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('jaldrishti_language');
    return saved === 'hi' || saved === 'mr' ? saved : 'en';
  });
  const setLanguage = (next: AppLanguage) => setLanguageState(next);
  useEffect(() => {
    localStorage.setItem('jaldrishti_language', language);
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => messages[language][key] ?? messages.en[key] ?? key }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useAppLanguage = () => {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useAppLanguage must be used inside LanguageProvider');
  return value;
};

export const languageOptions = Object.entries(languageNames) as [AppLanguage, string][];
export const speechLocale = (language: AppLanguage) => locale[language];
