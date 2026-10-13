import type { FC } from 'react';
import { CloudRain, ShieldAlert, BarChart3, Info, Zap, RefreshCw, MapPin, Eye, Navigation, Sliders, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'evaluate' | 'limits';
  setActiveTab: (tab: 'map' | 'evaluate' | 'limits') => void;
  scenario: 'live' | 'storm_july2024';
  setScenario: (scen: 'live' | 'storm_july2024') => void;
  rainAgeMin: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenReportModal: () => void;
  showReportsLayer: boolean;
  setShowReportsLayer: (val: boolean) => void;
  isRoutePlannerOpen: boolean;
  onToggleRoutePlanner: () => void;
  onOpenAdminModal: () => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  scenario,
  setScenario,
  rainAgeMin,
  isLoading,
  onRefresh,
  onOpenReportModal,
  showReportsLayer,
  setShowReportsLayer,
  isRoutePlannerOpen,
  onToggleRoutePlanner,
  onOpenAdminModal,
  theme = 'light',
  setTheme
}) => {
  return (
    <header style={{ position: 'relative', zIndex: 1000, width: '100%' }}>
      {/* Persistent Disclaimer Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #b45309, #d97706)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '5px 12px',
        letterSpacing: '0.3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <ShieldAlert size={15} />
        <span>Decision-support prototype. Not an official emergency alert service. In emergencies, call PMC / 112 immediately.</span>
      </div>

      {/* Main Navbar Bar */}
      <nav className="glass" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('map')}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)'
          }}>
            <CloudRain size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
              JalDrishti <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-cyan)', background: 'var(--accent-cyan-light)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Pune Pilot</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Hyperlocal Road Inundation Forecasting (1–6 Hours Ahead)
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-pill)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'map' ? '#0284c7' : 'transparent',
              color: activeTab === 'map' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activeTab === 'map' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <CloudRain size={15} /> Early-Warning Map
          </button>

          <button
            onClick={() => setActiveTab('evaluate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'evaluate' ? '#0284c7' : 'transparent',
              color: activeTab === 'evaluate' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activeTab === 'evaluate' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <BarChart3 size={15} /> Model Accuracy
          </button>

          <button
            onClick={() => setActiveTab('limits')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'limits' ? '#0284c7' : 'transparent',
              color: activeTab === 'limits' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activeTab === 'limits' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Info size={15} /> Data & Limitations
          </button>
        </div>

        {/* Right Controls: Freshness & Scenario Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle Button */}
          {setTheme && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '7px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-pill)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {theme === 'light' ? <Moon size={13} color="#0284c7" /> : <Sun size={13} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          )}

          {/* Citizen Report Toggle */}
          <button
            onClick={() => setShowReportsLayer(!showReportsLayer)}
            title="Toggle Citizen Reports Layer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '7px',
              border: showReportsLayer ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              background: showReportsLayer ? 'var(--accent-cyan-light)' : 'var(--bg-pill)',
              color: showReportsLayer ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={13} />
            <span>Reports {showReportsLayer ? 'ON' : 'OFF'}</span>
          </button>

          {/* Plan Dry Route Action Button */}
          <button
            onClick={onToggleRoutePlanner}
            title="Mode-aware dry routing avoiding waterlogged roads"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: isRoutePlannerOpen ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              background: isRoutePlannerOpen ? 'var(--accent-cyan-light)' : 'var(--bg-pill)',
              color: isRoutePlannerOpen ? 'var(--accent-cyan)' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Navigation size={13} />
            <span>Plan Dry Route</span>
          </button>

          {/* Admin & What-If Sandbox Button */}
          <button
            onClick={onOpenAdminModal}
            title="What-If Storm Sandbox & Inspection Queue"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-pill)',
              color: 'var(--accent-cyan)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={13} />
            <span>Admin & Sandbox</span>
          </button>

          {/* + Report Waterlogging Action Button */}
          <button
            onClick={onOpenReportModal}
            title="Report localized waterlogging or road pooling"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <MapPin size={13} />
            <span>+ Report Flooding</span>
          </button>

          {/* Scenario Toggle */}
          <button
            onClick={() => setScenario(scenario === 'live' ? 'storm_july2024' : 'live')}
            title="Toggle between Live Forecast and Historical July 2024 Cloudburst Simulation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: scenario === 'storm_july2024' ? '1px solid #f97316' : '1px solid var(--border-color)',
              background: scenario === 'storm_july2024' ? 'var(--risk-high-bg)' : 'var(--bg-pill)',
              color: scenario === 'storm_july2024' ? 'var(--risk-high)' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {scenario === 'storm_july2024' ? (
              <>
                <Zap size={14} color="#f97316" /> July 2024 Storm Simulation
              </>
            ) : (
              <>
                <CloudRain size={14} color="#0284c7" /> Live Open-Meteo Mode
              </>
            )}
          </button>

          {/* Freshness Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: rainAgeMin > 45 ? '#dc2626' : (rainAgeMin > 20 ? '#d97706' : '#059669'),
            background: 'var(--bg-pill)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: rainAgeMin > 45 ? '#dc2626' : (rainAgeMin > 20 ? '#d97706' : '#059669'),
              boxShadow: `0 0 6px ${rainAgeMin > 45 ? '#dc2626' : (rainAgeMin > 20 ? '#d97706' : '#059669')}`
            }} />
            <span>Rain Data: {rainAgeMin}m ago</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh forecast predictions"
            style={{
              background: 'var(--bg-pill)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px 8px',
              color: 'var(--text-muted)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </nav>
    </header>
  );
};
