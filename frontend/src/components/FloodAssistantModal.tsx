import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, Volume2, X } from 'lucide-react';
import axios from 'axios';
import { useAppLanguage, speechLocale, type AppLanguage } from '../language';

interface ChatMessage { role: 'user' | 'assistant'; text: string }
interface Props { isOpen: boolean; onClose: () => void }

const copy: Record<AppLanguage, Record<string, string>> = {
  en: { title: 'Flood Assistant', intro: 'Ask about flood safety, supplies, waterlogging, or the 1–6 hour Pune pilot forecast.', placeholder: 'Ask a flood or water safety question…', send: 'Send', supplies: 'What supplies should I keep ready?', forecast: 'Explain the 1–6 hour forecast', loading: 'Checking flood guidance…', error: 'The assistant could not respond. Please try again.', voice: 'Read aloud', stop: 'Stop reading', speechUnsupported: 'Speech playback is not supported in this browser.', disclaimer: 'Guidance only. Forecasts are estimates, not emergency alerts.', unavailable: 'Forecast summary is temporarily unavailable.' },
  hi: { title: 'बाढ़ सहायक', intro: 'बाढ़ सुरक्षा, ज़रूरी सामान, जलभराव या पुणे के 1–6 घंटे के पायलट पूर्वानुमान के बारे में पूछें।', placeholder: 'बाढ़ या पानी की सुरक्षा से जुड़ा सवाल पूछें…', send: 'भेजें', supplies: 'कौन-सा सामान तैयार रखना चाहिए?', forecast: '1–6 घंटे का पूर्वानुमान समझाएँ', loading: 'बाढ़ संबंधी जानकारी देख रहे हैं…', error: 'सहायक जवाब नहीं दे पाया। फिर से कोशिश करें।', voice: 'आवाज़ में सुनें', stop: 'सुनना रोकें', speechUnsupported: 'इस ब्राउज़र में आवाज़ सुनाने की सुविधा उपलब्ध नहीं है।', disclaimer: 'यह केवल मार्गदर्शन है। पूर्वानुमान अनुमान हैं, आपातकालीन सूचना नहीं।', unavailable: 'पूर्वानुमान सारांश अभी उपलब्ध नहीं है।' },
  mr: { title: 'पूर सहाय्यक', intro: 'पूर सुरक्षा, आवश्यक साहित्य, पाणी साचणे किंवा पुणेच्या 1–6 तासांच्या पायलट अंदाजाबद्दल विचारा.', placeholder: 'पूर किंवा पाणी सुरक्षेबद्दल प्रश्न विचारा…', send: 'पाठवा', supplies: 'कोणते साहित्य तयार ठेवावे?', forecast: '1–6 तासांचा अंदाज समजावून सांगा', loading: 'पूर सुरक्षेची माहिती तपासत आहे…', error: 'सहाय्यक उत्तर देऊ शकला नाही. पुन्हा प्रयत्न करा.', voice: 'आवाजात ऐका', stop: 'ऐकणे थांबवा', speechUnsupported: 'या ब्राउझरमध्ये आवाज वाचन उपलब्ध नाही.', disclaimer: 'हे फक्त मार्गदर्शन आहे. अंदाज हे अनुमान आहेत, आपत्कालीन सूचना नाहीत.', unavailable: 'अंदाजाचा सारांश सध्या उपलब्ध नाही.' },
};

