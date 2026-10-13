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
          bg: 'rgba(239, 68, 68, 0.2)',
          border: '#ef4444',
          text: '#f87171',
          label: 'Severe Inundation Risk'
        };
      case 'high':
        return {
          bg: 'rgba(249, 115, 22, 0.2)',
          border: '#f97316',
          text: '#fb923c',
          label: 'High Waterlogging Risk'
        };
      case 'moderate':
        return {
          bg: 'rgba(245, 158, 11, 0.2)',
          border: '#f59e0b',
          text: '#fbbf24',
          label: 'Moderate Waterlogging Risk'
        };
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.2)',
          border: '#10b981',
          text: '#34d399',
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
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              {segment.name || segment.segment_id}
            </h3>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '8px' }}>
              <span>Class: {segment.road_class || 'arterial'}</span>
              {segment.length_m ? <span>• {Math.round(segment.length_m)}m length</span> : null}
              {segment.is_underpass ? <span style={{ color: '#f97316', fontWeight: 600 }}>• Underpass</span> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
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
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
              {Math.round(segment.probability * 100)}%
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginLeft: '6px' }}>
                Probability (+{segment.horizon_h}h)
              </span>
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            textAlign: 'right'
          }}>
            <div>{segment.confidence_level} Confidence</div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>MAPIE Set: {segment.conf_set_size}</div>
          </div>
        </div>

        {/* Action Recommendation */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#e2e8f0',
          borderLeft: `3px solid ${riskStyle.border}`
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
            Top Explanatory Factors (SHAP AI):
          </div>
          <ul style={{
            listStyleType: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            {segment.top_reasons && segment.top_reasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#38bdf8', marginTop: '2px' }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
