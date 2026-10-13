import type { FC } from 'react';
import { AlertTriangle, Database, CloudOff } from 'lucide-react';

export const LimitationsPage: FC = () => {
  return (
    <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px', color: '#f8fafc' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
          Data Transparency, Bias & Limitations
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
          JalDrishti operates on the principle of extreme honesty regarding data provenance,
          sensor uncertainties, and algorithmic boundaries.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Label Bias */}
        <div className="glass" style={{ borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#fbbf24' }}>
            <Database size={20} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              1. Ground Truth Provenance & Label Bias Statement
            </h2>
          </div>
          <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '10px' }}>
              Historical waterlogging records in Indian municipal contexts are sparse and subject to reporting bias:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Reporting Density:</strong> Official complaints concentrate heavily on busy arterial corridors (Sinhagad Road, Baner, Khadki Underpasses) and higher-income wards. Residential alleyways have fewer historical records.</li>
              <li><strong>Conflicting Lists:</strong> PMC and Pune Traffic Police maintain distinct hotspot counts (26 police spots, 120 PMC chronic spots, and expanded lists up to 260 spots). JalDrishti uses their union with explicit source attribution.</li>
              <li><strong>Physical Ground Truth:</strong> We bridge this gap using physical hydraulic terrain constraints (GLO-30 elevation, HAND raster, and municipal stormwater drain coverage) rather than relying solely on complaint counts.</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Sensor Freshness */}
        <div className="glass" style={{ borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#38bdf8' }}>
            <CloudOff size={20} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              2. Forecast Uncertainty & Latency
            </h2>
          </div>
          <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '10px' }}>
              Numerical weather prediction has inherent variance during rapid convective monsoon cloudbursts:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Ensemble Spread:</strong> JalDrishti tracks forecast variance using 30-member ensemble models. When ensemble spread exceeds 8 mm, the confidence rating automatically degrades to Medium or Low.</li>
              <li><strong>Data Age Degradation:</strong> Open-Meteo forecasts update hourly. If data age exceeds 45 minutes, the confidence score is visibly penalized, and stale indicators are displayed.</li>
              <li><strong>Out-of-Distribution (OOD):</strong> If forecasted hourly rainfall exceeds 150 mm/h (exceeding historical maximums), the model flags the event as Out-Of-Distribution and falls back to conservative hydraulic flood limits.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Prototype Disclaimer */}
        <div className="glass" style={{ borderRadius: '14px', padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#f87171' }}>
            <AlertTriangle size={20} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              3. Operational & Legal Disclaimer
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7' }}>
            JalDrishti is an early-warning <strong>decision-support prototype</strong> created for civic planning, municipal transit routing, and citizen awareness. It is not an official municipal disaster management service. Routes recommended reflect <em>"lower predicted risk"</em> and must never be interpreted as an absolute guarantee of safe transit. In emergency situations, follow instructions issued by Pune Municipal Corporation (PMC) and emergency response (112).
          </p>
        </div>
      </div>
    </div>
  );
};
