import type { FC } from 'react';
import {
  Map,
  Megaphone,
  Navigation,
  CloudRain,
  Settings
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits') => void;
  onOpenReportModal: () => void;
  onToggleRoutePlanner: () => void;
  onOpenAdminModal: () => void;
  onToggleRainfall: () => void;
  showRainfall: boolean;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onToggleRoutePlanner,
  onOpenAdminModal,
  onToggleRainfall,
  showRainfall
}) => {
  return (
    <nav
      className="mobile-only"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: 'var(--bg-card, #FFFCF6)',
        borderTop: '1px solid var(--border-color, #E4DACA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: '6px',
        paddingBottom: 'calc(var(--sab, 0px) + 6px)',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxShadow: '0 -4px 18px rgba(37, 37, 31, 0.08)',
        height: 'calc(58px + var(--sab, 0px))',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Map */}
      <button
        onClick={() => setActiveTab('map')}
        title="Live Flood-Risk Map"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          color: activeTab === 'map' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '26px',
            borderRadius: '13px',
            background: activeTab === 'map' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          <Map size={18} strokeWidth={activeTab === 'map' ? 2.4 : 1.9} />
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'map' ? 700 : 500,
            letterSpacing: '-0.1px'
          }}
        >
          Map
        </span>
      </button>

      {/* 2. Report */}
      <button
        onClick={onOpenReportModal}
        title="Report Road Waterlogging"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          color: 'var(--text-muted, #706D62)',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '26px',
            borderRadius: '13px',
            background: 'transparent'
          }}
        >
          <Megaphone size={18} strokeWidth={1.9} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.1px' }}>
          Report
        </span>
      </button>

      {/* 3. Routes */}
      <button
        onClick={onToggleRoutePlanner}
        title="Calculate Dry Route"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          color: 'var(--text-muted, #706D62)',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '26px',
            borderRadius: '13px',
            background: 'transparent'
          }}
        >
          <Navigation size={18} strokeWidth={1.9} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.1px' }}>
          Routes
        </span>
      </button>

      {/* 4. Rain */}
      <button
        onClick={onToggleRainfall}
        title={showRainfall ? 'Hide Live Rainfall Overlay' : 'Show Live Rainfall Overlay'}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          color: showRainfall ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '26px',
            borderRadius: '13px',
            background: showRainfall ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            position: 'relative'
          }}
        >
          <CloudRain size={18} strokeWidth={showRainfall ? 2.4 : 1.9} />
          {showRainfall && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--status-green, #16866A)'
              }}
            />
          )}
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: showRainfall ? 700 : 500,
            letterSpacing: '-0.1px'
          }}
        >
          Rain
        </span>
      </button>

      {/* 5. Admin */}
      <button
        onClick={onOpenAdminModal}
        title="Admin Tools & What-If Storm Sandbox"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 2px',
          color: 'var(--text-muted, #706D62)',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '26px',
            borderRadius: '13px',
            background: 'transparent'
          }}
        >
          <Settings size={18} strokeWidth={1.9} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.1px' }}>
          Admin
        </span>
      </button>
    </nav>
  );
};
