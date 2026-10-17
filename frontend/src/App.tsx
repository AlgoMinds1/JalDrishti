import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MapComponent } from './components/MapComponent';
import { TopControls } from './components/TopControls';
import { RiskLegend } from './components/RiskLegend';
import { TimeSlider } from './components/TimeSlider';
import { SegmentModal, type SegmentPredictionData } from './components/SegmentModal';
import { ReportModal } from './components/ReportModal';
import { RoutePlanner } from './components/RoutePlanner';
import { AdminSandboxModal } from './components/AdminSandboxModal';
import { AdminNotificationModal } from './components/AdminNotificationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { EvaluationPage } from './pages/EvaluationPage';
import { LimitationsPage } from './pages/LimitationsPage';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { ScenarioReplayBar, type ScenarioId } from './components/ScenarioReplayBar';
import { simulateEventScenario, type SegmentCollection } from './data/scenarioSimulation';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay'>('home');
  const [currentHour, setCurrentHour] = useState<number>(1);
  const [scenario, setScenario] = useState<'live' | 'storm_july2024'>('live');
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [scenarioSimulationActive, setScenarioSimulationActive] = useState(false);
  const [selectedEventScenario, setSelectedEventScenario] = useState<ScenarioId>('2024');
  const [baseRoadSegments, setBaseRoadSegments] = useState<SegmentCollection | null>(null);
  const [simulationSummary, setSimulationSummary] = useState<{ mean_risk_score: number; increasing_segments: number; easing_segments: number } | null>(null);
  const apiUnavailable = useRef(false);
  const [reportsData, setReportsData] = useState<any>(null);
  const [showReportsLayer, setShowReportsLayer] = useState<boolean>(true);
  const [showRainfall, setShowRainfall] = useState<boolean>(false);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminNotificationModalOpen, setIsAdminNotificationModalOpen] = useState(false);
  const [activeRouteGeojson, setActiveRouteGeojson] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentPredictionData | null>(null);

  const [rainAgeMin, setRainAgeMin] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({ low: 0, moderate: 0, high: 0, severe: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('jaldrishti_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jaldrishti_theme', theme);
  }, [theme]);

  // Load predictions for the active horizon and scenario
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (apiUnavailable.current) throw new Error('API unavailable; use local baseline');
      const url = `/api/predictions?hour=${currentHour}${scenario === 'storm_july2024' ? '&scenario=storm_july2024' : ''}`;
      const res = await axios.get(url);
      setGeojsonData(res.data);

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

      if (res.data.features?.[0]?.properties?.rain_data_age_min !== undefined) {
        setRainAgeMin(res.data.features[0].properties.rain_data_age_min);
      }
    } catch {
      apiUnavailable.current = true;
      // Load the current low-confidence baseline from this origin. Using
      // native fetch avoids accidentally applying the remote API base URL.
      try {
        const fallbackRes = await fetch(`/data/pilot/predictions_h${currentHour}.geojson`, { cache: 'no-store' });
        if (!fallbackRes.ok) throw new Error(`Static fallback returned ${fallbackRes.status}`);
        const hourData = await fallbackRes.json();
        setGeojsonData(hourData);

        const counts = { low: 0, moderate: 0, high: 0, severe: 0 };
        hourData.features?.forEach((f: any) => {
          const r = (f.properties?.risk_class || 'low') as keyof typeof counts;
          if (counts[r] !== undefined) {
            counts[r]++;
          } else {
            counts.low++;
          }
        });
        setStats(counts);
        const rainTimestamp = hourData.features?.[0]?.properties?.rain_data_timestamp;
        if (rainTimestamp) {
          const ageMin = Math.max(0, (Date.now() - new Date(rainTimestamp).getTime()) / 60000);
          setRainAgeMin(Math.round(ageMin));
        }
      } catch (errFallback) {
        console.error('Failed to load predictions fallback:', errFallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, scenario]);

  // Fetch citizen reports feed
  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get('/api/reports?hours=24');
      setReportsData(res.data);
    } catch {
      apiUnavailable.current = true;
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
    } catch {
      apiUnavailable.current = true;
      // Backend offline
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchReports();
  }, [fetchHealth, fetchReports]);

  useEffect(() => {
    if (!scenarioSimulationActive) fetchPredictions();
  }, [fetchPredictions, scenarioSimulationActive]);

  useEffect(() => {
    if (!scenarioSimulationActive) return;
    let cancelled = false;
    const renderSimulation = async () => {
      try {
        let roads = baseRoadSegments;
        if (!roads) {
          const response = await fetch(`${import.meta.env.BASE_URL}data/pilot/road_segments.geojson`);
          if (!response.ok) throw new Error(`Road geometry fallback returned ${response.status}`);
          roads = await response.json();
          if (cancelled) return;
          setBaseRoadSegments(roads);
        }
        if (cancelled || !roads) return;
        const output = simulateEventScenario(roads, selectedEventScenario, currentHour);
        setGeojsonData(output);
        setSimulationSummary(output.summary);
        setStats(output.summary.counts);
      } catch (error) {
        if (!cancelled) console.error('Failed to run local scenario simulation:', error);
      }
    };
    renderSimulation();
    return () => { cancelled = true; };
  }, [scenarioSimulationActive, baseRoadSegments, selectedEventScenario, currentHour]);

  const runSelectedScenario = useCallback((id: ScenarioId, hour: number) => {
    setSelectedEventScenario(id);
    setCurrentHour(hour);
    setScenarioSimulationActive(true);
  }, []);

  const openEventReplay = useCallback(() => {
    setActiveTab('replay');
    setSelectedEventScenario('2024');
    setCurrentHour(1);
    setScenarioSimulationActive(true);
  }, []);

  const exitScenarioSimulation = useCallback(() => {
    setScenarioSimulationActive(false);
    setSimulationSummary(null);
    setActiveTab('map');
  }, []);

  useEffect(() => {
    if (activeTab !== 'replay' && scenarioSimulationActive) {
      setScenarioSimulationActive(false);
      setSimulationSummary(null);
    }
  }, [activeTab, scenarioSimulationActive]);

  if (activeTab === 'home') {
    return (
      <LandingPage
        onLaunchMap={() => setActiveTab('map')}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenSignIn={() => setActiveTab('signin')}
      />
    );
  }

  if (activeTab === 'signin') {
    return (
      <SignInPage
        onSignInSuccess={() => setActiveTab('map')}
        onBackHome={() => setActiveTab('home')}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg-primary, #F5F0E7)',
        position: 'relative'
      }}
    >
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAdminNotifications={() => setIsAdminNotificationModalOpen(true)}
        onOpenReplay={openEventReplay}
        scenario={scenario}
        setScenario={setScenario}
        rainAgeMin={rainAgeMin}
        isLoading={isLoading}
        onRefresh={fetchPredictions}
        theme={theme}
        setTheme={setTheme}
      />
      <AdminNotificationModal
        isOpen={isAdminNotificationModalOpen}
        onClose={() => setIsAdminNotificationModalOpen(false)}
      />

      {/* Main Layout Area: Left Sidebar (Desktop only) + Center Map View (Full width on Mobile) */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Left Sidebar Menu (Hidden on mobile via CSS desktop-only) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onToggleRoutePlanner={() => setIsRoutePlannerOpen(true)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onOpenReplay={openEventReplay}
          onToggleRainfall={() => setShowRainfall(!showRainfall)}
          showRainfall={showRainfall}
          rainAgeMin={rainAgeMin}
        />

        {/* Center / Right Content Area */}
        <main
          style={{
            flex: 1,
            position: 'relative',
            height: '100%',
            overflow: activeTab === 'map' || activeTab === 'replay' ? 'hidden' : 'auto',
            paddingBottom: activeTab === 'map' || activeTab === 'replay' ? '0' : 'calc(58px + var(--sab, 0px))'
          }}
        >
          {(activeTab === 'map' || activeTab === 'replay') && (
            <>
              {/* Floating Top Controls (Location search, Live Rainfall toggle) */}
              <TopControls
                showRainfall={showRainfall}
                setShowRainfall={setShowRainfall}
                onSelectLocation={(lat, lon, name) => setTargetCoords({ lat, lon, name })}
              />

              {activeTab === 'replay' && (
                <ScenarioReplayBar
                  onRunScenario={runSelectedScenario}
                  onSimulationChange={setScenarioSimulationActive}
                  onExitSimulation={exitScenarioSimulation}
                  summary={simulationSummary}
                />
              )}

              {/* Waterlogging Risk Legend (Desktop card & Mobile bottom sheet) */}
              <RiskLegend hideMobile={activeTab === 'replay'} />

              {/* Full Interactive Leaflet Map */}
              <MapComponent
                geojsonData={geojsonData}
                reportsData={reportsData}
                showReports={showReportsLayer}
                routeGeojson={activeRouteGeojson}
                showRainfall={showRainfall}
                targetCoords={targetCoords}
                onSelectSegment={(seg) => setSelectedSegment(seg)}
              />

              {/* Forecast Horizon Selector & Overview Card */}
              {activeTab === 'map' && (
                <TimeSlider
                  currentHour={currentHour}
                  setHour={setCurrentHour}
                  stats={stats}
                  rainAgeMin={rainAgeMin}
                  onOpenReplay={openEventReplay}
                />
              )}

              {/* Road Segment Inspection (Mobile Bottom Sheet & Desktop Drawer) */}
              <SegmentModal
                segment={selectedSegment}
                onClose={() => setSelectedSegment(null)}
                onNavigateHere={() => setIsRoutePlannerOpen(true)}
              />

              {/* Mode-Aware Dry Route Planner Modal */}
              <RoutePlanner
                isOpen={isRoutePlannerOpen}
                onClose={() => setIsRoutePlannerOpen(false)}
                onRouteCalculated={(routeGeo) => {
                  setActiveRouteGeojson(routeGeo);
                }}
                onClearRoute={() => setActiveRouteGeojson(null)}
                currentHour={currentHour}
              />

              {/* What-If Storm Sandbox Admin Modal */}
              <AdminSandboxModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                onApplySimulationToMap={(simGeo) => setGeojsonData(simGeo)}
              />

              {/* Citizen Flood Ground Truth Report Modal */}
              <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onReportSubmitted={() => {
                  fetchReports();
                  setShowReportsLayer(true);
                }}
                defaultCoords={{ lat: 18.574, lon: 73.806 }}
              />
            </>
          )}

          {activeTab === 'evaluate' && <EvaluationPage />}
          {activeTab === 'limits' && <LimitationsPage />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Visible on < 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onToggleRainfall={() => setShowRainfall(!showRainfall)}
        showRainfall={showRainfall}
      />
    </div>
  );
}

export default App;
