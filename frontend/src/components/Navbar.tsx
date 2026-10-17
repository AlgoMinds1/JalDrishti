import { useCallback, useEffect, useState, type FC } from 'react';
import axios from 'axios';
import {
  Map,
  BarChart3,
  Info,
  AlertCircle,
  X,
  Menu,
  ChevronRight,
  Home,
  ShieldCheck,
  CalendarClock,
  Settings,
  Bell,
  Volume2,
  Square
} from 'lucide-react';
import { enableBrowserPush } from '../services/push';
import { speechLocale, useAppLanguage } from '../language';

interface NavbarProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay') => void;
  onOpenAdminModal?: () => void;
  onOpenAdminNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenReplay?: () => void;
  scenario?: 'live' | 'storm_july2024';
  setScenario?: (scen: 'live' | 'storm_july2024') => void;
  rainAgeMin?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

interface AppNotice { id: number; title: string; body: string; translations?: Partial<Record<'en' | 'hi' | 'mr', { title?: string; body?: string }>>; created_at: string }

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdminModal,
  onOpenAdminNotifications,
  onOpenSettings,
  onOpenReplay,
}) => {
  const { language, t } = useAppLanguage();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [notifications, setNotifications] = useState<AppNotice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications/feed?limit=30');
      const rows = data as AppNotice[];
      setNotifications(rows);
      let readIds: number[] = [];
      try { readIds = JSON.parse(localStorage.getItem('jaldrishti_read_notifications') || '[]'); } catch { /* reset malformed local state */ }
      setUnreadCount(rows.filter(row => !readIds.includes(row.id)).length);
      return rows;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
    const interval = window.setInterval(() => { void fetchNotifications(); }, 10000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const toggleInbox = async () => {
    if (isInboxOpen) { setIsInboxOpen(false); return; }
    setIsInboxOpen(true);
    const latest = await fetchNotifications();
    let readIds: number[] = [];
    try { readIds = JSON.parse(localStorage.getItem('jaldrishti_read_notifications') || '[]'); } catch { /* reset malformed local state */ }
    const updated = Array.from(new Set([...readIds, ...latest.map(row => row.id)])).slice(-100);
    localStorage.setItem('jaldrishti_read_notifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  const enablePush = async () => {
    try {
      await enableBrowserPush();
      setPushStatus(t('subscribed'));
    } catch (error: any) {
      setPushStatus(error?.response?.data?.detail || t('pushError'));
    }
  };

  const speakNotice = (notice: AppNotice) => {
    if (!('speechSynthesis' in window)) { setPushStatus(t('speechUnsupported')); return; }
    if (speakingId === notice.id) { window.speechSynthesis.cancel(); setSpeakingId(null); return; }
    const localized = notice.translations?.[language];
    const parts = [
      { text: localized?.title?.trim() || notice.title, lang: localized?.title?.trim() ? speechLocale(language) : 'en-IN' },
      { text: localized?.body?.trim() || notice.body, lang: localized?.body?.trim() ? speechLocale(language) : 'en-IN' },
    ].filter(part => part.text);
    window.speechSynthesis.cancel();
    setSpeakingId(notice.id);
    parts.forEach((part, index) => {
      const utterance = new SpeechSynthesisUtterance(part.text);
      utterance.lang = part.lang;
      if (index === parts.length - 1) {
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
      }
      window.speechSynthesis.speak(utterance);
    });
  };

  const handleNavigate = (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'relative',
        zIndex: 1100,
        width: '100%',
        paddingTop: 'var(--sat, 0px)',
        background: 'var(--bg-card, #FFFCF6)',
        borderBottom: '1px solid var(--border-color, #E4DACA)'
      }}
    >
      {/* Slim, Dismissible Safety Banner */}
      {showDisclaimer && (
        <div
          style={{
            background: 'var(--accent-beige-light, #E7DDCC)',
            color: 'var(--text-main, #25251F)',
            fontSize: '11px',
            lineHeight: 1.3,
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderBottom: '1px solid var(--border-color, #E4DACA)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            <AlertCircle size={13} color="var(--accent-cyan, #77745B)" style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500
              }}
            >
              {t('safety')}
            </span>
          </div>

          <button
            onClick={() => setShowDisclaimer(false)}
            aria-label={t('dismiss')}
            title={t('dismiss')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #706D62)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              flexShrink: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          height: '52px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: JalDrishti Brand & Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => handleNavigate('home')}
          title="Return to Home"
        >
          {/* Logo Badge */}
          <div
            style={{
              background: 'var(--accent-beige-gradient, linear-gradient(135deg, #77745B, #5e5b44))',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(119, 116, 91, 0.25)',
              flexShrink: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 14C4.567 14 3 12.433 3 10.5C3 8.736 4.305 7.279 6.012 7.039C6.527 4.725 8.583 3 11 3C13.844 3 16.2 5.093 16.592 7.808C18.528 8.169 20 9.845 20 11.875C20 14.153 18.153 16 15.875 16H6.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17.5C5.5 16.5 7.5 16.5 9 17.5C10.5 18.5 12.5 18.5 14 17.5C15.5 16.5 17.5 16.5 19 17.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20.5C6.5 19.5 8.5 19.5 10 20.5C11.5 21.5 13.5 21.5 15 20.5C16.5 19.5 18.5 19.5 20 20.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-main, #25251F)',
                letterSpacing: '-0.3px'
              }}
            >
              JalDrishti
            </span>

          </div>
        </div>

        {/* Desktop Navigation Links (Visible only on desktop screens >= 1024px) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <button
            onClick={() => handleNavigate('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === 'map' || activeTab === 'replay' ? '1px solid var(--accent-cyan, #77745B)' : '1px solid transparent',
              background: activeTab === 'map' || activeTab === 'replay' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
              color: activeTab === 'map' || activeTab === 'replay' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
              fontSize: '13px',
              fontWeight: activeTab === 'map' || activeTab === 'replay' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Map size={15} />
            <span>{t('map')}</span>
          </button>

          <button
            onClick={() => handleNavigate('evaluate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === 'evaluate' ? '1px solid var(--accent-cyan, #77745B)' : '1px solid transparent',
              background: activeTab === 'evaluate' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
              color: activeTab === 'evaluate' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
              fontSize: '13px',
              fontWeight: activeTab === 'evaluate' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={15} />
            <span>{t('accuracy')}</span>
          </button>

          <button
            onClick={() => handleNavigate('limits')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === 'limits' ? '1px solid var(--accent-cyan, #77745B)' : '1px solid transparent',
              background: activeTab === 'limits' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
              color: activeTab === 'limits' ? 'var(--accent-beige-dark, #4b4836)' : 'var(--text-muted, #706D62)',
              fontSize: '13px',
              fontWeight: activeTab === 'limits' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Info size={15} />
            <span>{t('data')}</span>
          </button>

          <button onClick={onOpenSettings} title={t('settings')} aria-label={t('settings')} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color, #E4DACA)', background: 'var(--bg-widget, #FFFCF6)', color: 'var(--text-main, #25251F)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Settings size={15} /></button>
          <button onClick={toggleInbox} title={t('notifications')} aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount}` : ''}`} style={{
            height: '32px', padding: '0 9px', borderRadius: '8px',
            border: '1px solid var(--border-color, #E4DACA)',
            background: 'var(--bg-widget, #FFFCF6)', color: 'var(--text-main, #25251F)',
            display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', position: 'relative'
          }}><Bell size={14} /> {t('notifications')}{unreadCount > 0 && <span aria-label="Unread notifications" style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: '#dc2626', border: '2px solid var(--bg-card, #FFFCF6)' }} />}</button>
          <button onClick={onOpenAdminNotifications} title={t('adminNotifications')} aria-label={t('adminNotifications')} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color, #E4DACA)', background: 'var(--bg-widget, #FFFCF6)', color: 'var(--text-main, #25251F)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ShieldCheck size={15} /></button>
          <button onClick={enablePush} title="Enable browser notifications" style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted, #706D62)',
            cursor: 'pointer', fontSize: '11px', padding: '4px'
          }}>{t('enableAlerts')}</button>

          {/* User Profile Avatar */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-beige-light, #E7DDCC)',
              color: 'var(--accent-beige-dark, #4b4836)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color, #E4DACA)'
            }}
          >
            PS
          </div>
        </div>

        {/* Mobile Right Action: Compact Menu Button */}
        <div className="mobile-only" style={{ alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={toggleInbox} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} title="Notifications" style={{
            width: '34px', height: '34px', borderRadius: '8px',
            border: '1px solid var(--border-color, #E4DACA)', background: 'var(--bg-card, #FFFCF6)',
            color: 'var(--text-main, #25251F)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
          }}><Bell size={16} />{unreadCount > 0 && <span aria-label="Unread notifications" style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '1px solid var(--bg-card, #FFFCF6)' }} />}</button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #E4DACA)',
              background: 'var(--bg-card, #FFFCF6)',
              color: 'var(--text-main, #25251F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>
      {pushStatus && <div role="status" style={{ padding: '5px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>{pushStatus}</div>}
      {isInboxOpen && <section role="dialog" aria-label={t('notifications')} style={{ position: 'fixed', top: 'calc(var(--sat, 0px) + 72px)', right: 12, zIndex: 2600, width: 'min(380px, calc(100vw - 24px))', maxHeight: 'min(70vh, 520px)', overflowY: 'auto', background: 'var(--bg-card, #FFFCF6)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,.22)' }}>
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}><strong>{t('notifications')}</strong><button onClick={() => setIsInboxOpen(false)} aria-label={t('closeNotifications')} style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={17} /></button></div>
        {notifications.length === 0 ? <p style={{ padding: 16, margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>{t('inboxEmpty')}</p> : notifications.map(item => { const localized = item.translations?.[language]; const title = localized?.title ?? item.title; const body = localized?.body ?? item.body; return <article key={item.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}><div style={{ display: 'flex', alignItems: 'start', gap: 8 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div><div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45 }}>{body}</div></div><button onClick={() => speakNotice(item)} aria-label={speakingId === item.id ? t('stop') : t('speak')} title={speakingId === item.id ? t('stop') : t('speak')} style={{ flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: 7, padding: 6, background: 'var(--bg-pill)', color: 'var(--text-main)', cursor: 'pointer' }}>{speakingId === item.id ? <Square size={14} /> : <Volume2 size={16} />}</button></div><time style={{ display: 'block', marginTop: 6, color: 'var(--text-muted)', fontSize: 10 }}>{new Date(item.created_at).toLocaleString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN')}</time></article>; })}
      </section>}

      {/* Slide-out Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(37, 37, 31, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: 'var(--bg-card, #FFFCF6)',
              borderLeft: '1px solid var(--border-color, #E4DACA)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
              paddingTop: 'calc(var(--sat, 0px) + 16px)',
              paddingBottom: 'calc(var(--sab, 0px) + 20px)'
            }}
            className="animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color, #E4DACA)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--accent-cyan, #77745B)" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  {t('navigation')}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #706D62)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', flex: 1 }}>
              <button
                onClick={() => handleNavigate('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'home' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                  color: 'var(--text-main, #25251F)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'home' ? 700 : 500,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Home size={18} color="var(--accent-cyan, #77745B)" />
                  <span>{t('home')}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => handleNavigate('map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'map' || activeTab === 'replay' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                  color: 'var(--text-main, #25251F)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'map' || activeTab === 'replay' ? 700 : 500,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Map size={18} color="var(--accent-cyan, #77745B)" />
                  <span>{t('map')}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => handleNavigate('evaluate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'evaluate' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                  color: 'var(--text-main, #25251F)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'evaluate' ? 700 : 500,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={18} color="var(--accent-cyan, #77745B)" />
                  <span>{t('accuracyTrust')}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => handleNavigate('limits')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'limits' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                  color: 'var(--text-main, #25251F)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'limits' ? 700 : 500,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={18} color="var(--accent-cyan, #77745B)" />
                  <span>{t('data')}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenSettings?.(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                  borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-main, #25251F)',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500, textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={18} color="var(--accent-cyan, #77745B)" /><span>{t('settings')}</span></div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenReplay?.(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                  borderRadius: '10px', border: 'none', background: activeTab === 'replay' ? 'var(--accent-beige-light, #E7DDCC)' : 'transparent',
                  color: 'var(--text-main, #25251F)', cursor: 'pointer', fontSize: '14px',
                  fontWeight: activeTab === 'replay' ? 700 : 500, textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CalendarClock size={18} color="var(--accent-cyan, #77745B)" /><span>{t('replay')}</span></div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>
            </div>

            {/* Footer with Pilot Info & Theme Toggle */}
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color, #E4DACA)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <button onClick={() => { setIsMobileMenuOpen(false); onOpenAdminModal?.(); }} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', background: 'var(--bg-widget)', color: 'var(--text-main)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('adminSandbox')}</button>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)' }}>
                {t('pilot')} <br />
                Aundh – Baner Road Network
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
};
