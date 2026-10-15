import { useState, useEffect, type FC } from 'react';
import { CloudRain, Play, Pause } from 'lucide-react';

interface TimeSliderProps {
  currentHour: number;
  setHour: (h: number) => void;
  stats?: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
}

export const TimeSlider: FC<TimeSliderProps> = ({ currentHour, setHour }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const horizons = [
    { hour: 1, label: '1 Hour' },
    { hour: 2, label: '2 Hours' },
    { hour: 3, label: '3 Hours' },
    { hour: 4, label: '4 Hours' },
    { hour: 5, label: '5 Hours' },
    { hour: 6, label: '6 Hours' }
  ];

  // Auto-play animation through horizons
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setHour((prev: number) => (prev >= 6 ? 1 : prev + 1));
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setHour]);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 900,
      width: '84%',
      maxWidth: '740px',
      pointerEvents: 'auto'
    }}>
      <div style={{
        background: 'var(--bg-card, rgba(250, 246, 238, 0.98))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color, #d8c6af)',
        borderRadius: '18px',
        padding: '14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 12px 32px rgba(80, 60, 40, 0.12)'
      }}>
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left: Forecast Horizon Title & Subtext */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#ebd8c0',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CloudRain size={20} color="#8f6738" />
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #2e2214)' }}>
                Forecast Horizon
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #735d47)' }}>
                Showing predicted waterlogging risk for next 6 hours
              </div>
            </div>
          </div>

          {/* Right: Beige Animation Play Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: isPlaying ? '1px solid #7a5022' : '1px solid #b8905e',
              background: isPlaying ? 'linear-gradient(135deg, #b8905e, #8f6738)' : '#ebdcc6',
              color: isPlaying ? '#ffffff' : '#613d17',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(143, 103, 56, 0.2)'
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={13} fill="#ffffff" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={13} fill="#7a5022" />
                <span>Animation</span>
              </>
            )}
          </button>
        </div>

        {/* 6 Horizon Selector Cards in Beige */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px'
        }}>
          {horizons.map(({ hour, label }) => {
            const isSelected = currentHour === hour;
            return (
              <button
                key={hour}
                onClick={() => {
                  setIsPlaying(false);
                  setHour(hour);
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #b8905e, #8f6738)'
                    : 'var(--bg-widget, #faf5ec)',
                  border: isSelected ? '1px solid #7a5022' : '1px solid var(--border-color, #d8c6af)',
                  color: isSelected ? '#ffffff' : 'var(--text-main, #2e2214)',
                  padding: '9px 4px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '12.5px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(143, 103, 56, 0.38)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CloudRain
                    size={14}
                    color={isSelected ? '#ffffff' : '#8f6738'}
                  />
                  <span>+{hour}h</span>
                </div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  opacity: isSelected ? 0.95 : 0.75,
                  color: isSelected ? '#ffffff' : 'var(--text-muted, #735d47)'
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
