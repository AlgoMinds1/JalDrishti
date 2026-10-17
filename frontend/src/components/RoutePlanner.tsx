import { useState, type FC } from 'react';
import axios from 'axios';
import { Navigation, X, ShieldAlert, CheckCircle, ArrowRight, WifiOff } from 'lucide-react';
import { offlineRouter } from '../utils/offlineRouter';

interface RoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCalculated: (routeGeojson: any, riskiestSegment: any, wording: string) => void;
  onClearRoute?: () => void;
  currentHour: number;
  currentPredictions?: any;
}

export const RoutePlanner: FC<RoutePlannerProps> = ({
  isOpen,
  onClose,
  onRouteCalculated,
  onClearRoute,
  currentHour,
  currentPredictions
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
    const [start_lat, start_lon] = PRESET_COORDS[origin];
    const [end_lat, end_lon] = PRESET_COORDS[destination];

    try {
      if (!navigator.onLine) {
        throw new Error('Device is offline');
      }

      const res = await axios.post(
        '/api/routes',
        {
          start_lat,
          start_lon,
          end_lat,
          end_lon,
          mode,
          horizon_h: currentHour
        },
        { timeout: 1500 }
      );

      setRouteInfo(res.data);
      onRouteCalculated(
        res.data.route_geojson,
        res.data.riskiest_segment,
        res.data.wording_disclaimer
      );
    } catch {
      // Automatic fallback to 100% offline client-side Dijkstra router
      try {
        const offlineResult = await offlineRouter.findRoute(
          start_lat,
          start_lon,
          end_lat,
          end_lon,
          mode,
          currentPredictions
        );
        setRouteInfo({ ...offlineResult, isOfflineCalculated: true });
        onRouteCalculated(
          offlineResult.route_geojson,
          offlineResult.riskiest_segment,
          offlineResult.wording_disclaimer
        );
      } catch (offlineErr: any) {
        setErrorMessage(offlineErr.message || 'Failed to calculate route across pilot network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog-medium"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Mobile Drag handle */}
        <div className="sheet-drag-handle modal-drag-handle" />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color, #E4DACA)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="var(--accent-cyan, #77745B)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
              Mode-Aware Dry Route Planner
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close route planner"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #706D62)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          {/* Mode Selector */}
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
                  background: mode === m.id ? 'var(--accent-beige, #77745B)' : 'var(--bg-widget, #FFFCF6)',
                  border: mode === m.id ? '1px solid var(--accent-beige-dark, #4b4836)' : '1px solid var(--border-color, #E4DACA)',
                  color: mode === m.id ? '#ffffff' : 'var(--text-main, #25251F)',
                  padding: '9px 4px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: mode === m.id ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: mode === m.id ? '0 2px 8px rgba(119, 116, 91, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Origin & Destination Selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Origin:
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #E4DACA)',
                  background: 'var(--bg-primary, #F5F0E7)',
                  color: 'var(--text-main, #25251F)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="baner">Baner Road (Pan Card Club Rd)</option>
                <option value="pashan">Pashan Lake / Sus Phata</option>
                <option value="aundh">Aundh (Bremen Chowk)</option>
                <option value="sangvi_phata">Old Sangvi Phata</option>
                <option value="khadki">Khadki Railway Station</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted, #706D62)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Destination:
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #E4DACA)',
                  background: 'var(--bg-primary, #F5F0E7)',
                  color: 'var(--text-main, #25251F)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="aundh">Aundh (Bremen Chowk)</option>
                <option value="baner">Baner Road (High Street)</option>
                <option value="sangvi_phata">Old Sangvi Phata</option>
                <option value="pashan">Pashan Circle</option>
                <option value="khadki">Khadki Bazaar</option>
              </select>
            </div>
          </div>

          {/* Calculate Route CTA */}
          <button
            onClick={handleCalculateRoute}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--accent-beige, #77745B)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 12px rgba(119, 116, 91, 0.25)'
            }}
          >
            {isLoading ? 'Optimizing dry path...' : 'Calculate Safe Dry Route'}
            <ArrowRight size={15} />
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'var(--risk-severe-bg)',
                border: '1px solid var(--risk-severe-border)',
                color: 'var(--risk-severe)',
                fontSize: '12px'
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Calculated Route Summary Result */}
          {routeInfo && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--bg-primary, #F5F0E7)',
                border: '1px solid var(--border-color, #E4DACA)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-green, #16866A)' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>
                    Route Calculated Successfully
                  </span>
                </div>
                {routeInfo.isOfflineCalculated && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#ECE8DF',
                    color: '#77745B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <WifiOff size={11} /> Offline Engine
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-sub, #444238)' }}>
                <strong>Distance:</strong> {Math.round(routeInfo.total_distance_m || routeInfo.distance_m || 2400)} m
              </div>

              {routeInfo.riskiest_segment && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--risk-high-bg)',
                    border: '1px solid var(--risk-high-border)',
                    fontSize: '11.5px',
                    color: 'var(--risk-high)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <ShieldAlert size={14} />
                    <span>Riskiest Node: {routeInfo.riskiest_segment.name || 'Corridor Link'}</span>
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    Predicted risk: {routeInfo.riskiest_segment.risk_class} ({Math.round(routeInfo.riskiest_segment.probability * 100)}%)
                  </div>
                </div>
              )}

              {onClearRoute && (
                <button
                  onClick={() => {
                    setRouteInfo(null);
                    onClearRoute();
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color, #E4DACA)',
                    borderRadius: '8px',
                    padding: '7px',
                    fontSize: '12px',
                    color: 'var(--text-muted, #706D62)',
                    cursor: 'pointer'
                  }}
                >
                  Clear Route from Map
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
