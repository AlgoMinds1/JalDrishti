import type { FC } from 'react';
import { Clock } from 'lucide-react';

interface TimeSliderProps {
  currentHour: number;
  setHour: (h: number) => void;
  stats: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
}

export const TimeSlider: FC<TimeSliderProps> = ({ currentHour, setHour, stats }) => {
  const horizons = [1, 2, 3, 4, 5, 6];

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 990,
      width: '92%',
      maxWidth: '780px'
    }}>
      <div className="glass" style={{
        background: 'var(--bg-widget, rgba(255, 255, 255, 0.96))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))',
        borderRadius: '16px',
        padding: '16px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-widget, 0 12px 30px rgba(0, 0, 0, 0.15))'
      }}>
        {/* Top Info Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              +{currentHour}h Forecast Horizon
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({currentHour === 1 ? 'Next 60 minutes' : `Peak Inundation Window: +${currentHour} Hours`})
            </span>
          </div>

          {/* Risk Level Stat Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
            <span style={{
              background: 'var(--risk-low-bg)',
              color: 'var(--risk-low)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--risk-low-border)'
            }}>
              Low: {stats.low}
            </span>
            <span style={{
              background: 'var(--risk-moderate-bg)',
              color: 'var(--risk-moderate)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--risk-moderate-border)'
            }}>
              Mod: {stats.moderate}
            </span>
            <span style={{
              background: 'var(--risk-high-bg)',
              color: 'var(--risk-high)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--risk-high-border)'
            }}>
              High: {stats.high}
            </span>
            <span style={{
              background: 'var(--risk-severe-bg)',
              color: 'var(--risk-severe)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--risk-severe-border)'
            }}>
              Severe: {stats.severe}
            </span>
          </div>
        </div>

        {/* Horizon Button Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px'
        }}>
          {horizons.map((h) => {
            const isSelected = currentHour === h;
            return (
              <button
                key={h}
                onClick={() => setHour(h)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : 'var(--bg-pill, #f1f5f9)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(15, 23, 42, 0.1))',
                  color: isSelected ? '#ffffff' : 'var(--text-main, #0f172a)',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>+{h}h</span>
                <span style={{ fontSize: '10px', opacity: isSelected ? 0.95 : 0.75, color: isSelected ? '#ffffff' : 'var(--text-muted, #64748b)' }}>
                  {h === 1 ? '1 Hour' : `${h} Hours`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
