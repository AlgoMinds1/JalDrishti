import { useState, useEffect, type FC, type Dispatch, type SetStateAction } from 'react';
import { CalendarClock, CloudRain, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

interface TimeSliderProps {
  currentHour: number;
  setHour: Dispatch<SetStateAction<number>>;
  stats?: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
  rainAgeMin?: number;
  disabled?: boolean;
  onOpenReplay?: () => void;
}

export const TimeSlider: FC<TimeSliderProps> = ({
  currentHour,
  setHour,
  stats = { low: 0, moderate: 0, high: 0, severe: 0 },
  rainAgeMin = 0,
  disabled = false,
  onOpenReplay
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  const horizons = [
    { hour: 1, label: '+1h' },
    { hour: 2, label: '+2h' },
    { hour: 3, label: '+3h' },
    { hour: 4, label: '+4h' },
    { hour: 5, label: '+5h' },
    { hour: 6, label: '+6h' }
  ];

  // Auto-play animation through horizons
  useEffect(() => {
    if (disabled) setIsPlaying(false);
  }, [disabled]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setHour((prev: number) => (prev >= 6 ? 1 : prev + 1));
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setHour]);

  const totalAtRisk = stats.high + stats.severe;
  const overallRiskLabel = totalAtRisk > 25
    ? 'High Risk Corridor'
    : totalAtRisk > 5
    ? 'Localized Waterlogging'
    : 'Minimal Inundation';
  const overallRiskColor = totalAtRisk > 25
    ? 'var(--risk-severe, #dc2626)'
    : totalAtRisk > 5
    ? 'var(--risk-high, #ea580c)'
    : 'var(--status-green, #16866A)';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(var(--sab, 0px) + 68px)',
        left: '12px',
        right: '12px',
        maxWidth: '560px',
        margin: '0 auto',
        zIndex: 950,
        opacity: disabled ? 0.48 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      {/* ── Forecast Overview Summary Card (Collapsible) ── */}
      <div
        style={{
          background: 'var(--bg-card, #FFFCF6)',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #E4DACA)',
          boxShadow: '0 4px 18px rgba(37, 37, 31, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Summary Card Header Bar */}
        <div
          onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            cursor: 'pointer',
            background: 'var(--bg-card, #FFFCF6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: overallRiskColor,
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
              Forecast Overview (+{currentHour}h)
            </span>
            <span
              style={{
                fontSize: '11px',
                color: overallRiskColor,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              • {overallRiskLabel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted, #706D62)' }}>
            {onOpenReplay && (
              <button
                type="button"
                aria-label="Open historical event replay"
                title="Historical event replay"
                onClick={(event) => { event.stopPropagation(); onOpenReplay(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  border: '1px solid var(--border-color, #E4DACA)', borderRadius: 999,
                  padding: '4px 8px', background: 'var(--bg-card, #FFFCF6)',
                  color: 'var(--text-muted, #706D62)', fontSize: 10, cursor: 'pointer'
                }}
              ><CalendarClock size={13} /><span>Events</span></button>
            )}
            <span style={{ fontSize: '11px' }}>{isOverviewExpanded ? 'Hide' : 'Details'}</span>
            {isOverviewExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>

        {/* Collapsible Details Body */}
        {isOverviewExpanded && (
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-subtle, #eee7db)',
              background: 'var(--bg-primary, #F5F0E7)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}
          >
            {/* Metric 1: Risk Segments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>
                Severe / High
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: totalAtRisk > 0 ? 'var(--risk-severe, #dc2626)' : 'var(--text-main, #25251F)' }}>
                {totalAtRisk} segments
              </span>
            </div>

            {/* Metric 2: Moderate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>
                Moderate Risk
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--risk-moderate, #d97706)' }}>
                {stats.moderate} segments
              </span>
            </div>

            {/* Metric 3: Rain Data Age */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>
                IMD Radar Age
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-green, #16866A)' }}>
                {rainAgeMin}m ago
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Forecast Horizon Selector (Single Horizontally Scrollable Line) ── */}
      <div
        style={{
          background: 'var(--bg-card, #FFFCF6)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, #E4DACA)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 18px rgba(37, 37, 31, 0.08)'
        }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause auto-play' : 'Play forecast animation'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--border-color, #E4DACA)',
            background: isPlaying ? 'var(--accent-beige, #77745B)' : 'var(--bg-pill, #E7DDCC)',
            color: isPlaying ? '#FFFFFF' : 'var(--accent-beige-dark, #4b4836)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          {isPlaying ? <Pause size={13} fill="#FFFFFF" /> : <Play size={13} fill="currentColor" />}
        </button>

        {/* Scrollable Pill Container */}
        <div
          className="horizontal-scroll-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '2px 0'
          }}
        >
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
                  flex: '0 0 auto',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--accent-beige-dark, #4b4836)' : '1px solid var(--border-color, #E4DACA)',
                  background: isSelected ? 'var(--accent-beige, #77745B)' : 'var(--bg-card, #FFFCF6)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main, #25251F)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: isSelected ? '0 2px 8px rgba(119, 116, 91, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <CloudRain size={12} color={isSelected ? '#FFFFFF' : 'var(--accent-cyan, #77745B)'} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
