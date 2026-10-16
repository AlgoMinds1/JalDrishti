import type { FC } from 'react';
import {
  Map,
  Megaphone,
  Navigation,
  CloudRain,
  Settings,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits') => void;
  onOpenReportModal: () => void;
  onToggleRoutePlanner: () => void;
  onOpenAdminModal: () => void;
  onToggleRainfall: () => void;
  showRainfall: boolean;
  rainAgeMin?: number;
}

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onToggleRoutePlanner,
  onOpenAdminModal,
  onToggleRainfall,
  showRainfall,
  rainAgeMin = 0
}) => {
  return (
    <aside
      className="desktop-only"
      style={{
        width: '240px',
        minWidth: '240px',
        height: '100%',
        background: 'var(--bg-card, #FFFCF6)',
        borderRight: '1px solid var(--border-color, #E4DACA)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 14px',
        zIndex: 950,
        boxShadow: '2px 0 12px rgba(37, 37, 31, 0.04)',
        overflowY: 'auto'
      }}
    >
      {/* Top Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Live Map */}
        <button
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: activeTab === 'map' ? '1px solid var(--accent-cyan, #77745B)' : '1px solid transparent',
            background: activeTab === 'map' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            color: activeTab === 'map' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-main, #25251F)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <div
            style={{
              color: activeTab === 'map' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Map size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: activeTab === 'map' ? 700 : 600 }}>
              Live Map
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '1px' }}>
              Forecast & risk view
            </div>
          </div>
        </button>

        {/* Report Flooding */}
        <button
          onClick={onOpenReportModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: 'var(--text-muted, #706D62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Report Flooding
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '1px' }}>
              Crowd ground truth
            </div>
          </div>
        </button>

        {/* Plan Dry Route */}
        <button
          onClick={onToggleRoutePlanner}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: 'var(--text-muted, #706D62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Plan Dry Route
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '1px' }}>
              Safer alternative paths
            </div>
          </div>
        </button>

        {/* Live Rainfall Toggle */}
        <button
          onClick={onToggleRainfall}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: showRainfall ? '1px solid var(--accent-cyan, #77745B)' : 'none',
            background: showRainfall ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            color: showRainfall ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-main, #25251F)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { if (!showRainfall) e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)'; }}
          onMouseLeave={(e) => { if (!showRainfall) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: showRainfall ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudRain size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Rainfall & Radar
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '1px' }}>
              Toggle radar layer
            </div>
          </div>
        </button>

        {/* Admin & Sandbox */}
        <button
          onClick={onOpenAdminModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: 'var(--text-muted, #706D62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Admin & Sandbox
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', marginTop: '1px' }}>
              Model tools & inspection
            </div>
          </div>
        </button>
      </div>

      {/* Bottom Section: Rain Data Widget & Pune Brand Watermark */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto' }}>
        {/* Rain data IMD card */}
        <div
          style={{
            background: 'var(--bg-widget, #FFFCF6)',
            border: '1px solid var(--border-color, #E4DACA)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-green, #16866A)',
                boxShadow: '0 0 6px rgba(22, 134, 106, 0.6)'
              }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #25251F)' }}>
                Rain data (IMD)
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #706D62)' }}>
                Updated {rainAgeMin} min ago
              </div>
            </div>
          </div>
          <BarChart3 size={16} color="var(--accent-cyan, #77745B)" />
        </div>

        {/* Pune Skyline Silhouette Graphic & Footer */}
        <div
          style={{
            paddingTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            position: 'relative'
          }}
        >
          <div style={{ width: '100%', height: '48px', overflow: 'hidden', opacity: 0.85 }}>
            <svg viewBox="0 0 200 60" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50 Q45 28 90 44 T180 32 Q195 38 200 48 L200 60 L0 60 Z" fill="#E7DDCC" opacity="0.6" />
              <path d="M15 50 L15 32 L22 32 L22 28 L28 28 L28 32 L35 32 L35 50 Z" fill="#ded2bf" opacity="0.7" />
              <path d="M42 50 L42 22 L48 22 L48 18 L54 18 L54 22 L60 22 L60 50 Z" fill="#77745B" opacity="0.65" />
              <path d="M47 38 Q51 30 55 38 Z" fill="#FFFCF6" opacity="0.8" />
              <path d="M68 50 L68 28 Q75 16 82 28 L82 50 Z" fill="#ded2bf" opacity="0.6" />
              <path d="M88 50 L88 35 L96 35 L96 50 Z" fill="#77745B" opacity="0.5" />
              <circle cx="120" cy="44" r="6" fill="#E7DDCC" opacity="0.5" />
              <circle cx="132" cy="40" r="8" fill="#ded2bf" opacity="0.6" />
              <circle cx="145" cy="44" r="7" fill="#E7DDCC" opacity="0.5" />
              <path d="M160 50 L165 30 L170 50 Z" fill="#ded2bf" opacity="0.6" />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main, #25251F)', letterSpacing: '-0.3px' }}>
              Pune
            </div>
            <div style={{ color: 'var(--accent-cyan, #77745B)', fontSize: '14px', opacity: 0.8 }}>
              〰️
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', fontWeight: 500 }}>
            Safer Roads, Resilient Communities
          </div>
        </div>
      </div>
    </aside>
  );
};
