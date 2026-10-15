import { useState, type FC } from 'react';
import axios from 'axios';
import { X, MapPin, Mic, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
  defaultCoords: { lat: number; lon: number };
}

export const ReportModal: FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
  defaultCoords
}) => {
  const [lat] = useState<number>(defaultCoords.lat || 18.574);
  const [lon] = useState<number>(defaultCoords.lon || 73.806);
  const [text, setText] = useState<string>('');
  const [language, setLanguage] = useState<string>('mr');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Browser-native Web Speech API voice input
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please type your report.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'mr' ? 'mr-IN' : (language === 'hi' ? 'hi-IN' : 'en-IN');
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMessage('Please describe the water condition.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        lat,
        lon,
        text,
        language,
        reporter_id: 'citizen_' + Math.random().toString(36).substring(2, 9)
      };

      const res = await axios.post('/api/reports', payload);
      setSubmissionResult(res.data);
      onReportSubmitted();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to submit report. Please verify coordinates are on a road.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setText('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '480px',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-widget)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              Report Road Waterlogging
            </h3>
          </div>
          <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {submissionResult ? (
          /* Submission Feedback with Trust Engine Score */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '12px 0' }}>
            <div style={{ margin: '0 auto', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--risk-low-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} color="var(--risk-low)" />
            </div>
            <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              Report Ingested by Trust Engine
            </h4>
            <div style={{ background: 'var(--bg-pill)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trust Score:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{submissionResult.trust_score} / 100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verification State:</span>
                <span style={{
                  fontWeight: 700,
                  color: submissionResult.state === 'Likely' ? 'var(--risk-moderate)' : (submissionResult.state === 'Confirmed' ? 'var(--risk-low)' : 'var(--text-muted)')
                }}>
                  {submissionResult.state}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                ℹ️ Strict Safety Rule: No single report triggers an alert alone. Independent corroboration from a second nearby citizen is required to elevate to Likely/Confirmed.
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'linear-gradient(135deg, #b8905e, #8f6738)',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(143, 103, 56, 0.35)'
              }}
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Report Intake Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMessage && (
              <div style={{ background: 'var(--risk-severe-bg)', border: '1px solid var(--risk-severe)', borderRadius: '8px', padding: '10px', fontSize: '12px', color: 'var(--risk-severe)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Coordinates / Road Snap preview */}
            <div style={{ background: 'var(--bg-pill)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Location: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Pune Pilot Corridor</span>
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #735d47)' }}>Language:</span>
              {(['mr', 'hi', 'en'] as const).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    background: language === lang ? 'linear-gradient(135deg, #b8905e, #8f6738)' : 'var(--bg-widget, #fdfcf9)',
                    border: language === lang ? '1px solid #7a5022' : '1px solid var(--border-color, #e5dcce)',
                    color: language === lang ? '#fff' : 'var(--text-main, #2e2214)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: language === lang ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'mr' ? 'मराठी' : (lang === 'hi' ? 'हिंदी' : 'English')}
                </button>
              ))}
            </div>

            {/* Description Text Input */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-main, #2e2214)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Water Condition Description:
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. पुलाखाली गुडघाभर पाणी साचले आहे, गाड्या थांबल्यात...' : 'e.g. Knee-deep water under the flyover, vehicles cannot pass...'}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--bg-widget, #fdfcf9)',
                  border: '1px solid var(--border-color, #e5dcce)',
                  borderRadius: '8px',
                  color: 'var(--text-main, #2e2214)',
                  padding: '10px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: isListening ? '#ef4444' : 'var(--bg-widget, #fdfcf9)',
                border: '1px solid var(--border-color, #e5dcce)',
                color: isListening ? '#ffffff' : 'var(--text-main, #2e2214)',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Mic size={16} />
              <span>{isListening ? 'Listening (Speak now)...' : 'Speak Note (Voice Input)'}</span>
            </button>

            {/* Submit Button in Warm Camel/Beige */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #b8905e, #8f6738)',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(143, 103, 56, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Submitting to Trust Engine...' : 'Submit Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
