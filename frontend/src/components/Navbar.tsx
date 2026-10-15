import { useState, type FC } from 'react';
import {
  Map,
  BarChart3,
  Info,
  Moon,
  Sun,
  AlertCircle,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits') => void;
  scenario?: 'live' | 'storm_july2024';
  setScenario?: (scen: 'live' | 'storm_july2024') => void;
  rainAgeMin?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme = 'light',
  setTheme
}) => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <header style={{ position: 'relative', zIndex: 1000, width: '100%' }}>
      {/* Warm Beige Disclaimer Banner */}
      {showDisclaimer && (
        <div style={{
          background: '#faecd6',
          color: '#7a4d18',
          fontSize: '12px',
          fontWeight: 500,
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: '1px solid #ebd0a8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="#b86e1e" />
            <span>
              Decision-support prototype. Not an official emergency alert service. In emergencies, call PMC / 112 immediately.
            </span>
          </div>

          <button
            onClick={() => setShowDisclaimer(false)}
            title="Dismiss notice"
            style={{
              position: 'absolute',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: '#7a4d18',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Navbar Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        background: 'var(--bg-secondary, #f6f1e8)',
        borderBottom: '1px solid var(--border-color, #e5dcce)',
        height: '62px',
        boxSizing: 'border-box'
      }}>
        {/* Brand / Logo Area */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
          title="Return to Landing Page"
        >
          {/* Circular droplet/cloud logo in warm caramel/beige gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #c49d68, #8f6534)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(166, 124, 78, 0.35)',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 14C4.567 14 3 12.433 3 10.5C3 8.736 4.305 7.279 6.012 7.039C6.527 4.725 8.583 3 11 3C13.844 3 16.2 5.093 16.592 7.808C18.528 8.169 20 9.845 20 11.875C20 14.153 18.153 16 15.875 16H6.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17.5C5.5 16.5 7.5 16.5 9 17.5C10.5 18.5 12.5 18.5 14 17.5C15.5 16.5 17.5 16.5 19 17.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20.5C6.5 19.5 8.5 19.5 10 20.5C11.5 21.5 13.5 21.5 15 20.5C16.5 19.5 18.5 19.5 20 20.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main, #2e2214)', letterSpacing: '-0.3px' }}>
                JalDrishti
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #735d47)' }}>
                Hyperlocal Road Inundation Forecasting
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6e471d',
                background: '#e5d7c3',
                padding: '1px 8px',
                borderRadius: '9999px',
                border: '1px solid #cca983'
              }}>
                Pune Pilot
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Tabs & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Early Warning Map Tab */}
          <button
            onClick={() => setActiveTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: activeTab === 'map' ? '1.5px solid #a67c4e' : '1.5px solid transparent',
              background: activeTab === 'map' ? '#dfcdb5' : 'transparent',
              color: activeTab === 'map' ? '#523412' : 'var(--text-muted, #735d47)',
              fontSize: '13px',
              fontWeight: activeTab === 'map' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Map size={16} color={activeTab === 'map' ? '#7a542b' : '#735d47'} />
            <span>Early-Warning Map</span>
          </button>

          {/* Model Accuracy Tab */}
          <button
            onClick={() => setActiveTab('evaluate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: activeTab === 'evaluate' ? '1.5px solid #a67c4e' : '1.5px solid transparent',
              background: activeTab === 'evaluate' ? '#dfcdb5' : 'transparent',
              color: activeTab === 'evaluate' ? '#523412' : 'var(--text-muted, #735d47)',
              fontSize: '13px',
              fontWeight: activeTab === 'evaluate' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={16} color={activeTab === 'evaluate' ? '#7a542b' : '#735d47'} />
            <span>Model Accuracy</span>
          </button>

          {/* Data & Limitations Tab */}
          <button
            onClick={() => setActiveTab('limits')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: activeTab === 'limits' ? '1.5px solid #a67c4e' : '1.5px solid transparent',
              background: activeTab === 'limits' ? '#dfcdb5' : 'transparent',
              color: activeTab === 'limits' ? '#523412' : 'var(--text-muted, #735d47)',
              fontSize: '13px',
              fontWeight: activeTab === 'limits' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Info size={16} color={activeTab === 'limits' ? '#7a542b' : '#735d47'} />
            <span>Data & Limitations</span>
          </button>

          {/* Dark / Light Mode Toggle Icon */}
          {setTheme && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--border-color, #d8c6af)',
                background: 'var(--bg-widget, #faf5ec)',
                color: '#523412',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#d97706" />}
            </button>
          )}

          {/* User Profile Avatar (PS = Pune Station / Support) */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#dfcdb5',
            color: '#523412',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #c4ab89',
            boxShadow: '0 1px 3px rgba(80, 60, 40, 0.08)'
          }}>
            PS
          </div>
        </div>
      </nav>
    </header>
  );
};
