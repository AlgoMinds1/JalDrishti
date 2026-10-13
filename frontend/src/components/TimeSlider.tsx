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
        borderRadius: '16px',
        padding: '16px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Top Info Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              +{currentHour}h Forecast Horizon
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              ({currentHour === 1 ? 'Next 60 minutes' : `Peak Inundation Window: +${currentHour} Hours`})
            </span>
          </div>

          {/* Risk Level Stat Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Low: {stats.low}
            </span>
            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              Mod: {stats.moderate}
            </span>
            <span style={{
              background: 'rgba(249, 115, 22, 0.15)',
              color: '#fb923c',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
              High: {stats.high}
            </span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.18)',
              color: '#f87171',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.35)'
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
                  background: isSelected ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : 'rgba(30, 41, 59, 0.7)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.45)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>+{h}h</span>
                <span style={{ fontSize: '10px', opacity: isSelected ? 0.9 : 0.6 }}>
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
