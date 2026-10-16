import { useEffect, useState, type FC } from 'react';
import { CalendarDays, CircleHelp, Pause, Play, RotateCcw } from 'lucide-react';

const scenarios = [
  { id: '2019', title: '2019 Pune floods', short: 'Sep 2019', date: '24 September 2019', detail: 'Citywide road flooding was reported; exact affected road points are unavailable.', source: 'https://timesofindia.indiatimes.com/city/pune/waterlogging-reveals-poor-standard-of-smart-roads/articleshow/71284804.cms' },
  { id: '2023', title: 'Sinhagad Road downpour', short: 'Sep 2023', date: '28 September 2023', detail: 'Flooding was reported on Sinhagad Road; exact affected road segments are unavailable.', source: 'https://www.hindustantimes.com/cities/pune-news/thursday-downpour-leads-to-waterlogging-in-some-areas-101696011409574.html' },
  { id: '2024', title: 'Ekta Nagar flood', short: 'Jul 2024', date: '24–25 July 2024', detail: 'Sinhagad Road, Ektanagar and Vitthalwadi were affected; road-level observations are unavailable.', source: 'https://www.hindustantimes.com/cities/pune-news/pmc-panel-to-identify-causes-of-flooding-suggest-preventive-measures-101722452082351.html' },
] as const;

export type ScenarioId = typeof scenarios[number]['id'];
interface ScenarioReplayBarProps {
  onRunScenario: (id: ScenarioId, hour: number) => void;
  onSimulationChange: (active: boolean) => void;
  onExitSimulation: () => void;
  summary: { mean_risk_score: number; increasing_segments: number; easing_segments: number } | null;
}

export const ScenarioReplayBar: FC<ScenarioReplayBarProps> = ({ onRunScenario, onSimulationChange, onExitSimulation, summary }) => {
  const [selectedId, setSelectedId] = useState<ScenarioId>('2024');
  const [hour, setHour] = useState(1);
  const [simulationActive, setSimulationActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const selected = scenarios.find((scenario) => scenario.id === selectedId)!;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      const next = Math.min(6, hour + 1);
      setHour(next);
      onRunScenario(selectedId, next);
      if (next === 6) setPlaying(false);
    }, 1700);
    return () => window.clearInterval(timer);
  }, [playing, hour, onRunScenario, selectedId]);

  const chooseScenario = (id: ScenarioId) => {
    setSelectedId(id);
    setHour(1);
    setPlaying(false);
    if (simulationActive) onRunScenario(id, 1);
  };

  const chooseHour = (nextHour: number) => {
    setHour(nextHour);
    setSimulationActive(true);
    onSimulationChange(true);
    setPlaying(false);
    onRunScenario(selectedId, nextHour);
  };

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const start = hour >= 6 ? 1 : hour;
    setHour(start);
    setSimulationActive(true);
    onSimulationChange(true);
    onRunScenario(selectedId, start);
    setPlaying(true);
  };

  return (
    <section aria-label="Historical event scenario simulation" className="glass scenario-replay-bar" style={{
      position: 'absolute', zIndex: 1005, top: '64px', left: '50%', transform: 'translateX(-50%)',
      width: 'min(900px, calc(100% - 32px))', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 16,
      background: 'var(--bg-card, #FFFCF6)', border: '1px solid var(--border-color, #E4DACA)',
      boxShadow: '0 8px 24px rgba(37, 37, 31, 0.16)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <CalendarDays size={17} color="var(--accent-cyan, #77745B)" style={{ flexShrink: 0 }} />
        <strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Flood event</strong>
        <div role="group" aria-label="Choose a source-backed flood event" style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
          {scenarios.map((scenario) => <button key={scenario.id} type="button" aria-pressed={selectedId === scenario.id} onClick={() => chooseScenario(scenario.id)} style={{
            flexShrink: 0, padding: '7px 10px', borderRadius: 999,
            border: `1px solid ${selectedId === scenario.id ? 'var(--accent-cyan, #77745B)' : 'var(--border-color, #E4DACA)'}`,
            background: selectedId === scenario.id ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
            color: 'var(--text-main, #25251F)', fontSize: 12, fontWeight: selectedId === scenario.id ? 700 : 500, cursor: 'pointer',
          }}>{scenario.short}</button>)}
        </div>
        <button type="button" onClick={togglePlayback} title={playing ? 'Pause simulation' : 'Play six-hour simulation'} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid var(--border-color, #E4DACA)',
          borderRadius: 999, padding: '7px 10px', background: playing ? 'var(--accent-beige-light, #E7DDCC)' : 'var(--bg-primary, #F5F0E7)',
          color: 'var(--text-main, #25251F)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>{playing ? <Pause size={13} /> : hour >= 6 ? <RotateCcw size={13} /> : <Play size={13} />}{playing ? 'Pause' : hour >= 6 ? 'Replay 6h' : 'Play 6h'}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '8px 0 0 25px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #706D62)', marginRight: 3 }}>HOUR</span>
        {[1, 2, 3, 4, 5, 6].map((step) => <button key={step} type="button" aria-pressed={hour === step} onClick={() => chooseHour(step)} style={{
          minWidth: 41, padding: '5px 7px', borderRadius: 999, border: `1px solid ${hour === step ? 'var(--accent-cyan, #77745B)' : 'var(--border-color, #E4DACA)'}`,
          background: hour === step ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent', color: 'var(--text-main, #25251F)',
          fontSize: 11, fontWeight: hour === step ? 700 : 500, cursor: 'pointer',
        }}>+{step}h</button>)}
        {summary && <span className="scenario-replay-score" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-main, #25251F)', whiteSpace: 'nowrap' }}>
          Mean score <strong>{summary.mean_risk_score}/100</strong> · <span style={{ color: '#C2410C' }}>↑ {summary.increasing_segments}</span> · <span style={{ color: '#16866A' }}>↓ {summary.easing_segments}</span>
        </span>}
        {summary && <button type="button" onClick={() => { onExitSimulation(); setSimulationActive(false); setPlaying(false); }} style={{ marginLeft: summary ? 5 : 'auto', border: 'none', background: 'transparent', color: 'var(--text-muted, #706D62)', fontSize: 11, textDecoration: 'underline', cursor: 'pointer' }}>Exit</button>}
      </div>
      <button className="scenario-replay-info-toggle" type="button" onClick={() => setShowInfo(!showInfo)} aria-expanded={showInfo} style={{ display: 'none' }}>Scenario info</button>
      <div className={`scenario-replay-info${showInfo ? ' is-open' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, margin: '8px 2px 0 25px', color: 'var(--text-muted, #706D62)', fontSize: 11, lineHeight: 1.4 }}>
        <CircleHelp size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span><strong style={{ color: 'var(--text-main, #25251F)' }}>{selected.title} · {selected.date}.</strong> {selected.detail} <a href={selected.source} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan, #77745B)', fontWeight: 600 }}>Source</a> · The changing layer is an illustrative rule-based what-if simulation, not the observed event or a trained-model forecast.</span>
      </div>
    </section>
  );
};
