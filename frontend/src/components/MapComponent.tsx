import { useEffect, useRef, useState, type FC } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, ZoomIn, ZoomOut, Check } from 'lucide-react';
import type { SegmentPredictionData } from './SegmentModal';

interface MapComponentProps {
  geojsonData: any;
  reportsData?: any;
  showReports?: boolean;
  routeGeojson?: any;
  onSelectSegment: (segment: SegmentPredictionData) => void;
}

export type BasemapKey = 'osm' | 'esri_dark' | 'esri_streets' | 'esri_topo';

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
    tag: 'Free · Default',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  {
    id: 'esri_dark',
    name: 'Dark Canvas',
    tag: 'Sleek Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  {
    id: 'esri_streets',
    name: 'Esri World Street',
    tag: 'Clean Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, TomTom',
    maxZoom: 19
  },
  {
    id: 'esri_topo',
    name: 'Topographic Terrain',
    tag: 'Elevation & Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USGS, Esri',
    maxZoom: 19
  }
];

// Helper to center and adjust map view
const MapController: FC<{ routeGeojson?: any }> = ({ routeGeojson }) => {
  const map = useMap();
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

// Custom Zoom Controls inside Leaflet
const CustomZoomControl: FC = () => {
  const map = useMap();
  return (
    <div style={{
      position: 'absolute',
      right: '16px',
      bottom: '120px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <button
        onClick={() => map.zoomIn()}
        title="Zoom In"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(19, 27, 46, 0.92)',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.15s ease'
        }}
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(19, 27, 46, 0.92)',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.15s ease'
        }}
      >
        <ZoomOut size={18} />
      </button>
    </div>
  );
};

export const MapComponent: FC<MapComponentProps> = ({
  geojsonData,
  reportsData,
  showReports = true,
  routeGeojson,
  onSelectSegment
}) => {
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapKey>(() => {
    return (localStorage.getItem('jaldrishti_basemap') as BasemapKey) || 'osm';
  });
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  const activeBasemap = BASEMAP_OPTIONS.find((b) => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];

  const handleBasemapChange = (id: BasemapKey) => {
    setSelectedBasemap(id);
    localStorage.setItem('jaldrishti_basemap', id);
    setIsLayerMenuOpen(false);
  };

  const getSegmentColor = (riskClass: string) => {
    switch (riskClass) {
      case 'severe':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'moderate':
        return '#f59e0b';
      case 'low':
      default:
        return '#10b981';
    }
  };

  const styleFeature = (feature: any) => {
    const risk = feature?.properties?.risk_class || 'low';
    const isUnderpass = feature?.properties?.is_underpass;
    return {
      color: getSegmentColor(risk),
      weight: isUnderpass ? 6 : 4,
      opacity: 0.88,
      lineCap: 'round' as const,
      lineJoin: 'round' as const
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const name = props.name || props.id || 'Road Segment';
    const risk = (props.risk_class || 'low').toUpperCase();
    const prob = Math.round((props.probability || 0) * 100);

    // Simple, clean tooltip on hover
    layer.bindTooltip(
      `<strong>${name}</strong><br/>Risk: <span style="font-weight:700;">${risk} (${prob}%)</span>`,
      { sticky: true, className: 'leaflet-tooltip' }
    );

    // Click handler to open segment drawer
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
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 95px)', overflow: 'hidden' }}>
      {/* Floating Basemap Selector Widget */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px'
      }}>
        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            background: 'rgba(19, 27, 46, 0.92)',
            backdropFilter: 'blur(12px)',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={16} color="#38bdf8" />
          <span>Map: {activeBasemap.name}</span>
        </button>

        {isLayerMenuOpen && (
          <div style={{
            background: 'rgba(19, 27, 46, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '220px'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#94a3b8',
              fontWeight: 700,
              padding: '4px 8px 6px'
            }}>
              Select Basemap (No Key Needed)
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
                    background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: isSelected ? '#38bdf8' : '#e2e8f0',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{opt.name}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{opt.tag}</div>
                  </div>
                  {isSelected && <Check size={14} color="#38bdf8" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <MapContainer
        center={[18.552, 73.815]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController routeGeojson={routeGeojson} />
        <CustomZoomControl />

        {/* Dynamic Basemap Layer */}
        <TileLayer
          key={activeBasemap.id}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
          maxZoom={activeBasemap.maxZoom}
        />

        {geojsonData && (
          <GeoJSON
            key={JSON.stringify(geojsonData.name || 'geojson') + geojsonData.features?.length}
            ref={geojsonLayerRef}
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Planned Dry Navigation Route */}
        {routeGeojson && (
          <GeoJSON
            key={"nav_route_" + JSON.stringify(routeGeojson.geometry?.coordinates?.length)}
            data={routeGeojson}
            style={() => ({
              color: '#0284c7',
              weight: 7,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: undefined
            })}
            onEachFeature={(feat, layer) => {
              const p = feat.properties || {};
              layer.bindTooltip(
                `<strong>Dry Navigation Route (${p.mode?.toUpperCase() || 'MODE'})</strong><br/>` +
                `Distance: ${(p.distance_m / 1000).toFixed(1)} km (~${p.estimated_time_min} mins)<br/>` +
                `<span style="color:#0284c7;font-weight:600;">${p.advisory}</span>`,
                { sticky: true, className: 'leaflet-tooltip' }
              );
            }}
          />
        )}

        {showReports && reportsData && (
          <GeoJSON
            key={"citizen_reports_" + reportsData.features?.length}
            data={reportsData}
            pointToLayer={(feature, latlng) => {
              const state = feature.properties?.state || "Unverified";
              const fillColor = state === "Confirmed" ? "#38bdf8" : (state === "Likely" ? "#f59e0b" : "#94a3b8");
              return L.circleMarker(latlng, {
                radius: 7,
                fillColor: fillColor,
                color: "#ffffff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.95
              });
            }}
            onEachFeature={(feature, layer) => {
              const p = feature.properties || {};
              layer.bindTooltip(
                `<strong>Citizen Report (${p.state})</strong><br/>"${p.text}"<br/><span style="color:#38bdf8;">Trust: ${p.trust_score}/100</span>`,
                { sticky: true, className: 'leaflet-tooltip' }
              );
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

