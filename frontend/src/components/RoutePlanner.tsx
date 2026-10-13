import { useState, type FC } from 'react';
import axios from 'axios';
import { Navigation, X } from 'lucide-react';

interface RoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCalculated: (routeGeojson: any, riskiestSegment: any, wording: string) => void;
  onClearRoute?: () => void;
  currentHour: number;
}

export const RoutePlanner: FC<RoutePlannerProps> = ({
  isOpen,
  onClose,
  onRouteCalculated,
  onClearRoute,
  currentHour
}) => {
  const [mode, setMode] = useState<'walk' | 'two_wheeler' | 'car'>('car');
  const [origin, setOrigin] = useState<string>('baner');
  const [destination, setDestination] = useState<string>('aundh');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset Pune Pilot Coordinates
  const PRESET_COORDS: Record<string, [number, number]> = {
    baner: [18.559, 73.788],
    aundh: [18.574, 73.808],
    pashan: [18.541, 73.791],
    sangvi_phata: [18.572, 73.807],
    khadki: [18.568, 73.868]
  };

  const handleCalculateRoute = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [start_lat, start_lon] = PRESET_COORDS[origin];
      const [end_lat, end_lon] = PRESET_COORDS[destination];

      const res = await axios.post('/api/routes', {
        start_lat,
        start_lon,
        end_lat,
        end_lon,
        mode,
        horizon_h: currentHour
      });

      setRouteInfo(res.data);
      onRouteCalculated(
        res.data.route_geojson,
        res.data.riskiest_segment,
        res.data.wording_disclaimer
      );
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to calculate route across pilot network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '24px',
      left: '24px',
      width: '380px',
      maxWidth: 'calc(100vw - 48px)',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div className="glass" style={{
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-widget)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Mode-Aware Route Planner
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Travel Mode Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {[
            { id: 'walk', label: '🚶 Walk' },
            { id: 'two_wheeler', label: '🛵 2-Wheeler' },
            { id: 'car', label: '🚗 Car' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              style={{
                background: mode === m.id ? '#0284c7' : 'var(--bg-pill)',
                border: mode === m.id ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                color: mode === m.id ? '#ffffff' : 'var(--text-main)',
                padding: '8px 4px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: mode === m.id ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Origin & Destination Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Origin:</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-pill)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                borderRadius: '6px',
                marginTop: '4px',
                outline: 'none'
              }}
            >
              <option value="baner">Baner Road Corridor</option>
              <option value="pashan">Pashan Circle</option>
              <option value="sangvi_phata">Sangvi Phata</option>
              <option value="khadki">Khadki Crossing</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Destination:</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-pill)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                borderRadius: '6px',
                marginTop: '4px',
                outline: 'none'
              }}
            >
              <option value="aundh">Aundh Corridor</option>
              <option value="sangvi_phata">Sangvi Phata Junction</option>
              <option value="pashan">Pashan Lake Area</option>
              <option value="baner">Baner Foothills</option>
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculateRoute}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}
        >
          {isLoading ? 'Calculating Risk Path...' : 'Find Route With Lower Predicted Risk'}
        </button>

        {errorMessage && (
          <div style={{ fontSize: '12px', color: 'var(--risk-severe)' }}>{errorMessage}</div>
        )}

        {/* Route Details Card */}
        {routeInfo && (
          <div style={{
            background: 'var(--bg-pill)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Distance & Time:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {(routeInfo.total_distance_m / 1000).toFixed(1)} km • ~{routeInfo.estimated_time_min} mins
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Riskiest Corridor:</span>
              <span style={{
                fontWeight: 600,
                color: routeInfo.riskiest_segment.risk_class === 'severe' ? 'var(--risk-severe)' : (routeInfo.riskiest_segment.risk_class === 'high' ? 'var(--risk-high)' : 'var(--risk-low)')
              }}>
                {routeInfo.riskiest_segment.name} ({Math.round(routeInfo.riskiest_segment.probability * 100)}%)
              </span>
            </div>

            <div style={{
              background: 'var(--accent-cyan-light)',
              borderLeft: '3px solid var(--accent-cyan)',
              padding: '6px 8px',
              borderRadius: '4px',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontWeight: 500
            }}>
              ℹ️ {routeInfo.wording_disclaimer}
            </div>

            <button
              onClick={() => {
                setRouteInfo(null);
                if (onClearRoute) onClearRoute();
              }}
              style={{
                background: 'var(--risk-severe-bg)',
                border: '1px solid var(--risk-severe-border)',
                color: 'var(--risk-severe)',
                padding: '6px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Clear Route from Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
