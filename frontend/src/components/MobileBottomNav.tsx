import type { FC } from 'react';
import {
  Map,
  Megaphone,
  Navigation,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAppLanguage } from '../language';

interface MobileBottomNavProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay') => void;
  onOpenReportModal: () => void;
  onToggleRoutePlanner: () => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onToggleRoutePlanner,
  onOpenSettings,
  onOpenAssistant
}) => {
  const { t } = useAppLanguage();
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
          color: activeTab === 'map' || activeTab === 'replay' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
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
            background: activeTab === 'map' || activeTab === 'replay' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          <Map size={18} strokeWidth={activeTab === 'map' || activeTab === 'replay' ? 2.4 : 1.9} />
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'map' || activeTab === 'replay' ? 700 : 500,
            letterSpacing: '-0.1px'
          }}
        >
          {t('mapTab')}
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
          {t('report')}
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
          {t('routes')}
        </span>
      </button>

      {/* 4. Flood assistant */}
      <button
        onClick={onOpenAssistant}
        title="Flood Assistant"
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
            background: 'transparent',
            position: 'relative'
          }}
        >
          <MessageCircle size={18} strokeWidth={1.9} />
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '-0.1px'
          }}
        >
          {t('assistant')}
        </span>
      </button>

      {/* 5. User settings */}
      <button
        onClick={onOpenSettings}
        title={t('settings')}
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
          {t('settings')}
        </span>
      </button>
    </nav>
  );
};
