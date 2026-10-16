import type { FC } from 'react';
import { AlertTriangle, Clock3, Database, Gauge, ShieldCheck } from 'lucide-react';

const events = [
  { date: '24 Sep 2019', name: 'Pune monsoon flooding', labels: '0 segment labels' },
  { date: '28 Sep 2023', name: 'Sinhagad Road downpour', labels: '0 segment labels' },
  { date: '24–25 Jul 2024', name: 'Sinhagad Road / Ekta Nagar replay', labels: '0 segment labels' },
];

const unavailable = 'Not measured';

export const EvaluationPage: FC = () => (
  <div style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 20px 32px', color: 'var(--text-main)' }}>
    <div style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
        Model Accuracy &amp; Baseline Comparison
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
        Current Pune pilot evidence. The system is using a rain-threshold baseline; no trained model skill is claimed.
      </p>
    </div>

    <div role="status" className="glass" style={{ display: 'flex', gap: '12px', padding: '16px 18px', borderRadius: '12px', borderLeft: '4px solid var(--risk-moderate)', marginBottom: '20px' }}>
      <AlertTriangle size={20} color="var(--risk-moderate)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Evaluation is not yet possible.</strong>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, marginTop: 4 }}>
          Only 3 distinct dated events were found, below the 5-event minimum. Reports do not locate individual affected road segments, leaving 0 eligible segment-level positives and no valid event or spatial test set. PR-AUC, precision, recall, F1, Brier score and false-alarm rate are therefore not reported.
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: '14px', marginBottom: '24px' }}>
      <div className="glass" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)', fontSize: 13, fontWeight: 600 }}><Database size={16} /> Verified events</div>
        <div style={{ fontSize: 30, fontWeight: 800, margin: '8px 0 2px' }}>3 / 5</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Event minimum for model training</div>
      </div>
      <div className="glass" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid var(--risk-high)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--risk-high)', fontSize: 13, fontWeight: 600 }}><Gauge size={16} /> Segment labels</div>
        <div style={{ fontSize: 30, fontWeight: 800, margin: '8px 0 2px' }}>0</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Source-backed and precisely located positives</div>
      </div>
      <div className="glass" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', fontSize: 13, fontWeight: 600 }}><ShieldCheck size={16} /> Current model type</div>
        <div style={{ fontSize: 25, fontWeight: 800, margin: '10px 0 4px' }}>Baseline</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rain threshold; uncalibrated</div>
      </div>
      <div className="glass" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid var(--risk-moderate)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--risk-moderate)', fontSize: 13, fontWeight: 600 }}><Clock3 size={16} /> Rain snapshot</div>
        <div style={{ fontSize: 25, fontWeight: 800, margin: '10px 0 4px' }}>0.0 mm</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cached forecast; about 66 hours old at export</div>
      </div>
    </div>

    <section className="glass" style={{ borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Evaluation metrics</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '11px 12px' }}>Metric</th><th style={{ padding: '11px 12px' }}>Current result</th><th style={{ padding: '11px 12px' }}>Reason</th>
          </tr></thead>
          <tbody>{[
            ['PR-AUC', unavailable, 'No segment-level test labels'],
            ['Recall at 5% false-alarm rate', unavailable, 'No valid test set'],
            ['F1 / precision / recall', unavailable, 'No valid test set'],
            ['Brier score', unavailable, 'No calibration set'],
            ['False-alarm rate', unavailable, 'No valid test set'],
          ].map(([metric, value, reason]) => <tr key={metric} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={{ padding: '12px', fontWeight: 600 }}>{metric}</td><td style={{ padding: '12px' }}>{value}</td><td style={{ padding: '12px', color: 'var(--text-muted)' }}>{reason}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="glass" style={{ borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Baseline comparison</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '11px 12px' }}>Method</th><th style={{ padding: '11px 12px' }}>PR-AUC</th><th style={{ padding: '11px 12px' }}>Precision / recall</th><th style={{ padding: '11px 12px' }}>Status</th>
          </tr></thead>
          <tbody>{[
            ['Always-no', 'Not measured', 'Not measured', 'Requires labelled test set'],
            ['Hotspot-list-only', 'Not measured', 'Not measured', 'No geocoded segment labels'],
            ['Rain-threshold rule', 'Not measured', 'Not measured', 'Current baseline; no test labels'],
            ['JalDrishti trained model', '—', '—', 'Not trained: fewer than 5 labelled events'],
          ].map(([method, pr, prr, status]) => <tr key={method} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={{ padding: '12px', fontWeight: 600 }}>{method}</td><td style={{ padding: '12px' }}>{pr}</td><td style={{ padding: '12px' }}>{prr}</td><td style={{ padding: '12px', color: 'var(--text-muted)' }}>{status}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="glass" style={{ borderRadius: '14px', padding: '22px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Source-backed event inventory</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {events.map((event) => <div key={event.date} style={{ display: 'grid', gridTemplateColumns: '125px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
          <strong>{event.date}</strong><span>{event.name}</span><span style={{ color: 'var(--text-muted)' }}>{event.labels}</span>
        </div>)}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.55, margin: '14px 0 0' }}>
        July 24–25, 2024 is the verified replay window. The source reports identify affected localities but not precise road points, so these events are evidence of flooding, not segment-level training labels. Current exports are a decision-support prototype, not an official emergency service.
      </p>
    </section>
  </div>
);
