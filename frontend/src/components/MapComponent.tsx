import { useEffect, useRef, useState, type FC } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Plus,
  Minus,
  Crosshair,
  Check
} from 'lucide-react';
import type { SegmentPredictionData } from './SegmentModal';

interface MapComponentProps {
  geojsonData: any;
  reportsData?: any;
  showReports?: boolean;
  routeGeojson?: any;
  showRainfall?: boolean;
  targetCoords?: { lat: number; lon: number; name: string } | null;
  onSelectSegment: (segment: SegmentPredictionData) => void;
}

export type BasemapKey = 'osm' | 'voyager' | 'esri_dark' | 'esri_streets';

interface BasemapOption {
  id: BasemapKey;
  name: string;
  tag: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    tag: 'Free · Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  {
    id: 'voyager',
    name: 'CartoDB Voyager',
    tag: 'Vibrant & Clean',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO, &copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  {
    id: 'esri_dark',
    name: 'Dark Canvas',
    tag: 'Sleek Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 16
  },
  {
    id: 'esri_streets',
    name: 'Esri World Street',
    tag: 'Clean Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
];

// Helper to center and adjust map view
const MapController: FC<{
  routeGeojson?: any;
  targetCoords?: { lat: number; lon: number } | null;
}> = ({ routeGeojson, targetCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo([targetCoords.lat, targetCoords.lon], 14, { duration: 1.2 });
    }
  }, [map, targetCoords]);

  useEffect(() => {
    if (routeGeojson && routeGeojson.geometry && routeGeojson.geometry.coordinates?.length) {
      const coords = routeGeojson.geometry.coordinates;
      const latlngs = coords.map((c: [number, number]) => [c[1], c[0]]);
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, routeGeojson]);

  return null;
};

// Helper to automatically recalculate map dimensions on layout transitions and orientation changes
const MapResizeHandler: FC = () => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  return null;
};

// Custom Right-Hand Controls (Zoom In, Zoom Out, Center, Layer menu) with 44px touch targets
const RightControls: FC<{
  onToggleLayerMenu: () => void;
  onResetCenter: () => void;
}> = ({ onToggleLayerMenu, onResetCenter }) => {
  const map = useMap();

  return (
    <div
      style={{
        position: 'absolute',
        right: '12px',
        top: '64px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #FFFCF6)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #E4DACA)',
          boxShadow: '0 4px 16px rgba(37, 37, 31, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Zoom In */}
        <button
          onClick={() => map.zoomIn()}
          aria-label="Zoom in"
          title="Zoom In"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-color, #E4DACA)',
            transition: 'background 0.15s ease'
          }}
        >
          <Plus size={20} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => map.zoomOut()}
          aria-label="Zoom out"
          title="Zoom Out"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-color, #E4DACA)',
            transition: 'background 0.15s ease'
          }}
        >
          <Minus size={20} />
        </button>

        {/* Center to Pune */}
        <button
          onClick={() => {
            map.flyTo([18.538, 73.845], 13, { duration: 1.0 });
            onResetCenter();
          }}
          aria-label="Reset view to Pune Pilot"
          title="Reset View to Pune Pilot"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-color, #E4DACA)',
            transition: 'background 0.15s ease'
          }}
        >
          <Crosshair size={20} />
        </button>

        {/* Layers */}
        <button
          onClick={onToggleLayerMenu}
          aria-label="Change map layers"
          title="Change Basemap Layers"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main, #25251F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <Layers size={20} />
        </button>
      </div>
    </div>
  );
};

