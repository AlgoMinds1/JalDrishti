import type { FC } from 'react';
import { CloudRain, ShieldAlert, BarChart3, Info, Zap, RefreshCw, MapPin, Eye } from 'lucide-react';

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
  setShowReportsLayer
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: '#f8fafc' }}>
              JalDrishti <span style={{ fontSize: '12px', fontWeight: 500, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Pune Pilot</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Hyperlocal Road Inundation Forecasting (1–6 Hours Ahead)
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
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
              color: activeTab === 'map' ? '#fff' : '#94a3b8',
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
              color: activeTab === 'evaluate' ? '#fff' : '#94a3b8',
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
              color: activeTab === 'limits' ? '#fff' : '#94a3b8',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              border: showReportsLayer ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              background: showReportsLayer ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.5)',
              color: showReportsLayer ? '#38bdf8' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={13} />
            <span>Reports {showReportsLayer ? 'ON' : 'OFF'}</span>
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
              border: scenario === 'storm_july2024' ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.12)',
              background: scenario === 'storm_july2024' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              color: scenario === 'storm_july2024' ? '#fdba74' : '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {scenario === 'storm_july2024' ? (
              <>
                <Zap size={14} color="#f97316" /> July 2024 Cloudburst Simulation
              </>
            ) : (
              <>
                <CloudRain size={14} color="#38bdf8" /> Live Open-Meteo Mode
              </>
            )}
          </button>

          {/* Freshness Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: rainAgeMin > 45 ? '#f87171' : (rainAgeMin > 20 ? '#fbbf24' : '#34d399'),
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: rainAgeMin > 45 ? '#ef4444' : (rainAgeMin > 20 ? '#f59e0b' : '#10b981'),
              boxShadow: `0 0 6px ${rainAgeMin > 45 ? '#ef4444' : (rainAgeMin > 20 ? '#f59e0b' : '#10b981')}`
            }} />
            <span>Rain Data: {rainAgeMin}m ago</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh forecast predictions"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 8px',
              color: '#94a3b8',
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
