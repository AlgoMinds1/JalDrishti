import { useState, type FC } from 'react';
import { Search, CloudRain } from 'lucide-react';

interface TopControlsProps {
  showRainfall: boolean;
  setShowRainfall: (show: boolean) => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
}

const PUNE_PRESET_LOCATIONS = [
  { name: 'Viman Nagar', lat: 18.5679, lon: 73.9143 },
  { name: 'FC Road', lat: 18.5284, lon: 73.8423 },
  { name: 'Baner', lat: 18.5590, lon: 73.7868 },
  { name: 'Aundh', lat: 18.5580, lon: 73.8070 },
  { name: 'Kothrud', lat: 18.5074, lon: 73.8077 },
  { name: 'Koregaon Park', lat: 18.5362, lon: 73.8940 },
  { name: 'Vishrantwadi', lat: 18.5684, lon: 73.8765 },
  { name: 'Hinjawadi', lat: 18.5912, lon: 73.7389 },
  { name: 'Wakad', lat: 18.5987, lon: 73.7663 },
  { name: 'Khadki', lat: 18.5630, lon: 73.8504 },
  { name: 'Hadapsar', lat: 18.5089, lon: 73.9260 },
  { name: 'Katraj', lat: 18.4485, lon: 73.8588 }
];

export const TopControls: FC<TopControlsProps> = ({
  showRainfall,
  setShowRainfall,
  onSelectLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredLocations = PUNE_PRESET_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      zIndex: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {/* Left: Location Search Bar in Warm Beige */}
      <div style={{ position: 'relative', pointerEvents: 'auto', width: '340px' }}>
        <div style={{
          background: 'var(--bg-widget, #faf5ec)',
          borderRadius: '9999px',
          border: '1px solid var(--border-color, #d8c6af)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 16px rgba(80, 60, 40, 0.08)'
        }}>
          <Search size={16} color="#8f6738" />
          <input
            type="text"
            placeholder="Search location (e.g. Viman Nagar, FC Road)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '13px',
              color: 'var(--text-main, #2e2214)',
              width: '100%'
            }}
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div style={{
            position: 'absolute',
            top: '44px',
            left: 0,
            right: 0,
            background: 'var(--bg-widget, #faf5ec)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #d8c6af)',
            boxShadow: '0 10px 25px rgba(80, 60, 40, 0.12)',
            overflow: 'hidden',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <div
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation(loc.lat, loc.lon, loc.name);
                    setSearchQuery(loc.name);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '9px 16px',
                    fontSize: '13px',
                    color: '#2e2214',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #ebdcc8'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e5d7c3'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: '#8f6738' }}>📍</span>
                  <span>{loc.name}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 16px', fontSize: '12px', color: '#735d47' }}>
                No matching location in pilot zone
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Live Rainfall Toggle Pill in Beige */}
      <div style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => setShowRainfall(!showRainfall)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #d8c6af)',
            background: 'var(--bg-widget, #faf5ec)',
            boxShadow: '0 3px 12px rgba(80, 60, 40, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloudRain size={16} color="#8f6738" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #2e2214)' }}>
              Live Rainfall
            </span>
          </div>

          {/* Warm Beige toggle slider */}
          <div style={{
            width: '38px',
            height: '22px',
            borderRadius: '11px',
            background: showRainfall ? '#9e7340' : '#d8c6af',
            position: 'relative',
            transition: 'background 0.2s ease'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: showRainfall ? '18px' : '2px',
              transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
        </button>
      </div>
    </div>
  );
};