async function getForecastSummary(language: AppLanguage) {
  const localizedClass: Record<AppLanguage, Record<string, string>> = {
    en: { severe: 'severe', high: 'high', moderate: 'moderate', low: 'low', other: 'unclassified' },
    hi: { severe: 'अत्यधिक', high: 'उच्च', moderate: 'मध्यम', low: 'कम', other: 'अवर्गीकृत' },
    mr: { severe: 'तीव्र', high: 'उच्च', moderate: 'मध्यम', low: 'कमी', other: 'अवर्गीकृत' },
  };
  const results = await Promise.all([1, 2, 3, 4, 5, 6].map(async (hour) => {
    const response = await fetch(`/data/pilot/predictions_h${hour}.geojson`);
    if (!response.ok) throw new Error('Forecast data unavailable');
    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];
    const counts: Record<string, number> = { severe: 0, high: 0, moderate: 0, low: 0, other: 0 };
    for (const feature of features) {
      const cls = String(feature?.properties?.risk_class ?? '').toLowerCase();
      if (cls in counts) counts[cls] += 1;
      else counts.other += 1;
    }
    const priority = (cls: string) => cls === 'severe' ? 2 : cls === 'high' ? 1 : 0;
    const priorityFeatures = features
      .filter((feature: any) => priority(String(feature?.properties?.risk_class ?? '').toLowerCase()) > 0)
      .sort((a: any, b: any) => Number(b.properties?.probability ?? 0) - Number(a.properties?.probability ?? 0))
      .slice(0, 3)
      .map((feature: any) => `${String(feature.properties?.road_name ?? 'Unnamed road').slice(0, 100)} (${localizedClass[language][String(feature.properties?.risk_class ?? '').toLowerCase()] ?? String(feature.properties?.risk_class ?? '')}, ${Math.round(Number(feature.properties?.probability ?? 0) * 100)}%)`);
    const timestamps = features.map((feature: any) => String(feature.properties?.generated_at ?? '')).filter(Boolean).sort();
    const dataTimestamp = features.map((feature: any) => String(feature.properties?.rain_data_timestamp ?? '')).filter(Boolean).sort()[0];
    return `+${hour}h: ${features.length} segments; ${localizedClass[language].severe}=${counts.severe}, ${localizedClass[language].high}=${counts.high}, ${localizedClass[language].moderate}=${counts.moderate}, ${localizedClass[language].low}=${counts.low}. Highest flagged roads: ${priorityFeatures.join('; ') || 'none classified high/severe'}. Snapshot generated: ${timestamps[0] ?? 'unknown'}; rainfall input timestamp: ${dataTimestamp || 'unknown'}.`;
  }));
  return `Pune pilot forecast data (static snapshots, not live measurements):\n${results.join('\n')}`;
}

