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
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';
import { UserSettingsModal } from './components/UserSettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloodAssistantModal } from './components/FloodAssistantModal';
import { EvaluationPage } from './pages/EvaluationPage';
import { LimitationsPage } from './pages/LimitationsPage';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { ScenarioReplayBar, type ScenarioId } from './components/ScenarioReplayBar';
import { simulateEventScenario, type SegmentCollection } from './data/scenarioSimulation';
import { WifiOff } from 'lucide-react';
import { speechLocale, useAppLanguage } from './language';
import {
  cachePredictions,
  getCachedPredictions,
  getPendingReports,
  syncPendingReports
} from './utils/offlineStorage';

export function App() {
  const { language } = useAppLanguage();
  type AppTab = 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay' | 'assistant' | 'settings';
  const tabForPath = (path: string): AppTab => ({ '/': 'home', '/landing': 'home', '/signin': 'signin', '/dashboard/live-map': 'map', '/dashboard/evaluation': 'evaluate', '/dashboard/limitations': 'limits', '/dashboard/replay': 'replay', '/dashboard/ai-chat': 'assistant', '/dashboard/settings': 'settings' } as Record<string, AppTab>)[path] ?? 'home';
  const pathForTab: Record<AppTab, string> = { home: '/landing', signin: '/signin', map: '/dashboard/live-map', evaluate: '/dashboard/evaluation', limits: '/dashboard/limitations', replay: '/dashboard/replay', assistant: '/dashboard/ai-chat', settings: '/dashboard/settings' };
  const [activeTab, setActiveTab] = useState<AppTab>(() => tabForPath(window.location.pathname));
  const goToTab = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    const path = pathForTab[tab];
    if (window.location.pathname !== path) window.history.pushState({ tab }, '', path);
  }, []);
  const openMapPanel = useCallback((open: () => void) => {
    goToTab('map');
    open();
  }, [goToTab]);
  useEffect(() => {
    const onPopState = () => setActiveTab(tabForPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const [currentHour, setCurrentHour] = useState<number>(1);
  const [scenario, setScenario] = useState<'live' | 'storm_july2024'>('live');
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [scenarioSimulationActive, setScenarioSimulationActive] = useState(false);
  const [selectedEventScenario, setSelectedEventScenario] = useState<ScenarioId>('2024');
  const [baseRoadSegments, setBaseRoadSegments] = useState<SegmentCollection | null>(null);
  const [simulationSummary, setSimulationSummary] = useState<{ mean_risk_score: number; increasing_segments: number; easing_segments: number } | null>(null);
  const apiUnavailable = useRef(false);
  const spokenPushIds = useRef(new Set<string>());
  const [reportsData, setReportsData] = useState<any>(null);
  const [showReportsLayer, setShowReportsLayer] = useState<boolean>(true);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminNotificationModalOpen, setIsAdminNotificationModalOpen] = useState(false);
  const [isPushPromptOpen, setIsPushPromptOpen] = useState(false);
  const closePushPrompt = useCallback(() => setIsPushPromptOpen(false), []);
  const [activeRouteGeojson, setActiveRouteGeojson] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentPredictionData | null>(null);

  const [rainAgeMin, setRainAgeMin] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [stats, setStats] = useState({ low: 0, moderate: 0, high: 0, severe: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('jaldrishti_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jaldrishti_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('speechSynthesis' in window)) return;
    const onPushNotice = (event: MessageEvent) => {
      if (event.data?.type !== 'JALDRISHTI_PUSH_NOTICE') return;
      const notice = event.data.notice;
      const id = String(notice?.id ?? '');
      if (!id || spokenPushIds.current.has(id)) return;
      spokenPushIds.current.add(id);
      const localized = notice.translations?.[language];
      const title = String(localized?.title || notice.title || '').trim();
      const body = String(localized?.body || notice.body || '').trim();
      if (!title && !body) return;
      window.speechSynthesis.cancel();
      [title, body].filter(Boolean).forEach((text, index, parts) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLocale(language);
        if (index === parts.length - 1) utterance.onerror = () => spokenPushIds.current.delete(id);
        window.speechSynthesis.speak(utterance);
      });
    };
    navigator.serviceWorker.addEventListener('message', onPushNotice);
    return () => navigator.serviceWorker.removeEventListener('message', onPushNotice);
  }, [language]);

  // Register offline Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] JalDrishti Service Worker registered:', reg.scope))
        .catch((err) => console.warn('[SW] Registration failed:', err));
    }
  }, []);

  // Helper to compute risk stats and age from GeoJSON
  const updateStatsFromData = useCallback((data: any) => {
    if (!data || !data.features) return;
    const counts = { low: 0, moderate: 0, high: 0, severe: 0 };
    data.features.forEach((f: any) => {
      const r = (f.properties?.risk_class || 'low') as keyof typeof counts;
      if (counts[r] !== undefined) {
        counts[r]++;
      } else {
        counts.low++;
      }
    });
    setStats(counts);

    const rainTimestamp = data.features?.[0]?.properties?.rain_data_timestamp;
    if (rainTimestamp) {
      const ageMin = Math.max(0, (Date.now() - new Date(rainTimestamp).getTime()) / 60000);
      setRainAgeMin(Math.round(ageMin));
    } else if (data.features?.[0]?.properties?.rain_data_age_min !== undefined) {
      setRainAgeMin(data.features[0].properties.rain_data_age_min);
    }
  }, []);

  // Instant bootstrap: immediately populate predictions so map is NEVER empty
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cached = await getCachedPredictions(1);
        if (cached && active) {
          setGeojsonData(cached);
          updateStatsFromData(cached);
          return;
        }
        const res = await fetch('/data/pilot/predictions_h1.geojson');
        if (res.ok && active) {
          const data = await res.json();
          setGeojsonData(data);
          updateStatsFromData(data);
          cachePredictions(1, data);
        }
      } catch {
        // Handled in fetchPredictions
      }
    })();
    return () => {
      active = false;
    };
  }, [updateStatsFromData]);

  // Pre-cache all 6 forecast horizons into IndexedDB on initial load
  useEffect(() => {
    [1, 2, 3, 4, 5, 6].forEach(async (h) => {
      try {
        const res = await fetch(`/data/pilot/predictions_h${h}.geojson`);
        if (res.ok) {
          const data = await res.json();
          await cachePredictions(h, data);
        }
      } catch {
        // Silently skip if background prefetch has issues
      }
    });

    // Also pre-cache primary Pune pilot raster tiles for seamless offline zoom
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const sampleTiles = [
        'https://tile.openstreetmap.org/13/5776/3624.png',
        'https://tile.openstreetmap.org/13/5776/3625.png',
        'https://tile.openstreetmap.org/13/5777/3624.png',
        'https://tile.openstreetmap.org/13/5777/3625.png',
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/5776/3624.png',
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/5776/3625.png',
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/5777/3624.png',
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/5777/3625.png'
      ];
      sampleTiles.forEach((url) => fetch(url, { mode: 'no-cors' }).catch(() => {}));
    }
  }, []);

  // Load predictions for the active horizon and scenario with fast 1.2s timeout
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!navigator.onLine || apiUnavailable.current) {
        throw new Error('Device offline or API unavailable; using local cache');
      }

      const url = `/api/predictions?hour=${currentHour}${scenario === 'storm_july2024' ? '&scenario=storm_july2024' : ''}`;
      const res = await axios.get(url, { timeout: 1200 });
      setGeojsonData(res.data);
      updateStatsFromData(res.data);
      cachePredictions(currentHour, res.data);
    } catch {
      apiUnavailable.current = true;

      // 1. Try local IndexedDB cache first (instant 0ms response)
      try {
        const cachedHourData = await getCachedPredictions(currentHour);
        if (cachedHourData && cachedHourData.features?.length > 0) {
          setGeojsonData(cachedHourData);
          updateStatsFromData(cachedHourData);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to static asset
      }

      // 2. Fallback to bundled static horizon GeoJSON
      try {
        const fallbackRes = await fetch(`/data/pilot/predictions_h${currentHour}.geojson`);
        if (fallbackRes.ok) {
          const hourData = await fallbackRes.json();
          setGeojsonData(hourData);
          updateStatsFromData(hourData);
          cachePredictions(currentHour, hourData);
        }
      } catch (errFallback) {
        console.error('Failed to load predictions fallback:', errFallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, scenario, updateStatsFromData]);

  // Fetch citizen reports feed + merge offline pending reports
  const fetchReports = useCallback(async () => {
    let combinedReports: any = { type: 'FeatureCollection', features: [] };

    try {
      if (navigator.onLine && !apiUnavailable.current) {
        const res = await axios.get('/api/reports?hours=24', { timeout: 1200 });
        if (res.data?.features) {
          combinedReports = res.data;
        }
      }
    } catch {
      apiUnavailable.current = true;
    }

    // Append offline queued reports
    try {
      const pending = await getPendingReports();
      if (pending && pending.length > 0) {
        const pendingFeatures = pending.map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
          properties: {
            id: p.id,
            description: p.text,
            is_offline_pending: true,
            status: 'Offline Queue (Pending Sync)',
            created_at: p.timestamp,
            confidence_score: 0.9,
          },
        }));
        combinedReports = {
          ...combinedReports,
          features: [...(combinedReports.features || []), ...pendingFeatures],
        };
      }
    } catch (err) {
      console.warn('[OfflineStorage] Error reading pending reports:', err);
    }

    setReportsData(combinedReports);
  }, []);

  // Fetch health data for freshness with fast timeout
  const fetchHealth = useCallback(async () => {
    if (!navigator.onLine || apiUnavailable.current) return;
    try {
      const res = await axios.get('/api/health', { timeout: 1000 });
      if (res.data?.rain_data_age_min !== undefined) {
        setRainAgeMin(res.data.rain_data_age_min);
      }
    } catch {
      apiUnavailable.current = true;
    }
  }, []);

  // Network connectivity listener & automatic background sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      apiUnavailable.current = false;
      fetchPredictions();
      fetchHealth();

      const syncResult = await syncPendingReports();
      if (syncResult.syncedCount > 0) {
        console.log(`[OfflineSync] Synced ${syncResult.syncedCount} queued reports`);
      }
      fetchReports();
    };

    const handleOffline = () => {
      setIsOnline(false);
      apiUnavailable.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchPredictions, fetchReports, fetchHealth]);

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
    goToTab('replay');
    setSelectedEventScenario('2024');
    setCurrentHour(1);
    setScenarioSimulationActive(true);
  }, []);

  const exitScenarioSimulation = useCallback(() => {
    setScenarioSimulationActive(false);
    setSimulationSummary(null);
    goToTab('map');
  }, [goToTab]);

  useEffect(() => {
    if (activeTab !== 'replay' && scenarioSimulationActive) {
      setScenarioSimulationActive(false);
      setSimulationSummary(null);
    }
  }, [activeTab, scenarioSimulationActive]);

  if (activeTab === 'home') {
    return (
      <LandingPage
        onLaunchMap={() => goToTab('map')}
        onNavigate={(tab) => goToTab(tab)}
        onOpenSignIn={() => goToTab('signin')}
      />
    );
  }

  if (activeTab === 'signin') {
    return (
      <SignInPage
        onSignInSuccess={() => {
          goToTab('map');
          setIsPushPromptOpen(localStorage.getItem('jaldrishti_push_prompt_dismissed') !== 'true');
        }}
        onBackHome={() => goToTab('home')}
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
        setActiveTab={goToTab}
        onOpenAdminModal={() => openMapPanel(() => setIsAdminModalOpen(true))}
        onOpenAdminNotifications={() => setIsAdminNotificationModalOpen(true)}
        onOpenSettings={() => goToTab('settings')}
        onOpenReplay={openEventReplay}
        scenario={scenario}
        setScenario={setScenario}
        rainAgeMin={rainAgeMin}
        isLoading={isLoading}
        onRefresh={fetchPredictions}
      />
      <AdminNotificationModal
        isOpen={isAdminNotificationModalOpen}
        onClose={() => setIsAdminNotificationModalOpen(false)}
      />
      <NotificationPermissionPrompt isOpen={isPushPromptOpen} onClose={closePushPrompt} />

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
          setActiveTab={goToTab}
          onOpenReportModal={() => openMapPanel(() => setIsReportModalOpen(true))}
          onToggleRoutePlanner={() => openMapPanel(() => setIsRoutePlannerOpen(true))}
          onOpenAdminModal={() => openMapPanel(() => setIsAdminModalOpen(true))}
          onOpenSettings={() => goToTab('settings')}
          onOpenReplay={openEventReplay}
          onOpenAssistant={() => goToTab('assistant')}
          rainAgeMin={rainAgeMin}
        />

        {/* Center / Right Content Area */}
        <main
          style={{
            flex: 1,
            position: 'relative',
            height: '100%',
            overflow: activeTab === 'map' || activeTab === 'replay' || activeTab === 'assistant' || activeTab === 'settings' ? 'hidden' : 'auto',
            paddingBottom: activeTab === 'map' || activeTab === 'replay' || activeTab === 'assistant' || activeTab === 'settings' ? '0' : 'calc(58px + var(--sab, 0px))'
          }}
        >
          {(activeTab === 'map' || activeTab === 'replay') && (
            <>
              {/* Offline Notification Pill */}
              {!isOnline && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1050,
                    background: 'rgba(37, 37, 31, 0.94)',
                    color: '#F5F0E7',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 650,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(245, 240, 231, 0.2)',
                    pointerEvents: 'none'
                  }}
                >
                  <WifiOff size={13} color="#f59e0b" />
                  <span>Offline Mode • Using cached Pune forecast & local router</span>
                </div>
              )}

              {/* Floating Top Controls (Location search) */}
              <TopControls
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
                currentPredictions={geojsonData}
              />

              {/* What-If Storm Sandbox Admin Modal */}
              <AdminSandboxModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                liveGeojsonData={geojsonData}
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

          {activeTab !== 'map' && activeTab !== 'replay' && <div aria-label="Breadcrumb" style={{ padding: '10px 20px', fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}><button onClick={() => goToTab('home')} style={{ border: 0, padding: 0, background: 'none', color: 'inherit', cursor: 'pointer' }}>JalDrishti</button><span style={{ margin: '0 8px' }}>/</span>{activeTab === 'evaluate' ? 'Evaluation' : activeTab === 'limits' ? 'Limitations' : activeTab === 'assistant' ? 'AI Chat' : 'Settings'}</div>}
          {activeTab === 'evaluate' && <EvaluationPage />}
          {activeTab === 'limits' && <LimitationsPage />}
          {activeTab === 'assistant' && <FloodAssistantModal isOpen onClose={() => goToTab('map')} />}
          {activeTab === 'settings' && <UserSettingsModal isOpen onClose={() => goToTab('map')} theme={theme} setTheme={setTheme} />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Visible on < 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={goToTab}
        onOpenReportModal={() => openMapPanel(() => setIsReportModalOpen(true))}
        onToggleRoutePlanner={() => openMapPanel(() => setIsRoutePlannerOpen(true))}
        onOpenSettings={() => goToTab('settings')}
        onOpenAssistant={() => goToTab('assistant')}
      />
    </div>
  );
}

export default App;
