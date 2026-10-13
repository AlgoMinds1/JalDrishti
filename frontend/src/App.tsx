import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { TimeSlider } from './components/TimeSlider';
import { SegmentModal, type SegmentPredictionData } from './components/SegmentModal';
import { ReportModal } from './components/ReportModal';
import { RoutePlanner } from './components/RoutePlanner';
import { EvaluationPage } from './pages/EvaluationPage';
import { LimitationsPage } from './pages/LimitationsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'evaluate' | 'limits'>('map');
  const [currentHour, setCurrentHour] = useState<number>(1);
  const [scenario, setScenario] = useState<'live' | 'storm_july2024'>('live');
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [showReportsLayer, setShowReportsLayer] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [activeRouteGeojson, setActiveRouteGeojson] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentPredictionData | null>(null);
  const [rainAgeMin, setRainAgeMin] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({ low: 0, moderate: 0, high: 0, severe: 0 });

  // Fetch predictions for the active horizon and scenario
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `/api/predictions?hour=${currentHour}${scenario === 'storm_july2024' ? '&scenario=storm_july2024' : ''}`;
      const res = await axios.get(url);
      setGeojsonData(res.data);

      // Compute statistics
      const counts = { low: 0, moderate: 0, high: 0, severe: 0 };
      res.data.features?.forEach((f: any) => {
        const r = (f.properties?.risk_class || 'low') as keyof typeof counts;
        if (counts[r] !== undefined) {
          counts[r]++;
        } else {
          counts.low++;
        }
      });
      setStats(counts);

      // Check rain data age from first feature
      if (res.data.features?.[0]?.properties?.rain_data_age_min !== undefined) {
        setRainAgeMin(res.data.features[0].properties.rain_data_age_min);
      }
    } catch (err) {
      console.error('Failed to fetch predictions from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, scenario]);

  // Fetch citizen reports feed
  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get('/api/reports?hours=24');
      setReportsData(res.data);
    } catch (err) {
      // Backend offline or no reports
    }
  }, []);

  // Fetch health data for freshness
  const fetchHealth = useCallback(async () => {
    try {
      const res = await axios.get('/api/health');
      if (res.data?.rain_data_age_min !== undefined) {
        setRainAgeMin(res.data.rain_data_age_min);
      }
    } catch (err) {
      // Backend starting or offline
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchReports();
  }, [fetchHealth, fetchReports]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenario={scenario}
        setScenario={setScenario}
        rainAgeMin={rainAgeMin}
        isLoading={isLoading}
        onRefresh={fetchPredictions}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        showReportsLayer={showReportsLayer}
        setShowReportsLayer={setShowReportsLayer}
        isRoutePlannerOpen={isRoutePlannerOpen}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen(!isRoutePlannerOpen)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflowY: activeTab === 'map' ? 'hidden' : 'auto' }}>
        {activeTab === 'map' && (
          <>
            <MapComponent
              geojsonData={geojsonData}
              reportsData={reportsData}
              showReports={showReportsLayer}
              routeGeojson={activeRouteGeojson}
              onSelectSegment={(seg) => setSelectedSegment(seg)}
            />
            <TimeSlider
              currentHour={currentHour}
              setHour={(h) => setCurrentHour(h)}
              stats={stats}
            />
            <SegmentModal
              segment={selectedSegment}
              onClose={() => setSelectedSegment(null)}
            />
            <RoutePlanner
              isOpen={isRoutePlannerOpen}
              onClose={() => setIsRoutePlannerOpen(false)}
              onRouteCalculated={(routeGeo) => {
                setActiveRouteGeojson(routeGeo);
              }}
              onClearRoute={() => setActiveRouteGeojson(null)}
              currentHour={currentHour}
            />
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              onReportSubmitted={() => {
                fetchReports();
              }}
              defaultCoords={{ lat: 18.574, lon: 73.806 }}
            />
          </>
        )}

        {activeTab === 'evaluate' && <EvaluationPage />}
        {activeTab === 'limits' && <LimitationsPage />}
      </main>
    </div>
  );
}

export default App;
