import { useEffect, useRef, type FC } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { SegmentPredictionData } from './SegmentModal';

interface MapComponentProps {
  geojsonData: any;
  onSelectSegment: (segment: SegmentPredictionData) => void;
}

// Helper to center and adjust map view
const MapController: FC = () => {
  const map = useMap();
  useEffect(() => {
    map.setView([18.552, 73.815], 13);
  }, [map]);
  return null;
};

export const MapComponent: FC<MapComponentProps> = ({ geojsonData, onSelectSegment }) => {
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

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
      <MapContainer
        center={[18.552, 73.815]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController />
        {/* Crisp Carto Voyager Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
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
      </MapContainer>
    </div>
  );
};
