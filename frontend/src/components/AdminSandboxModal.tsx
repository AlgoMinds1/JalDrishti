import { useState, useEffect, type FC } from 'react';
import axios from 'axios';
import { Sliders, AlertTriangle, Wrench, X, RefreshCw, PlusCircle } from 'lucide-react';
import { MapComponent } from './MapComponent';

interface AdminSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveGeojsonData: any;
}

export const AdminSandboxModal: FC<AdminSandboxModalProps> = ({
  isOpen,
  onClose,
  liveGeojsonData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sandbox' | 'queue' | 'ledger'>('sandbox');
  const [rainfallMm, setRainfallMm] = useState<number>(60);
  const [durationH, setDurationH] = useState<number>(2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [queueData, setQueueData] = useState<any[]>([]);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newIntervention, setNewIntervention] = useState({
    name: '',
    segment_name: '',
    segment_id: 'way/682974952',
    type: 'desilting',
    completion_date: '2024-06-15',
    description: '',
    agency: 'PMC Stormwater Drainage Department'
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Run simulation & fetch ranked queue
  const runSimulation = async () => {
    setIsSimulating(true);
    setStatusMessage(null);
    setSimulationData(null);
    try {
      // 1. Fetch simulation GeoJSON
      const simRes = await axios.get(`/api/sandbox/simulate?mm=${rainfallMm}&duration_h=${durationH}`);
      const result = simRes.data?.geojson || simRes.data?.data || simRes.data;
      if (result?.type === 'FeatureCollection' && Array.isArray(result.features) && result.features.length) {
        setSimulationData(result);
      }
    } catch (err: any) {
      console.error('Failed to run sandbox simulation:', err);
      setStatusMessage('LightGBM simulation is unavailable. Check the model service connection and retry.');
    }

    try {
      const qRes = await axios.get(`/api/admin/queue?mm=${rainfallMm}&duration_h=${durationH}&top_n=10`);
      setQueueData(qRes.data?.queue || []);
    } catch (err) {
      console.error('Failed to load the inspection queue:', err);
      setQueueData([]);
    } finally {
      setIsSimulating(false);
    }
  };

  // Fetch intervention ledger
  const fetchLedger = async () => {
    try {
      const res = await axios.get('/api/admin/ledger');
      setLedgerData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runSimulation();
      fetchLedger();
    }
  }, [isOpen]);

  const handleLogIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/ledger', newIntervention);
      setShowLogModal(false);
      fetchLedger();
      setStatusMessage('Civic intervention logged successfully into permanent ledger.');
    } catch (err) {
      setStatusMessage('Failed to record intervention.');
    }
  };

  if (!isOpen) return null;

  const closeSandbox = () => {
    setSimulationData(null);
    setQueueData([]);
    setStatusMessage(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'transparent',
      zIndex: 2500,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'auto' }}>
        <MapComponent geojsonData={simulationData || liveGeojsonData} showReports={false} onSelectSegment={() => {}} />
      </div>
      <div className="glass" style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        width: 'min(460px, calc(100vw - 28px))',
        height: 'min(760px, calc(100dvh - 28px))',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-widget)',
        border: '1px solid var(--border-color)',
        pointerEvents: 'auto',
        zIndex: 2
      }}>
        {/* Prominent Simulation Watermark Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
          color: '#ffffff',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>⚠️ SIMULATION MODE — HYPOTHETICAL STRESS TEST (CANNOT TRIGGER REAL CITIZEN ALERTS)</span>
          </div>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>ISOLATED ENVIRONMENT</span>
        </div>

        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="var(--accent-beige, #77745B)" />
              Admin Operations & What-If Storm Sandbox
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Evaluate hypothetical cloudburst stress tests, inspect prioritized road queues, and audit civic repairs.
            </p>
          </div>
          <button
            onClick={closeSandbox}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div
          className="horizontal-scroll-pill"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-pill, #E7DDCC)',
            borderBottom: '1px solid var(--border-color, #E4DACA)',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {[
            { id: 'sandbox', label: 'What-If Storm Sandbox', icon: <Sliders size={14} /> },
            { id: 'queue', label: 'Top 10 Inspection Queue', icon: <AlertTriangle size={14} /> },
            { id: 'ledger', label: 'Intervention Effectiveness Ledger', icon: <Wrench size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === tab.id ? 'var(--accent-beige, #77745B)' : 'transparent',
                color: activeSubTab === tab.id ? '#ffffff' : 'var(--text-main, #25251F)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {statusMessage && (
            <div style={{
              background: 'var(--accent-cyan-light, rgba(119, 116, 91, 0.15))',
              border: '1px solid var(--accent-cyan, #77745B)',
              color: 'var(--text-main, #25251F)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '14px'
            }}>
              {statusMessage}
            </div>
          )}

          {/* TAB 1: What-If Storm Sandbox */}
          {activeSubTab === 'sandbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Sliders Control Card */}
              <div style={{
                background: 'var(--bg-primary, #F5F0E7)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-color, #E4DACA)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
                  {/* Rain Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Total Rainfall:</label>
                      <span style={{ fontSize: '13px', color: 'var(--accent-beige-dark)', fontWeight: 700 }}>{rainfallMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={5}
                      value={rainfallMm}
                      onChange={(e) => setRainfallMm(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-beige)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>10 mm (Light)</span>
                      <span>60 mm (Cloudburst)</span>
                      <span>120 mm (Extreme)</span>
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Storm Duration:</label>
                      <span style={{ fontSize: '13px', color: 'var(--accent-beige-dark)', fontWeight: 700 }}>{durationH} Hours ({Math.round(rainfallMm / durationH)} mm/h)</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={durationH}
                      onChange={(e) => setDurationH(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-beige)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>1 Hour (Flash)</span>
                      <span>3 Hours</span>
                      <span>6 Hours (Sustained)</span>
                    </div>
                  </div>

                  {/* Run Button */}
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    style={{
                      background: 'var(--accent-beige-gradient)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isSimulating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(119, 116, 91, 0.28)'
                    }}
                  >
                    <RefreshCw size={15} className={isSimulating ? 'spin' : ''} />
                    <span>{isSimulating ? 'Simulating...' : 'Run Stress Test'}</span>
                  </button>
                </div>
              </div>

              {/* Simulation Result Counters */}
              {simulationData && (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Severe Risk Segments', val: simulationData.summary?.counts?.severe || 0, color: 'var(--risk-severe)' },
                    { label: 'High Risk Segments', val: simulationData.summary?.counts?.high || 0, color: 'var(--risk-high)' },
                    { label: 'Moderate Risk Segments', val: simulationData.summary?.counts?.moderate || 0, color: 'var(--risk-moderate)' },
                    { label: 'Road Segments', val: simulationData.summary?.total_segments ?? simulationData.features?.length ?? 0, color: 'var(--accent-beige-dark)' }
                  ].map((c, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-pill)',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: c.color, marginTop: '4px' }}>{c.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-primary, #F5F0E7)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Map key</strong>
                  {[
                    { label: 'Severe', color: 'var(--risk-severe, #dc2626)' },
                    { label: 'High', color: 'var(--risk-high, #f97316)' },
                    { label: 'Moderate', color: 'var(--risk-moderate, #f59e0b)' },
                    { label: 'Low', color: 'var(--risk-low, #10b981)' }
                  ].map((item) => (
                    <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />{item.label}
                    </span>
                  ))}
                  <span style={{ marginLeft: 'auto' }}>
                    {Number.isFinite(simulationData.execution_time_ms)
                      ? `LightGBM simulation · ${simulationData.execution_time_ms} ms`
                      : 'LightGBM simulation · timing unavailable'}
                  </span>
                </div>
                </>
              )}

              {/* Top Failing Corridors List */}
              {simulationData?.top_failing_corridors && (
                <div>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 600 }}>
                    Highest-risk corridors for {rainfallMm} mm over {durationH} hours:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {simulationData.top_failing_corridors.slice(0, 5).map((fc: any, idx: number) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--bg-pill)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{idx + 1} {fc.name}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({fc.road_class}{fc.is_underpass ? ' • UNDERPASS' : ''})</span>
                        </div>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          background: fc.risk_class === 'severe' ? 'var(--risk-severe-bg)' : 'var(--risk-high-bg)',
                          color: fc.risk_class === 'severe' ? 'var(--risk-severe)' : 'var(--risk-high)'
                        }}>
                          {fc.risk_class.toUpperCase()} ({Math.round(fc.probability * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Ranked Inspection Queue */}
          {activeSubTab === 'queue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                    Priority-Ranked Deployment Queue (At {rainfallMm} mm Stress Test)
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Ranked by Priority Score = Risk Weight × Exposure Score × Citizen Corroboration
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-beige-dark)', fontWeight: 600 }}>Top 10 High-Priority Dispatches</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-pill)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Rank</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Segment Name</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Priority</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Risk Class</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueData.map((item: any) => (
                      <tr key={item.rank} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--accent-beige-dark)' }}>#{item.rank}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600 }}>
                          {item.name}
                          {item.is_underpass && <span style={{ color: 'var(--risk-severe)', marginLeft: '6px', fontSize: '10px' }}>[UNDERPASS]</span>}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-main)' }}>{item.priority_score}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: item.risk_class === 'severe' ? 'var(--risk-severe-bg)' : 'var(--risk-high-bg)',
                            color: item.risk_class === 'severe' ? 'var(--risk-severe)' : 'var(--risk-high)'
                          }}>
                            {item.risk_class?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-sub)' }}>{item.recommended_action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Intervention Effectiveness Ledger */}
          {activeSubTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                    Civic Drainage Intervention Effectiveness Ledger
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Before vs After flood frequency comparison for comparable rainfall events (±20% intensity window).
                  </p>
                </div>
                <button
                  onClick={() => setShowLogModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--accent-beige-gradient)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(119, 116, 91, 0.25)'
                  }}
                >
                  <PlusCircle size={14} /> Log Civic Intervention
                </button>
              </div>

              {/* Intervention Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(Array.isArray(ledgerData) ? ledgerData : []).map((item: any) => (
                  <div key={item.intervention_id} style={{
                    background: 'var(--bg-pill)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent-beige-dark)', fontWeight: 600 }}>{item.intervention_id}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Completed: {item.completion_date}</span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>{item.name}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target: {item.segment_name} ({item.agency})</div>
                      </div>
                      <div style={{
                        background: 'var(--risk-low-bg)',
                        border: '1px solid var(--risk-low-border)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        textAlign: 'right'
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--risk-low)', fontWeight: 600 }}>Flood Rate Reduction</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--risk-low)' }}>
                          ↓ {item.metrics?.reduction_pct}%
                        </div>
                      </div>
                    </div>

                    {/* Metrics Comparison Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '12px',
                      fontSize: '11px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Before Intervention:</span>
                        <div style={{ fontWeight: 700, color: 'var(--risk-severe)' }}>
                          {item.metrics?.before_high_severe_count} / {item.metrics?.before_events_monitored} Events ({item.metrics?.before_waterlogging_rate_pct}%)
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>After Intervention:</span>
                        <div style={{ fontWeight: 700, color: 'var(--risk-low)' }}>
                          {item.metrics?.after_high_severe_count} / {item.metrics?.after_events_monitored} Events ({item.metrics?.after_waterlogging_rate_pct}%)
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Comparable Window:</span>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.metrics?.comparable_rainfall_window}</div>
                      </div>
                    </div>

                    {/* Observational Limitations Disclaimer */}
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '10px',
                      borderLeft: '3px solid #f59e0b',
                      paddingLeft: '8px'
                    }}>
                      ⚠️ {item.disclaimer}
                    </div>
                  </div>
                ))}
              </div>

              {/* Log Intervention Modal */}
              {showLogModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(37, 37, 31, 0.58)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3000
                }}>
                  <div className="glass" style={{
                    width: '460px',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px' }}>Log Civic Intervention</h4>
                      <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleLogIntervention} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div>
                        <label style={{ color: 'var(--text-muted)' }}>Intervention Name:</label>
                        <input
                          type="text"
                          required
                          value={newIntervention.name}
                          onChange={(e) => setNewIntervention({ ...newIntervention, name: e.target.value })}
                          placeholder="e.g. Pashan Lake Outlet Desilting"
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-pill)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)' }}>Target Road Segment Name:</label>
                        <input
                          type="text"
                          required
                          value={newIntervention.segment_name}
                          onChange={(e) => setNewIntervention({ ...newIntervention, segment_name: e.target.value })}
                          placeholder="e.g. Pashan Circle / Ramnadi Canal"
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-pill)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)' }}>Intervention Type:</label>
                        <select
                          value={newIntervention.type}
                          onChange={(e) => setNewIntervention({ ...newIntervention, type: e.target.value })}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-pill)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', marginTop: '4px' }}
                        >
                          <option value="desilting">Drainage & Nala Desilting</option>
                          <option value="pump_installation">High-Capacity Dewatering Pump</option>
                          <option value="culvert_widening">Culvert / Box Drain Widening</option>
                          <option value="inlet_clearing">Storm Inlet Grate Clearing</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)' }}>Scope Description:</label>
                        <textarea
                          rows={2}
                          value={newIntervention.description}
                          onChange={(e) => setNewIntervention({ ...newIntervention, description: e.target.value })}
                          placeholder="Details of civil work..."
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-pill)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', marginTop: '4px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          background: 'var(--accent-beige-gradient)',
                          color: '#fff',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '6px',
                          boxShadow: '0 2px 8px rgba(119, 116, 91, 0.25)'
                        }}
                      >
                        Submit to Effectiveness Ledger
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
