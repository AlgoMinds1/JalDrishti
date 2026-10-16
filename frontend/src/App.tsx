import { useState, useEffect, useCallback } from 'react';
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
import { MobileBottomNav } from './components/MobileBottomNav';
import { EvaluationPage } from './pages/EvaluationPage';
import { LimitationsPage } from './pages/LimitationsPage';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'signin' | 'map' | 'evaluate' | 'limits'>('home');
  const [currentHour, setCurrentHour] = useState<number>(1);
  const [scenario, setScenario] = useState<'live' | 'storm_july2024'>('live');
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [showReportsLayer, setShowReportsLayer] = useState<boolean>(true);
  const [showRainfall, setShowRainfall] = useState<boolean>(true);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
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
      // Graceful fallback to static high-resolution pilot dataset
      try {
        const fallbackRes = await axios.get('/data/default_predictions.json');
        const hourData = fallbackRes.data[currentHour] || fallbackRes.data[1];
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
      // Backend offline
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchReports();
  }, [fetchHealth, fetchReports]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

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
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary, #F5F0E7)',
        position: 'relative'
      }}
    >
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenario={scenario}
        setScenario={setScenario}
        rainAgeMin={rainAgeMin}
        isLoading={isLoading}
        onRefresh={fetchPredictions}
        theme={theme}
        setTheme={setTheme}
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
            overflow: activeTab === 'map' ? 'hidden' : 'auto',
            paddingBottom: activeTab === 'map' ? '0' : 'calc(58px + var(--sab, 0px))'
          }}
        >
          {activeTab === 'map' && (
            <>
              {/* Floating Top Controls (Location search, Live Rainfall toggle) */}
              <TopControls
                showRainfall={showRainfall}
                setShowRainfall={setShowRainfall}
                onSelectLocation={(lat, lon, name) => setTargetCoords({ lat, lon, name })}
              />

              {/* Waterlogging Risk Legend (Desktop card & Mobile bottom sheet) */}
              <RiskLegend />

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
              <TimeSlider
                currentHour={currentHour}
                setHour={setCurrentHour}
                stats={stats}
                rainAgeMin={rainAgeMin}
              />

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