export const FloodAssistantModal: FC<Props> = ({ isOpen, onClose }) => {
  const { language, t } = useAppLanguage();
  const labels = copy[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecastSummary, setForecastSummary] = useState('');
  const [forecastUnavailable, setForecastUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getForecastSummary(language).then((summary) => {
      if (!cancelled) { setForecastSummary(summary); setForecastUnavailable(false); }
    }).catch(() => {
      if (!cancelled) { setForecastSummary(''); setForecastUnavailable(true); }
    });
    return () => { cancelled = true; window.speechSynthesis?.cancel(); };
  }, [isOpen, language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const send = async (text = input) => {
    const question = text.trim();
    if (!question || loading) return;
    const next = [...messages, { role: 'user' as const, text: question }];
    setMessages(next); setInput(''); setError(''); setLoading(true);
    try {
      let context = forecastSummary;
      if (!context && !forecastUnavailable) {
        try {
          context = await getForecastSummary(language);
          setForecastSummary(context);
        } catch {
          setForecastUnavailable(true);
        }
      }
      const { data } = await axios.post('/api/assistant/chat', {
        message: question, language, history: messages.slice(-12), forecast_summary: context,
      });
      setMessages((current) => [...current, { role: 'assistant', text: String(data.answer) }]);
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setError(typeof detail === 'string' ? detail : labels.error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const speak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) { setError(labels.speechUnsupported); return; }
    window.speechSynthesis.cancel();
    if (speakingIndex === index) { setSpeakingIndex(null); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocale(language);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const suggestions = [labels.supplies, labels.forecast];
  return (
    <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(18, 18, 15, 0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <section role="dialog" aria-modal="true" aria-labelledby="flood-assistant-title" style={{ width: 'min(620px, 100%)', height: 'min(760px, 90dvh)', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '22px', background: 'var(--bg-card, #FFFCF6)', color: 'var(--text-main, #25251F)', border: '1px solid var(--border-color, #E4DACA)', boxShadow: '0 22px 70px rgba(0,0,0,.25)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border-color, #E4DACA)' }}>
          <span style={{ width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--accent-beige-light, #E7DDCC)' }}><Bot size={22} /></span>
          <div style={{ flex: 1 }}><h2 id="flood-assistant-title" style={{ margin: 0, fontSize: 19 }}>{t('assistantTitle')}</h2><div style={{ fontSize: 12, color: 'var(--text-muted, #706D62)', marginTop: 3 }}>{language.toUpperCase()}</div></div>
          <button onClick={onClose} aria-label={t('close')} style={{ border: 0, background: 'transparent', color: 'inherit', padding: 8, cursor: 'pointer' }}><X size={21} /></button>
        </header>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 8px' }}>
          {!messages.length && <div style={{ maxWidth: 500, margin: '8px auto', padding: 18, borderRadius: 16, background: 'var(--bg-subtle, #F5F0E7)', color: 'var(--text-muted, #706D62)', lineHeight: 1.55 }}><MessageCircle size={19} style={{ verticalAlign: 'middle', marginRight: 8 }} />{labels.intro}{forecastUnavailable && <div style={{ marginTop: 8, fontSize: 12 }}>{labels.unavailable}</div>}</div>}
          {messages.map((message, index) => <div key={`${index}-${message.role}`} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', margin: '10px 0' }}><div style={{ maxWidth: '88%', padding: '12px 14px', borderRadius: 16, background: message.role === 'user' ? 'var(--accent-beige, #77745B)' : 'var(--bg-subtle, #F5F0E7)', color: message.role === 'user' ? '#fff' : 'var(--text-main, #25251F)', lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.text}{message.role === 'assistant' && <div><button onClick={() => speak(message.text, index)} title={speakingIndex === index ? labels.stop : labels.voice} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 8px', color: 'inherit', border: '1px solid var(--border-color, #E4DACA)', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 12 }}><Volume2 size={15} />{speakingIndex === index ? labels.stop : labels.voice}</button></div>}</div></div>)}
          {loading && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted, #706D62)', padding: 10 }}><LoaderCircle size={16} className="spin" />{labels.loading}</div>}
          {error && <div role="alert" style={{ padding: 10, color: '#B42318', fontSize: 13 }}>{error}</div>}
        </div>
        {!messages.length && <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 16px' }}>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} style={{ flexShrink: 0, padding: '9px 12px', borderRadius: 999, background: 'var(--bg-card, #FFFCF6)', color: 'inherit', border: '1px solid var(--border-color, #E4DACA)', cursor: 'pointer' }}>{suggestion}</button>)}</div>}
        <form onSubmit={(event: FormEvent) => { event.preventDefault(); void send(); }} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border-color, #E4DACA)' }}>
          <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} maxLength={1500} rows={2} placeholder={labels.placeholder} aria-label={labels.placeholder} style={{ flex: 1, resize: 'none', border: '1px solid var(--border-color, #E4DACA)', borderRadius: 14, padding: '11px 13px', font: 'inherit', color: 'inherit', background: 'var(--bg-card, #FFFCF6)' }} />
          <button type="submit" disabled={loading || !input.trim()} aria-label={labels.send} style={{ width: 46, height: 46, flexShrink: 0, border: 0, borderRadius: 14, color: '#fff', background: 'var(--accent-beige, #77745B)', opacity: loading || !input.trim() ? .55 : 1, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}><Send size={18} /></button>
        </form>
        <div style={{ padding: '0 16px 12px', fontSize: 11, color: 'var(--text-muted, #706D62)' }}>{labels.disclaimer}</div>
      </section>
    </div>
  );
};
