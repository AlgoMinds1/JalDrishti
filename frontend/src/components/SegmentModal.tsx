import type { FC } from 'react';
import { X } from 'lucide-react';

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
}

export const SegmentModal: FC<SegmentModalProps> = ({ segment, onClose }) => {
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

  return (
    <div style={{
      position: 'absolute',
      top: '24px',
      right: '24px',
      width: '360px',
      maxWidth: 'calc(100vw - 48px)',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div className="glass" style={{
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-widget)'
      }}>
        {/* Header & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              {segment.name || segment.segment_id}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
              <span>Class: {segment.road_class || 'arterial'}</span>
              {segment.length_m ? <span>• {Math.round(segment.length_m)}m length</span> : null}
              {segment.is_underpass ? <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>• Underpass</span> : null}
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

        {/* Risk Probability Banner */}
        <div style={{
          background: riskStyle.bg,
          border: `1px solid ${riskStyle.border}`,
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: riskStyle.text }}>
              {riskStyle.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {Math.round(segment.probability * 100)}%
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
                Probability (+{segment.horizon_h}h)
              </span>
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            background: 'var(--bg-widget)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            textAlign: 'right'
          }}>
            <div>{segment.confidence_level} Confidence</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MAPIE Set: {segment.conf_set_size}</div>
          </div>
        </div>

        {/* Action Recommendation */}
        <div style={{
          background: 'var(--bg-pill)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '12px',
          color: 'var(--text-main)',
          borderLeft: `3px solid ${riskStyle.border}`,
          borderTop: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {segment.risk_class === 'severe' ? (
            <div><strong>🛑 AVOID ROUTE:</strong> Impassable water pooling forecast. High likelihood of stalled vehicles.</div>
          ) : segment.risk_class === 'high' ? (
            <div><strong>⚠️ SIGNIFICANT POOLING:</strong> Drive with caution. Two-wheelers advised to take alternate corridor.</div>
          ) : segment.risk_class === 'moderate' ? (
            <div><strong>ℹ️ LOCALIZED PUDDLING:</strong> Safe for passenger vehicles. Slow down near curbs.</div>
          ) : (
            <div><strong>✅ NORMAL PASSAGE:</strong> Terrain and stormwater drainage adequate for anticipated rain.</div>
          )}
        </div>

        {/* Plain English SHAP Explainability Reasons */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Top Explanatory Factors (SHAP AI):
          </div>
          <ul style={{
            listStyleType: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {segment.top_reasons && segment.top_reasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
