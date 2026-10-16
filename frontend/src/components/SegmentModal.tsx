import type { FC } from 'react';
import { X, AlertTriangle, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export interface SegmentPredictionData {
  segment_id: string;
  name?: string;
  road_class?: string;
  length_m?: number;
  is_underpass?: boolean;
  horizon_h: number;
  risk_class: 'low' | 'moderate' | 'high' | 'severe';
  probability: number;
  confidence_level: string;
  confidence_score: number;
  conf_set_size: number;
  top_reasons: string[];
  rain_data_age_min: number;
  is_ood?: boolean;
}

interface SegmentModalProps {
  segment: SegmentPredictionData | null;
  onClose: () => void;
  onNavigateHere?: (seg: SegmentPredictionData) => void;
}

export const SegmentModal: FC<SegmentModalProps> = ({ segment, onClose, onNavigateHere }) => {
  if (!segment) return null;

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'severe':
        return {
          bg: 'var(--risk-severe-bg)',
          border: 'var(--risk-severe)',
          text: 'var(--risk-severe)',
          label: 'Severe Inundation Risk'
        };
      case 'high':
        return {
          bg: 'var(--risk-high-bg)',
          border: 'var(--risk-high)',
          text: 'var(--risk-high)',
          label: 'High Waterlogging Risk'
        };
      case 'moderate':
        return {
          bg: 'var(--risk-moderate-bg)',
          border: 'var(--risk-moderate)',
          text: 'var(--risk-moderate)',
          label: 'Moderate Waterlogging Risk'
        };
      default:
        return {
          bg: 'var(--risk-low-bg)',
          border: 'var(--risk-low)',
          text: 'var(--risk-low)',
          label: 'Low Waterlogging Risk'
        };
    }
  };

  const riskStyle = getRiskStyle(segment.risk_class);
  const probPercent = Math.round(segment.probability * 100);

  return (
    <>
      {/* ── Mobile Bottom Sheet (Visible on < 1024px) ── */}
      <div
        className="mobile-only"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2200,
          background: 'rgba(37, 37, 31, 0.35)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        <div
          className="animate-slide-up"
          style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '80vh',
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
          {/* Top Sheet Drag Handle */}
          <div className="sheet-drag-handle" />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ flex: 1, paddingRight: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <MapPin size={16} color="var(--accent-cyan, #77745B)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  {segment.name || segment.segment_id}
                </h3>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span>Class: {segment.road_class || 'Arterial'}</span>
                {segment.length_m ? <span>• {Math.round(segment.length_m)}m</span> : null}
                {segment.is_underpass && (
                  <span style={{ color: 'var(--risk-severe, #dc2626)', fontWeight: 600 }}>• Underpass</span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close road details"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #706D62)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Risk Badge Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              background: riskStyle.bg,
              border: `1px solid ${riskStyle.border}`,
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color={riskStyle.text} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: riskStyle.text }}>
                  {riskStyle.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-main, #25251F)' }}>
                  Forecast horizon: +{segment.horizon_h}h
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: riskStyle.text }}>
                {probPercent}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #706D62)' }}>
                Likelihood
              </div>
            </div>
          </div>

          {/* Model Confidence & Freshness */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} color="var(--status-green, #16866A)" />
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>Confidence</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  {segment.confidence_level} ({Math.round(segment.confidence_score * 100)}%)
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={16} color="var(--accent-cyan, #77745B)" />
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>Data Freshness</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  {segment.rain_data_age_min}m ago
                </div>
              </div>
            </div>
          </div>

          {/* Top SHAP Explanations */}
          {segment.top_reasons && segment.top_reasons.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Sparkles size={14} color="var(--accent-cyan, #77745B)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  Key Risk Factors (SHAP Explanations)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {segment.top_reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-sub, #444238)',
                      background: 'var(--bg-primary, #F5F0E7)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--accent-cyan, #77745B)'
                    }}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {onNavigateHere && (
            <button
              onClick={() => onNavigateHere(segment)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-beige, #77745B)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(119, 116, 91, 0.25)'
              }}
            >
              Plan Dry Route to this Road
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop Drawer (Visible on >= 1024px) ── */}
      <div
        className="desktop-only"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '360px',
          maxWidth: 'calc(100vw - 48px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in-out',
          flexDirection: 'column'
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-widget)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {segment.name || segment.segment_id}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span>Class: {segment.road_class || 'Arterial'}</span>
                {segment.length_m ? <span>• {Math.round(segment.length_m)}m</span> : null}
                {segment.is_underpass && <span style={{ color: 'var(--risk-severe)', fontWeight: 600 }}>• Underpass</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Risk Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: riskStyle.bg,
              border: `1px solid ${riskStyle.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: riskStyle.text }}>
                {riskStyle.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-main)' }}>
                +{segment.horizon_h}h forecast
              </div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: riskStyle.text }}>
              {probPercent}%
            </div>
          </div>

          {/* Confidence & Freshness */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-pill)', borderRadius: '8px', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Confidence: </span>
              <strong>{segment.confidence_level}</strong>
            </div>
            <div style={{ padding: '8px', background: 'var(--bg-pill)', borderRadius: '8px', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Updated: </span>
              <strong>{segment.rain_data_age_min}m ago</strong>
            </div>
          </div>

          {/* SHAP Reasons */}
          {segment.top_reasons && (
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Key Influencing Drivers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {segment.top_reasons.map((r, i) => (
                  <div key={i} style={{ fontSize: '11.5px', color: 'var(--text-sub)', padding: '4px 8px', background: 'var(--bg-pill)', borderRadius: '6px' }}>
                    • {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
