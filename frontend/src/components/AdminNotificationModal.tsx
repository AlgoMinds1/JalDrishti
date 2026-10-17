import { useState, type FC, type FormEvent } from 'react';
import axios from 'axios';
import { Bell, X } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void }

export const AdminNotificationModal: FC<Props> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState(() => sessionStorage.getItem('jaldrishti_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [title, setTitle] = useState('JalDrishti update');
  const [message, setMessage] = useState('');
  const [delayHours, setDelayHours] = useState(2);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const authHeader = { Authorization: `Bearer ${password}` };
  const signIn = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setStatus('');
    try {
      const response = await axios.get('/api/notifications/admin-session', { headers: authHeader });
      sessionStorage.setItem('jaldrishti_admin_token', password);
      setDeviceCount(response.data.opted_in_devices);
      setIsAuthenticated(true);
    } catch (error: any) {
      setStatus(error?.response?.data?.detail || 'Admin sign-in failed.');
    } finally { setBusy(false); }
  };

  const schedule = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setStatus('');
    try {
      const dueAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
      const response = await axios.post('/api/notifications/broadcasts', {
        title, body: message, due_at: dueAt
      }, { headers: authHeader });
      setStatus(`Scheduled for ${new Date(response.data.due_at).toLocaleString()}.`);
      setMessage('');
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
            <form onSubmit={schedule} style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-primary, #F5F0E7)', color: 'var(--text-main)', fontSize: 13 }}>
                <strong>{deviceCount ?? 0} opted-in browser{deviceCount === 1 ? '' : 's'}</strong>
                <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>This prototype has no named user accounts; these are subscribed devices.</div>
              </div>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Title<input maxLength={120} required value={title} onChange={e => setTitle(e.target.value)} style={fieldStyle} /></label>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Message<textarea maxLength={500} required rows={3} value={message} onChange={e => setMessage(e.target.value)} style={fieldStyle} placeholder="Write your message for app users" /></label>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Send after
                <select value={delayHours} onChange={e => setDelayHours(Number(e.target.value))} style={{ ...fieldStyle, width: 'auto' }}>
                  {[1, 2, 3, 6, 12, 24].map(hours => <option key={hours} value={hours}>{hours} hour{hours === 1 ? '' : 's'}</option>)}
                </select>
              </label>
              <button disabled={busy || !message.trim()} style={{ border: 0, borderRadius: 7, padding: 11, color: '#fff', background: 'var(--accent-beige-gradient)', fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Scheduling…' : 'Schedule push notification'}</button>
            </form>
          )}
          {status && <p role="status" style={{ margin: '12px 0 0', color: 'var(--text-main)', fontSize: 12 }}>{status}</p>}
        </div>
      </section>
    </div>
  );
};
