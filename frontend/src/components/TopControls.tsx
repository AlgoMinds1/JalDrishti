import { useState, type FC } from 'react';
import { Search, X, CloudRain } from 'lucide-react';

interface TopControlsProps {
  showRainfall: boolean;
  setShowRainfall: (show: boolean) => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
}

const PUNE_PRESET_LOCATIONS = [
  { name: 'Viman Nagar', lat: 18.5679, lon: 73.9143 },
  { name: 'FC Road (Shivajinagar)', lat: 18.5284, lon: 73.8423 },
  { name: 'Baner Main Road', lat: 18.5590, lon: 73.7868 },
  { name: 'Aundh (Bremen Chowk)', lat: 18.5580, lon: 73.8070 },
  { name: 'Kothrud (Paud Road)', lat: 18.5074, lon: 73.8077 },
  { name: 'Koregaon Park (North Main Rd)', lat: 18.5362, lon: 73.8940 },
  { name: 'Vishrantwadi Chowk', lat: 18.5684, lon: 73.8765 },
  { name: 'Hinjawadi Phase 1', lat: 18.5912, lon: 73.7389 },
  { name: 'Wakad Bridge', lat: 18.5987, lon: 73.7663 },
  { name: 'Khadki Underpass', lat: 18.5630, lon: 73.8504 },
  { name: 'Hadapsar Gadital', lat: 18.5089, lon: 73.9260 },
  { name: 'Katraj Tunnel Approach', lat: 18.4485, lon: 73.8588 }
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

  const handleClear = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      {/* Floating Location Search Field */}
      <div
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          flex: 1,
          maxWidth: '420px'
        }}
      >
        <div
          style={{
            background: 'var(--bg-card, #FFFCF6)',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #E4DACA)',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(37, 37, 31, 0.08)'
          }}
        >
          <Search size={16} color="var(--accent-cyan, #77745B)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search roads or locations in Pune"
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
              color: 'var(--text-main, #25251F)',
              width: '100%'
            }}
          />
          {searchQuery.length > 0 && (
            <button
              onClick={handleClear}
              aria-label="Clear search input"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #706D62)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                flexShrink: 0
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions Overlay */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: 0,
              right: 0,
              background: 'var(--bg-card, #FFFCF6)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #E4DACA)',
              boxShadow: '0 8px 24px rgba(37, 37, 31, 0.12)',
              overflow: 'hidden',
              maxHeight: '220px',
              overflowY: 'auto',
              zIndex: 1000
            }}
          >
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
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: 'var(--text-main, #25251F)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid var(--border-subtle, #eee7db)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: 'var(--accent-cyan, #77745B)', fontSize: '13px' }}>📍</span>
                  <span>{loc.name}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-muted, #706D62)' }}>
                No matching road or location found in pilot corridor
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Rainfall Quick Toggle (Visible on Desktop) */}
      <div className="desktop-only" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => setShowRainfall(!showRainfall)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #E4DACA)',
            background: 'var(--bg-card, #FFFCF6)',
            boxShadow: '0 3px 12px rgba(37, 37, 31, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloudRain size={16} color="var(--accent-cyan, #77745B)" />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main, #25251F)' }}>
              Live Rainfall
            </span>
          </div>

          <div
            style={{
              width: '34px',
              height: '20px',
              borderRadius: '10px',
              background: showRainfall ? 'var(--accent-beige, #77745B)' : 'var(--border-color, #E4DACA)',
              position: 'relative',
              transition: 'background 0.2s ease'
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: '2px',
                left: showRainfall ? '16px' : '2px',
                transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </button>
      </div>
    </div>
  );
};
