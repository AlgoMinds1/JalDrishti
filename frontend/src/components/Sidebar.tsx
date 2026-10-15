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
  showRainfall: _showRainfall,
  rainAgeMin = 0
}) => {
  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      height: '100%',
      background: 'var(--bg-secondary, #f6f1e8)',
      borderRight: '1px solid var(--border-color, #e5dcce)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 14px',
      zIndex: 950,
      boxShadow: '2px 0 12px rgba(80, 60, 40, 0.04)',
      overflowY: 'auto'
    }}>
      {/* Top Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Live Map (Active Light Beige Pill) */}
        <button
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: activeTab === 'map' ? '1px solid #d4c2aa' : '1px solid transparent',
            background: activeTab === 'map' ? '#ede3d3' : 'transparent',
            color: activeTab === 'map' ? '#664319' : 'var(--text-main, #2e2214)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'map' ? '0 1px 4px rgba(80, 60, 40, 0.06)' : 'none'
          }}
        >
          <div style={{
            color: activeTab === 'map' ? '#8f6738' : '#735d47',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Map size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: activeTab === 'map' ? 700 : 600 }}>
              Live Map
            </div>
            <div style={{ fontSize: '11px', color: '#735d47', marginTop: '1px' }}>
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
            color: 'var(--text-main, #2e2214)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #e5d5be)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: '#6b543b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Report Flooding
            </div>
            <div style={{ fontSize: '11px', color: '#735d47', marginTop: '1px' }}>
              Help us with ground truth
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
            color: 'var(--text-main, #2e2214)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #e5d5be)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: '#6b543b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Plan Dry Route
            </div>
            <div style={{ fontSize: '11px', color: '#735d47', marginTop: '1px' }}>
              Find safer alternative routes
            </div>
          </div>
        </button>

        {/* Rainfall & Conditions */}
        <button
          onClick={onToggleRainfall}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #2e2214)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #e5d5be)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: '#6b543b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudRain size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Rainfall & Conditions
            </div>
            <div style={{ fontSize: '11px', color: '#735d47', marginTop: '1px' }}>
              Live data from open sources
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
            color: 'var(--text-main, #2e2214)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #e5d5be)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ color: '#6b543b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={19} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Admin & Sandbox
            </div>
            <div style={{ fontSize: '11px', color: '#735d47', marginTop: '1px' }}>
              Model tools & settings
            </div>
          </div>
        </button>
      </div>

      {/* Bottom Section: Rain Data Widget & Pune Brand Watermark */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto' }}>
        {/* Rain data IMD card */}
        <div style={{
          background: 'var(--bg-widget, #faf5ec)',
          border: '1px solid var(--border-color, #d8c6af)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
            }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #2e2214)' }}>
                Rain data (IMD)
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #735d47)' }}>
                Updated {rainAgeMin} min ago
              </div>
            </div>
          </div>
          <BarChart3 size={16} color="#8f6534" />
        </div>

        {/* Pune Skyline Silhouette Graphic & Footer */}
        <div style={{
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative'
        }}>
          {/* Subtle Pune Landmark Graphic in warm tones */}
          <div style={{ width: '100%', height: '54px', overflow: 'hidden', opacity: 0.9 }}>
            <svg viewBox="0 0 200 60" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50 Q45 28 90 44 T180 32 Q195 38 200 48 L200 60 L0 60 Z" fill="#dfcdb5" opacity="0.6" />
              <path d="M15 50 L15 32 L22 32 L22 28 L28 28 L28 32 L35 32 L35 50 Z" fill="#cbb497" opacity="0.7" />
              <path d="M42 50 L42 22 L48 22 L48 18 L54 18 L54 22 L60 22 L60 50 Z" fill="#bd9f7b" opacity="0.75" />
              <path d="M47 38 Q51 30 55 38 Z" fill="#fcfaf6" opacity="0.8" />
              <path d="M68 50 L68 28 Q75 16 82 28 L82 50 Z" fill="#c4aa8a" opacity="0.6" />
              <path d="M88 50 L88 35 L96 35 L96 50 Z" fill="#bd9f7b" opacity="0.7" />
              <circle cx="120" cy="44" r="6" fill="#cbb497" opacity="0.5" />
              <circle cx="132" cy="40" r="8" fill="#bd9f7b" opacity="0.6" />
              <circle cx="145" cy="44" r="7" fill="#dfcdb5" opacity="0.5" />
              <path d="M160 50 L165 30 L170 50 Z" fill="#cbb497" opacity="0.6" />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main, #2e2214)', letterSpacing: '-0.3px' }}>
              Pune
            </div>
            <div style={{ color: '#8f6534', fontSize: '16px', opacity: 0.8 }}>
              〰️
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #735d47)', fontWeight: 500 }}>
            Safer Roads, Resilient Communities
          </div>
        </div>
      </div>
    </aside>
  );
};
