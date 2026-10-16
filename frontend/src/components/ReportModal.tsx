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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(37, 37, 31, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 2200,
        padding: '0'
      }}
      onClick={handleReset}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          background: 'var(--bg-card, #FFFCF6)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          border: '1px solid var(--border-color, #E4DACA)',
          borderBottom: 'none',
          padding: '16px 20px',
          paddingBottom: 'calc(var(--sab, 0px) + 20px)',
          boxShadow: 'var(--shadow-sheet)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sheet-drag-handle" />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color, #E4DACA)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--accent-cyan, #77745B)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
              Report Road Waterlogging
            </h3>
          </div>
          <button
            onClick={handleReset}
            aria-label="Close report form"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #706D62)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submissionResult ? (
          /* Submission Feedback with Trust Engine Score */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                margin: '0 auto',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--risk-low-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={28} color="var(--status-green, #16866A)" />
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
              Report Ingested by Trust Engine
            </h4>

            <div
              style={{
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted, #706D62)' }}>Trust Score:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan, #77745B)' }}>
                  {submissionResult.trust_score} / 100
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted, #706D62)' }}>Verification State:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      submissionResult.state === 'Likely'
                        ? 'var(--risk-moderate, #d97706)'
                        : submissionResult.state === 'Confirmed'
                        ? 'var(--status-green, #16866A)'
                        : 'var(--text-muted, #706D62)'
                  }}
                >
                  {submissionResult.state}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '8px', lineHeight: 1.4 }}>
                ℹ️ Strict Safety Rule: No single report triggers an alert alone. Independent corroboration from a second nearby citizen is required to elevate to Confirmed.
              </div>
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'var(--accent-beige, #77745B)',
                color: '#ffffff',
                padding: '11px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(119, 116, 91, 0.25)'
              }}
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Report Intake Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            {errorMessage && (
              <div
                style={{
                  background: 'var(--risk-severe-bg)',
                  border: '1px solid var(--risk-severe-border)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  color: 'var(--risk-severe)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Location preview */}
            <div
              style={{
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '11.5px',
                color: 'var(--text-muted, #706D62)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Coords: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
              <span style={{ color: 'var(--accent-cyan, #77745B)', fontWeight: 600 }}>Aundh–Baner Corridor</span>
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)', fontWeight: 600 }}>Language:</span>
              {(['mr', 'hi', 'en'] as const).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    background: language === lang ? 'var(--accent-beige, #77745B)' : 'var(--bg-primary, #F5F0E7)',
                    border: language === lang ? '1px solid var(--accent-beige-dark, #4b4836)' : '1px solid var(--border-color, #E4DACA)',
                    color: language === lang ? '#ffffff' : 'var(--text-main, #25251F)',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '11.5px',
                    fontWeight: language === lang ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>

            {/* Description Text Input */}
            <div>
              <label
                style={{
                  fontSize: '12px',
                  color: 'var(--text-main, #25251F)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Water Condition Description:
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. पुलाखाली गुडघाभर पाणी साचले आहे, गाड्या थांबल्यात...'
                    : language === 'hi'
                    ? 'उदा. पुल के नीचे घुटने तक पानी भरा है, गाड़ियां फंसी हैं...'
                    : 'e.g. Knee-deep water under the underpass, vehicles cannot pass...'
                }
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary, #F5F0E7)',
                  border: '1px solid var(--border-color, #E4DACA)',
                  borderRadius: '10px',
                  color: 'var(--text-main, #25251F)',
                  padding: '10px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
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
                background: isListening ? 'var(--risk-severe, #dc2626)' : 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                color: isListening ? '#ffffff' : 'var(--text-main, #25251F)',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Mic size={16} />
              <span>{isListening ? 'Listening (Speak now)...' : 'Record Voice Description'}</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-beige, #77745B)',
                color: '#ffffff',
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 12px rgba(119, 116, 91, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Evaluating Trust Score...' : 'Submit Ground Truth'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
