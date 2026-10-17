import { useCallback, useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import axios from 'axios';
import { Bell, FileText, Image, X } from 'lucide-react';
import { enableBrowserPush } from '../services/push';

interface Props { isOpen: boolean; onClose: () => void }
interface CitizenReport { id: string; description: string; language: string; created_at: string | null; lat: number; lon: number; trust_score: number | null; state: string | null; has_photo: boolean }

export const AdminNotificationModal: FC<Props> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [title, setTitle] = useState('JalDrishti update');
  const [message, setMessage] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [hindiMessage, setHindiMessage] = useState('');
  const [marathiTitle, setMarathiTitle] = useState('');
  const [marathiMessage, setMarathiMessage] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [activePanel, setActivePanel] = useState<'compose' | 'reports'>('reports');
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [reportStatus, setReportStatus] = useState('');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const photoUrlsToRevoke = useRef<Set<string>>(new Set());
  const knownReportIds = useRef<Set<string>>(new Set());

  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get<CitizenReport[]>('/api/notifications/admin/reports?limit=50', {
        headers: { 'X-Admin-Password': password },
      });
      const newCount = response.data.filter(report => !knownReportIds.current.has(report.id)).length;
      if (knownReportIds.current.size && newCount) setReportStatus(`${newCount} new citizen report${newCount === 1 ? '' : 's'} received.`);
      const reportIds = response.data.map(report => report.id);
      if (!knownReportIds.current.size && !sessionStorage.getItem('jaldrishti_admin_read_report_ids')) {
        sessionStorage.setItem('jaldrishti_admin_read_report_ids', JSON.stringify(reportIds));
      }
      knownReportIds.current = new Set(reportIds);
      setReports(response.data);
      return true;
    } catch (error: any) {
      setReportStatus(error?.response?.data?.detail || 'Could not load citizen reports.');
      return false;
    }
  }, [password]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    void fetchReports();
    const interval = window.setInterval(() => { void fetchReports(); }, 15000);
    return () => window.clearInterval(interval);
  }, [isOpen, isAuthenticated, fetchReports]);

  useEffect(() => () => {
    photoUrlsToRevoke.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  const loadReportPhoto = async (reportId: string) => {
    if (photoUrls[reportId]) return;
    setLoadingPhotoId(reportId);
    try {
      let response;
      try {
        response = await axios.get(`/api/notifications/admin/reports/${encodeURIComponent(reportId)}/photo`, {
          responseType: 'blob', headers: { 'X-Admin-Password': password },
        });
      } catch {
        // Older API deployments expose the same stored image through the report resource route.
        response = await axios.get(`/api/reports/${encodeURIComponent(reportId)}/photo`, { responseType: 'blob' });
      }
      const imageBlob = response.data as Blob;
      const contentType = response.headers['content-type'] || imageBlob.type;
      if (typeof contentType !== 'string' || !contentType.startsWith('image/')) {
        throw new Error('The report photo endpoint returned a non-image response.');
      }
      const url = URL.createObjectURL(imageBlob);
      photoUrlsToRevoke.current.add(url);
      setPhotoUrls(current => ({ ...current, [reportId]: url }));
    } catch (error: any) {
      setReportStatus(error?.message || error?.response?.data?.detail || 'Could not load this report photo.');
    } finally { setLoadingPhotoId(null); }
  };

  if (!isOpen) return null;

  const signIn = async (e: FormEvent) => {
    e.preventDefault(); setStatus(''); setBusy(true);
    if (password !== '123456') { setStatus('Incorrect admin password.'); setBusy(false); return; }
    setIsAuthenticated(true);
    sessionStorage.setItem('jaldrishti_admin_password', password);
    setReportStatus('');
    setActivePanel('reports');
    void fetchReports();
    try {
      const response = await axios.get('/api/notifications/subscriber-count');
      setDeviceCount(response.data.opted_in_devices);
    } catch {
      setStatus('Signed in. Subscriber count will appear when the updated API is running.');
    } finally { setBusy(false); }
  };

  const subscribeThisDevice = async () => {
    setBusy(true); setStatus('');
    try {
      await enableBrowserPush();
      const response = await axios.get('/api/notifications/subscriber-count');
      setDeviceCount(response.data.opted_in_devices);
      setStatus('This browser is subscribed and ready for the demo notification.');
    } catch (error: any) {
      setStatus(error?.response?.data?.detail || error?.message || 'Could not subscribe this browser.');
    } finally { setBusy(false); }
  };

  const sendNow = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setStatus('');
    try {
      const response = await axios.post('/api/notifications/broadcasts/send-now', {
        title, body: message,
        translations: {
          hi: { title: hindiTitle, body: hindiMessage },
          mr: { title: marathiTitle, body: marathiMessage },
        },
      });
      const delivery = response.data;
      setStatus(delivery.sent_count > 0
        ? `Added to the app inbox and sent immediately to ${delivery.sent_count} browser${delivery.sent_count === 1 ? '' : 's'}.`
        : !delivery.push_configured
          ? 'Added to the app inbox. Push delivery is not configured, but users can read it from the notification bell.'
          : delivery.recipient_count === 0
            ? 'Added to the app inbox immediately. No devices currently have push enabled; users can still read it from the notification bell.'
            : `Added to the app inbox. Push delivery failed for ${delivery.failed_count} device${delivery.failed_count === 1 ? '' : 's'}.`);
      setMessage('');
      setHindiMessage(''); setMarathiMessage('');
    } catch (error: any) {
      setStatus(error?.response?.data?.detail || 'Could not schedule the notification.');
    } finally { setBusy(false); }
  };

  const fieldStyle = { display: 'block', width: '100%', boxSizing: 'border-box' as const, padding: 10, marginTop: 5, borderRadius: 7, border: '1px solid var(--border-color)', background: 'var(--bg-pill)', color: 'var(--text-main)' };
  return (
    <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(20,20,18,.56)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="broadcast-title" style={{ width: 'min(460px, 96vw)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card, #FFFCF6)', border: '1px solid var(--border-color)', boxShadow: '0 18px 50px rgba(0,0,0,.24)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 id="broadcast-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--text-main)', fontSize: 17 }}><Bell size={18} /> Admin notifications</h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={19} /></button>
        </header>
        <div style={{ padding: 18 }}>
          {!isAuthenticated ? (
            <form onSubmit={signIn} style={{ display: 'grid', gap: 12 }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>Sign in to compose and schedule a push notification.</p>
              <label style={{ color: 'var(--text-main)', fontSize: 13 }}>Admin password
                <input autoFocus type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} />
              </label>
              <button disabled={busy} style={{ border: 0, borderRadius: 7, padding: 11, color: '#fff', background: 'var(--accent-beige-gradient)', fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
          ) : (
            <>
            <nav aria-label="Admin notification sections" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => setActivePanel('reports')} style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 8, padding: 9, background: activePanel === 'reports' ? 'var(--accent-beige-gradient)' : 'var(--bg-pill)', color: activePanel === 'reports' ? '#fff' : 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}><FileText size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Citizen reports{reports.length > 0 ? ` (${reports.length})` : ''}</button>
              <button type="button" onClick={() => setActivePanel('compose')} style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: 8, padding: 9, background: activePanel === 'compose' ? 'var(--accent-beige-gradient)' : 'var(--bg-pill)', color: activePanel === 'compose' ? '#fff' : 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}><Bell size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />Compose notice</button>
            </nav>
            {activePanel === 'reports' ? (
              <div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-primary, #F5F0E7)', color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>Private admin inbox. Incoming reports refresh automatically every 15 seconds.</div>
                {reportStatus && <p role="status" style={{ margin: '0 0 10px', color: 'var(--text-muted)', fontSize: 12 }}>{reportStatus}</p>}
                {reports.length === 0 ? <p style={{ margin: 0, padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No citizen reports received yet.</p> : <div style={{ display: 'grid', gap: 10, maxHeight: '52vh', overflowY: 'auto' }}>
                  {reports.map(report => <article key={report.id} style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 9, background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}><strong style={{ fontSize: 13, lineHeight: 1.4 }}>{report.description || 'No description provided.'}</strong><span style={{ flexShrink: 0, borderRadius: 99, background: 'var(--bg-pill)', padding: '3px 7px', fontSize: 10, color: 'var(--text-muted)' }}>{report.language.toUpperCase()}</span></div>
                    <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 11 }}>{report.created_at ? new Date(report.created_at).toLocaleString() : 'Time unavailable'} · {report.lat.toFixed(4)}, {report.lon.toFixed(4)} · Trust {Math.round(report.trust_score ?? 0)} · {report.state ?? 'Unverified'}</div>
                    {report.has_photo && <div style={{ marginTop: 9 }}>
                      {photoUrls[report.id] ? <img src={photoUrls[report.id]} alt="Photo attached to citizen report" style={{ display: 'block', maxWidth: '100%', maxHeight: 250, borderRadius: 7, objectFit: 'contain' }} /> : <button type="button" disabled={loadingPhotoId === report.id} onClick={() => void loadReportPhoto(report.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border-color)', borderRadius: 7, padding: '7px 9px', background: 'var(--bg-pill)', color: 'var(--text-main)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Image size={14} />{loadingPhotoId === report.id ? 'Loading photo…' : 'View uploaded photo'}</button>}
                    </div>}
                  </article>)}
                </div>}
              </div>
            ) : (
            <form onSubmit={sendNow} style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-primary, #F5F0E7)', color: 'var(--text-main)', fontSize: 13 }}>
                <strong>{deviceCount === null ? 'Subscriber count unavailable' : `${deviceCount} opted-in browser${deviceCount === 1 ? '' : 's'}`}</strong>
                <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>This prototype has no named user accounts; these are subscribed devices.</div>
              </div>
              <button type="button" disabled={busy} onClick={subscribeThisDevice} style={{ border: '1px solid var(--border-color)', borderRadius: 7, padding: 10, background: 'var(--bg-pill)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
                Enable notifications on this browser
              </button>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Title<input maxLength={120} required value={title} onChange={e => setTitle(e.target.value)} style={fieldStyle} /></label>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Message<textarea maxLength={500} required rows={3} value={message} onChange={e => setMessage(e.target.value)} style={fieldStyle} placeholder="Write your message for app users" /></label>
              <details style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                <summary style={{ cursor: 'pointer', padding: '3px 0 8px' }}>Optional Hindi and Marathi versions for users</summary>
                <label>Hindi title<input maxLength={120} value={hindiTitle} onChange={e => setHindiTitle(e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: 'block', marginTop: 8 }}>Hindi message<textarea maxLength={500} rows={2} value={hindiMessage} onChange={e => setHindiMessage(e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: 'block', marginTop: 8 }}>Marathi title<input maxLength={120} value={marathiTitle} onChange={e => setMarathiTitle(e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: 'block', marginTop: 8 }}>Marathi message<textarea maxLength={500} rows={2} value={marathiMessage} onChange={e => setMarathiMessage(e.target.value)} style={fieldStyle} /></label>
                <small>When a translation is left blank, that part uses the English version.</small>
              </details>
              <button disabled={busy || !message.trim()} style={{ border: 0, borderRadius: 7, padding: 11, color: '#fff', background: 'var(--accent-beige-gradient)', fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Sending…' : 'Send notification now'}</button>
            </form>
            )}
            </>
          )}
          {status && <p role="status" style={{ margin: '12px 0 0', color: 'var(--text-main)', fontSize: 12 }}>{status}</p>}
        </div>
      </section>
    </div>
  );
};
