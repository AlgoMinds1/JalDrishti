import type { FC } from 'react';
import { Info } from 'lucide-react';

export const RiskLegend: FC = () => {
  const items = [
    { label: 'Severe (High likelihood)', color: '#ef4444' },
    { label: 'High', color: '#f97316' },
    { label: 'Moderate', color: '#f59e0b' },
    { label: 'Low', color: '#10b981' },
    { label: 'No significant risk', color: '#9e8870' }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '76px',
      left: '16px',
      zIndex: 900,
      background: 'var(--bg-card, rgba(250, 246, 238, 0.97))',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '14px',
      border: '1px solid var(--border-color, #d8c6af)',
      padding: '14px 18px',
      boxShadow: '0 8px 24px rgba(80, 60, 40, 0.1)',
      minWidth: '200px',
      pointerEvents: 'auto'
    }}>
      {/* Title with Info icon in warm tone */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main, #2e2214)' }}>
          Waterlogging Risk
        </span>
        <div title="Calibrated conformal prediction likelihood based on rainfall, slope & drainage proximity">
          <Info size={14} color="#8f6738" style={{ cursor: 'help' }} />
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '18px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: item.color,
              flexShrink: 0
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-sub, #4a3823)', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