// Custom Leaflet Icons for Badges
const warningIcon = L.divIcon({
  className: 'custom-warning-marker',
  html: `
    <div style="
      background: #fbbf24;
      width: 26px;
      height: 26px;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 2px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      filter: drop-shadow(0px 2px 4px rgba(245, 158, 11, 0.5));
    ">
      <div style="
        background: #000000;
        width: 3px;
        height: 9px;
        border-radius: 1px;
        margin-bottom: 2px;
      "></div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 20]
});

const floodWaveIcon = L.divIcon({
  className: 'custom-flood-marker',
  html: `
    <div style="
      background: #ef4444;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5);
    ">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0"/>
        <path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0"/>
      </svg>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const localityLabelIcon = (name: string, isBig: boolean = false) => L.divIcon({
  className: 'locality-label',
  html: `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${isBig ? '18px' : '11px'};
      font-weight: ${isBig ? '800' : '600'};
      color: ${isBig ? '#0f172a' : '#334155'};
      text-shadow: 0 0 4px #ffffff, 0 0 8px #ffffff;
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: ${isBig ? '-0.5px' : '0.2px'};
    ">
      ${name}
    </div>
  `,
  iconSize: [100, 20],
  iconAnchor: [50, 10]
});

const airportIcon = L.divIcon({
  className: 'airport-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: #6b21a8;
      text-shadow: 0 0 4px #ffffff, 0 0 6px #ffffff;
      white-space: nowrap;
    ">
      <span style="font-size: 14px;">✈️</span>
      <span>Pune International Airport</span>
    </div>
  `,
  iconSize: [180, 20],
  iconAnchor: [10, 10]
});

const vetalTekdiIcon = L.divIcon({
  className: 'vetal-tekdi-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: #15803d;
      text-shadow: 0 0 4px #ffffff, 0 0 6px #ffffff;
      white-space: nowrap;
    ">
      <span style="font-size: 13px;">▲</span>
      <span>Vetal Tekdi</span>
    </div>
  `,
  iconSize: [120, 20],
  iconAnchor: [10, 10]
});

export const MapComponent: FC<MapComponentProps> = ({
  geojsonData,
  reportsData,
  showReports = true,
  routeGeojson,
  showRainfall = true,
  targetCoords,
  onSelectSegment
}) => {
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapKey>('osm');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  const activeBasemap = BASEMAP_OPTIONS.find((b) => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];

  const handleBasemapChange = (id: BasemapKey) => {
    setSelectedBasemap(id);
    setIsLayerMenuOpen(false);
  };

  const getSegmentColor = (riskClass: string) => {
    switch (riskClass) {
      case 'severe':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'moderate':
        return '#f59e0b'; // Amber/Yellow
      case 'low':
      default:
        return '#10b981'; // Green
    }
  };

  const styleFeature = (feature: any) => {
    const risk = feature?.properties?.risk_class || 'low';
    const isUnderpass = feature?.properties?.is_underpass;
    const isMajor = risk === 'severe' || risk === 'high';
    return {
      color: getSegmentColor(risk),
      weight: isUnderpass ? 6 : (isMajor ? 4.8 : 3.6),
      opacity: 0.92,
      lineCap: 'round' as const,
      lineJoin: 'round' as const
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const name = props.name || props.id || 'Road Segment';
    const risk = (props.risk_class || 'low').toUpperCase();
    const prob = Math.round((props.probability || 0) * 100);

    layer.bindTooltip(
      `<strong>${name}</strong><br/>Risk: <span style="font-weight:700; color:${getSegmentColor(props.risk_class || 'low')}">${risk} (${prob}%)</span>`,
      { sticky: true, className: 'leaflet-tooltip' }
    );

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 7,
          opacity: 1
        });
      },
      mouseout: (e) => {
        if (geojsonLayerRef.current) {
          geojsonLayerRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        onSelectSegment({
          segment_id: props.id || props.segment_id,
          name: props.name,
          road_class: props.road_class,
          length_m: props.length_m,
          is_underpass: props.is_underpass,
          horizon_h: props.horizon_h || 1,
          risk_class: props.risk_class || 'low',
          probability: props.probability || 0.0,
          confidence_level: props.confidence_level || 'High',
          confidence_score: props.confidence_score || 0.95,
          conf_set_size: props.conf_set_size || 1,
          top_reasons: props.top_reasons || ['Terrain and drainage capacity normal.'],
          rain_data_age_min: props.rain_data_age_min || 0,
          is_ood: props.is_ood || false
        });
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={[18.538, 73.845]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapResizeHandler />
        <MapController routeGeojson={routeGeojson} targetCoords={targetCoords} />
        
        <RightControls
          onToggleLayerMenu={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          onResetCenter={() => {
            // Handled via reset target
          }}
        />

        {/* Basemap Layer */}
        <TileLayer
          key={activeBasemap.id}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
          maxZoom={activeBasemap.maxZoom}
        />

        {/* Live Rainfall Radar Simulation Layer (soft blue rain clouds) */}
        {showRainfall && (
          <TileLayer
            key="rain_layer"
            opacity={0.18}
            url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=439d4b804bc8187953eb36d2a8c26a02"
            maxZoom={18}
          />
        )}

        {/* Road Inundation Prediction Polylines */}
        {geojsonData && (
          <GeoJSON
            key={JSON.stringify(geojsonData.name || 'geojson') + geojsonData.features?.length}
            ref={geojsonLayerRef}
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Yellow Warning Triangle Markers at Critical Chokepoints */}
        <Marker position={[18.571, 73.874]} icon={warningIcon} />
        <Marker position={[18.538, 73.896]} icon={warningIcon} />
        <Marker position={[18.528, 73.824]} icon={warningIcon} />
        <Marker position={[18.503, 73.924]} icon={warningIcon} />

        {/* Red Circular Flood Inundation Badges at Rivers & Underpasses */}
        <Marker position={[18.572, 73.808]} icon={floodWaveIcon} />
        <Marker position={[18.536, 73.882]} icon={floodWaveIcon} />

        {/* Central "Pune" Label */}
        <Marker position={[18.528, 73.858]} icon={localityLabelIcon('Pune', true)} />

        {/* Landmark Pins */}
        <Marker position={[18.579, 73.918]} icon={airportIcon} />
        <Marker position={[18.519, 73.818]} icon={vetalTekdiIcon} />

        {/* Locality Labels */}
        <Marker position={[18.591, 73.738]} icon={localityLabelIcon('Hinjawadi')} />
        <Marker position={[18.598, 73.766]} icon={localityLabelIcon('Wakad')} />
        <Marker position={[18.596, 73.798]} icon={localityLabelIcon('Pimple Saudagar')} />
        <Marker position={[18.580, 73.792]} icon={localityLabelIcon('Pimple Nilakh')} />
        <Marker position={[18.572, 73.818]} icon={localityLabelIcon('Old Sangvi')} />
        <Marker position={[18.559, 73.787]} icon={localityLabelIcon('Baner')} />
        <Marker position={[18.558, 73.807]} icon={localityLabelIcon('Aundh')} />
        <Marker position={[18.563, 73.850]} icon={localityLabelIcon('Khadki')} />
        <Marker position={[18.572, 73.872]} icon={localityLabelIcon('Vishrantwadi')} />
        <Marker position={[18.536, 73.895]} icon={localityLabelIcon('Koregaon Park')} />
        <Marker position={[18.549, 73.905]} icon={localityLabelIcon('Kalyani Nagar')} />
        <Marker position={[18.567, 73.914]} icon={localityLabelIcon('Viman Nagar')} />
        <Marker position={[18.532, 73.935]} icon={localityLabelIcon('Keshav Nagar')} />
        <Marker position={[18.508, 73.926]} icon={localityLabelIcon('Hadapsar')} />
        <Marker position={[18.507, 73.808]} icon={localityLabelIcon('Kothrud')} />
        <Marker position={[18.455, 73.858]} icon={localityLabelIcon('Katraj')} />

        {/* Planned Dry Navigation Route */}
        {routeGeojson && (
          <GeoJSON
            key={"nav_route_" + JSON.stringify(routeGeojson.geometry?.coordinates?.length)}
            data={routeGeojson}
            style={() => ({
              color: 'var(--accent-beige-dark, #4b4836)',
              weight: 7,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            })}
          />
        )}

        {/* Citizen Reports */}
        {showReports && reportsData && (
          <GeoJSON
            key={"citizen_reports_" + reportsData.features?.length}
            data={reportsData}
            pointToLayer={(_feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 7,
                fillColor: 'var(--accent-cyan, #77745B)',
                color: "#ffffff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.95
              });
            }}
          />
        )}
      </MapContainer>

      {/* Basemap Selection Popup Overlay (Dismissible on tap outside) */}
      {isLayerMenuOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 950,
            background: 'transparent'
          }}
          onClick={() => setIsLayerMenuOpen(false)}
        >
          <div
            className="animate-slide-up"
            style={{
              position: 'absolute',
              top: '116px',
              right: '64px',
              background: 'var(--bg-card, #FFFCF6)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #E4DACA)',
              padding: '8px',
              boxShadow: '0 8px 24px rgba(37, 37, 31, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '200px',
              maxWidth: 'calc(100vw - 80px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #706D62)', padding: '4px 8px' }}>
              Select Basemap
            </div>
            {BASEMAP_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedBasemap;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleBasemapChange(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                    color: isSelected ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-main, #25251F)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-pill, #E7DDCC)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{opt.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #706D62)' }}>{opt.tag}</div>
                  </div>
                  {isSelected && <Check size={14} color="var(--accent-cyan, #77745B)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
