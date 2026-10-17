import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import { X, MapPin, Mic, Send, AlertCircle, CheckCircle2, Camera, ImagePlus, Trash2, WifiOff } from 'lucide-react';
import { saveOfflineReport } from '../utils/offlineStorage';

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const selectPhoto = (file?: File) => {
    setErrorMessage(null);
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Photo must be 8 MB or smaller.');
      return;
    }
    setPhoto(file);
  };

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMessage('Please describe the water condition.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const reporterId = 'citizen_' + Math.random().toString(36).substring(2, 9);

    try {
      if (!navigator.onLine) {
        throw new Error('Device is offline');
      }

      let res;
      if (photo) {
        const payload = new FormData();
        payload.append('lat', String(lat));
        payload.append('lon', String(lon));
        payload.append('text', text);
        payload.append('language', language);
        payload.append('reporter_id', reporterId);
        payload.append('photo', photo);
        res = await axios.post('/api/reports/with-photo', payload);
      } else {
        res = await axios.post('/api/reports', {
          lat, lon, text, language, reporter_id: reporterId
        });
      }
      setSubmissionResult(res.data);
      onReportSubmitted();
    } catch {
      // Offline fallback: save report locally in IndexedDB
      try {
        let photoBase64: string | undefined;
        if (photo) {
          photoBase64 = await fileToBase64(photo);
        }
        await saveOfflineReport({
          lat,
          lon,
          text,
          language,
          photoBase64
        });

        setSubmissionResult({
          offline_saved: true,
          trust_score: 85,
          state: 'Pending Sync',
          message: 'Saved offline to your device storage. It will automatically synchronize when network is restored.',
          report_id: `offline_${Date.now()}`
        });
        onReportSubmitted();
      } catch (offlineErr: any) {
        setErrorMessage(offlineErr.message || 'Failed to save report offline.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setText('');
    setPhoto(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div
        className="modal-dialog-large"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* Mobile Drag handle */}
        <div className="sheet-drag-handle modal-drag-handle" />

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-color, #E4DACA)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--accent-beige-light, #E7DDCC)',
                color: 'var(--accent-beige-dark, #4b4836)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(119, 116, 91, 0.15)'
              }}
            >
              <MapPin size={22} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--text-main, #25251F)',
                  margin: 0,
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2
                }}
              >
                Report Road Waterlogging
              </h3>
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--text-muted, #706D62)',
                  margin: '3px 0 0 0',
                  lineHeight: 1.4
                }}
              >
                Citizen ground truth • Corroborated by Pune AI Early-Warning Engine
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            aria-label="Close report form"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-primary, #F5F0E7)',
              border: '1px solid var(--border-color, #E4DACA)',
              color: 'var(--text-muted, #706D62)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e8ded0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary, #F5F0E7)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {submissionResult ? (
          /* Submission Feedback with Trust Engine Score */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                margin: '0 auto',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: submissionResult.offline_saved ? 'rgba(245, 158, 11, 0.15)' : 'rgba(22, 134, 106, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {submissionResult.offline_saved ? (
                <WifiOff size={30} color="#f59e0b" />
              ) : (
                <CheckCircle2 size={34} color="var(--status-green, #16866A)" />
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #25251F)', margin: '0 0 6px 0' }}>
                {submissionResult.offline_saved ? 'Report Saved to Offline Queue' : 'Report Ingested by Trust Engine'}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted, #706D62)', margin: 0 }}>
                {submissionResult.offline_saved
                  ? 'Stored safely on your device. It will automatically upload to Pune Flood Center once internet restores.'
                  : 'Thank you for contributing to Pune\'s real-time safety network.'}
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                padding: '18px',
                borderRadius: '16px',
                fontSize: '13.5px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted, #706D62)', fontWeight: 500 }}>Initial Trust Score:</span>
                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--accent-beige-dark, #4b4836)' }}>
                  {submissionResult.trust_score} / 100
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted, #706D62)', fontWeight: 500 }}>Verification State:</span>
                <span
                  style={{
                    fontWeight: 750,
                    fontSize: '13px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background:
                      submissionResult.state === 'Likely'
                        ? 'rgba(217, 119, 6, 0.15)'
                        : submissionResult.state === 'Confirmed'
                        ? 'rgba(22, 134, 106, 0.15)'
                        : 'rgba(112, 109, 98, 0.15)',
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

              <div
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-muted, #706D62)',
                  lineHeight: 1.5,
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color, #E4DACA)'
                }}
              >
                ℹ️ <strong>Strict Multi-Citizen Corroboration:</strong> To prevent false alarms, no single citizen report triggers a civic alert alone. Corroboration from a second nearby report elevates this segment to <em>Confirmed</em>.
              </div>

              {submissionResult.photo_verification && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)', lineHeight: 1.5 }}>
                  📷 <strong>Photo Verification Clue:</strong>{' '}
                  {submissionResult.photo_verification.status === 'camera_metadata_present'
                    ? 'Camera metadata detected in image.'
                    : submissionResult.photo_verification.status === 'possible_generated_metadata'
                    ? 'Metadata contains potential AI-generation markers.'
                    : 'Standard web photo without EXIF camera metadata.'}{' '}
                  (Image metadata is treated as a supporting provenance clue only).
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'var(--accent-beige-dark, #28392c)',
                color: '#ffffff',
                padding: '13px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(40, 57, 44, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Report Intake Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMessage && (
              <div
                style={{
                  background: 'var(--risk-severe-bg)',
                  border: '1px solid var(--risk-severe-border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  color: 'var(--risk-severe)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Location & Corridor Info Card */}
            <div
              style={{
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                padding: '10px 16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-green, #16866A)',
                    boxShadow: '0 0 6px rgba(22, 134, 106, 0.5)'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-main, #25251F)', fontWeight: 600 }}>
                  GPS: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
                </span>
              </div>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 650,
                  color: 'var(--accent-beige-dark, #4b4836)',
                  background: 'var(--accent-beige-light, #E7DDCC)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                Aundh–Baner Corridor
              </span>
            </div>

            {/* Language Selector Segmented Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-main, #25251F)', fontWeight: 700 }}>
                Preferred Language:
              </label>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-primary, #F5F0E7)',
                  border: '1px solid var(--border-color, #E4DACA)',
                  borderRadius: '10px',
                  padding: '3px',
                  gap: '4px'
                }}
              >
                {(['mr', 'hi', 'en'] as const).map((lang) => {
                  const isSelected = language === lang;
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      style={{
                        flex: 1,
                        background: isSelected ? 'var(--accent-beige-dark, #28392c)' : 'transparent',
                        border: 'none',
                        color: isSelected ? '#ffffff' : 'var(--text-main, #25251F)',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        fontSize: '12.5px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(40, 57, 44, 0.2)' : 'none'
                      }}
                    >
                      {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'English'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Text Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12.5px', color: 'var(--text-main, #25251F)', fontWeight: 700 }}>
                  Water Condition Description:
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)' }}>
                  Depth, passability & landmarks
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. बाणेर पुलाखाली गुडघाभर पाणी साचले आहे, दुचाकी वाहने पुढे जाऊ शकत नाहीत...'
                    : language === 'hi'
                    ? 'उदा. बाणेर पुल के नीचे घुटने तक पानी भरा है, दोपहिया वाहन आगे नहीं जा पा रहे हैं...'
                    : 'e.g. Knee-deep water pooling under Baner underpass, two-wheelers unable to pass...'
                }
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary, #F5F0E7)',
                  border: '1px solid var(--border-color, #E4DACA)',
                  borderRadius: '12px',
                  color: 'var(--text-main, #25251F)',
                  padding: '12px 14px',
                  fontSize: '13.5px',
                  lineHeight: 1.55,
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-beige-dark, #28392c)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color, #E4DACA)'; }}
              />
            </div>

            {/* Photo Evidence & Voice Input Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-main, #25251F)', fontWeight: 700 }}>
                Attach Ground Evidence (Optional):
              </label>

              {/* Action Buttons Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #E4DACA)',
                    background: 'var(--bg-primary, #F5F0E7)',
                    color: 'var(--text-main, #25251F)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#eee5d8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary, #F5F0E7)'; }}
                >
                  <Camera size={16} color="var(--accent-beige-dark, #4b4836)" />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(event) => selectPhoto(event.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #E4DACA)',
                    background: 'var(--bg-primary, #F5F0E7)',
                    color: 'var(--text-main, #25251F)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#eee5d8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary, #F5F0E7)'; }}
                >
                  <ImagePlus size={16} color="var(--accent-beige-dark, #4b4836)" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => selectPhoto(event.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Photo Preview Card */}
              {photo && photoPreview && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'var(--bg-primary, #F5F0E7)',
                    border: '1px solid var(--border-color, #E4DACA)',
                    borderRadius: '12px',
                    padding: '10px 12px'
                  }}
                >
                  <img
                    src={photoPreview}
                    alt="Selected report evidence"
                    style={{
                      width: '64px',
                      height: '52px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #E4DACA)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 650,
                        color: 'var(--text-main, #25251F)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {photo.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--status-green, #16866A)', marginTop: '2px' }}>
                      Ready to attach ({(photo.size / 1024).toFixed(0)} KB)
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPhoto(null)}
                    style={{
                      border: 'none',
                      background: 'rgba(220, 38, 38, 0.1)',
                      color: 'var(--risk-severe, #dc2626)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Voice Input Option */}
              <button
                type="button"
                onClick={startVoiceInput}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: isListening ? 'var(--risk-severe, #dc2626)' : 'var(--bg-primary, #F5F0E7)',
                  border: isListening ? '1px solid #b91c1c' : '1px solid var(--border-color, #E4DACA)',
                  color: isListening ? '#ffffff' : 'var(--text-main, #25251F)',
                  padding: '11px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isListening ? '0 0 12px rgba(220, 38, 38, 0.4)' : 'none'
                }}
              >
                <Mic size={16} />
                <span>{isListening ? 'Listening (Speak now)...' : 'Record Voice Description (Speech-to-Text)'}</span>
              </button>
            </div>

            {/* Submit Action CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-beige-dark, #28392c)',
                color: '#ffffff',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(40, 57, 44, 0.28)',
                transition: 'all 0.15s ease',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#1a251d'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = 'var(--accent-beige-dark, #28392c)'; }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Evaluating Trust Score & Corroborating...' : 'Submit Ground Truth'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
