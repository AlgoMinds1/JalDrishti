import { useEffect, useState, type FC } from 'react';
import { Bell, X } from 'lucide-react';
import { enableBrowserPush, hasBrowserPushSubscription } from '../services/push';

interface Props { isOpen: boolean; onClose: () => void }

export const NotificationPermissionPrompt: FC<Props> = ({ isOpen, onClose }) => {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const check = async () => {
      if (!('Notification' in window) || Notification.permission === 'denied') {
        if (active) onClose();
        return;
      }
      if (await hasBrowserPushSubscription()) {
        if (active) onClose();
        return;
      }
      if (active) setAvailable(true);
    };
    void check();
    return () => { active = false; };
  }, [isOpen, onClose]);

  if (!isOpen || !available) return null;

  const allow = async () => {
    setBusy(true); setError('');
    try {
      await enableBrowserPush();
      localStorage.setItem('jaldrishti_push_prompt_dismissed', 'true');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Could not enable notifications.');
    } finally { setBusy(false); }
  };

  const dismiss = () => {
    localStorage.setItem('jaldrishti_push_prompt_dismissed', 'true');
    onClose();
  };

  return (
    <aside role="dialog" aria-modal="false" aria-labelledby="push-prompt-title" style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 2400, width: 'min(360px, calc(100vw - 32px))',
      padding: 16, borderRadius: 14, background: 'var(--bg-card, #FFFCF6)',
      border: '1px solid var(--border-color, #E4DACA)', boxShadow: '0 12px 36px rgba(37,37,31,.22)', color: 'var(--text-main, #25251F)'
    }}>
      <button onClick={dismiss} aria-label="Close notification prompt" style={{ position: 'absolute', right: 10, top: 10, border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={17} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 20 }}>
        <Bell size={18} color="var(--accent-beige-dark, #4b4836)" />
        <strong id="push-prompt-title" style={{ fontSize: 15 }}>Allow notifications?</strong>
      </div>
      <p style={{ margin: '8px 0 12px', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.45 }}>
        Get JalDrishti updates on this device. You can change this permission in your browser settings.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={allow} disabled={busy} style={{ flex: 1, padding: 9, border: 0, borderRadius: 7, background: 'var(--accent-beige-gradient)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Enabling…' : 'Allow notifications'}</button>
        <button onClick={dismiss} disabled={busy} style={{ padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: 7, background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Not now</button>
      </div>
      {error && <div role="alert" style={{ marginTop: 8, color: 'var(--risk-severe, #b91c1c)', fontSize: 11 }}>{error}</div>}
    </aside>
  );
};
