import { useState, type FC } from 'react';
import {
  Map,
  BarChart3,
  Info,
  Moon,
  Sun,
  AlertCircle,
  X,
  Menu,
  ChevronRight,
  Home,
  ShieldCheck,
  CalendarClock,
  Settings,
  Bell
} from 'lucide-react';
import axios from 'axios';

interface NavbarProps {
  activeTab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay';
  setActiveTab: (tab: 'home' | 'signin' | 'map' | 'evaluate' | 'limits' | 'replay') => void;
  onOpenAdminModal?: () => void;
  onOpenAdminNotifications?: () => void;
  onOpenReplay?: () => void;
  scenario?: 'live' | 'storm_july2024';
  setScenario?: (scen: 'live' | 'storm_july2024') => void;
  rainAgeMin?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdminModal,
  onOpenAdminNotifications,
  onOpenReplay,
  theme = 'light',
  setTheme
}) => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  const enablePush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushStatus('Push notifications are not supported in this browser.');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus('Allow notifications in your browser to receive updates.');
        return;
      }
      const { data } = await axios.get('/api/notifications/public-key');
      await navigator.serviceWorker.register('/sw.js');
      const ready = await navigator.serviceWorker.ready;
      const decodeKey = (value: string) => {
        const padding = '='.repeat((4 - value.length % 4) % 4);
        const raw = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
        return Uint8Array.from(raw, (char) => char.charCodeAt(0));
      };
      const subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(data.public_key)
      });
      await axios.post('/api/notifications/subscribe', subscription.toJSON());
      setPushStatus('This device is subscribed to JalDrishti updates.');
    } catch (error: any) {
      setPushStatus(error?.response?.data?.detail || 'Could not enable notifications.');
    }
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
              Decision-support prototype, not an official emergency service. In emergencies, contact official emergency services.
            </span>
          </div>

          <button
            onClick={() => setShowDisclaimer(false)}
            aria-label="Dismiss safety notice"
            title="Dismiss notice"
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

            {/* Pune Pilot Label */}
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--accent-beige-dark, #4b4836)',
                background: 'var(--accent-beige-light, #E7DDCC)',
                padding: '1px 7px',
                borderRadius: '9999px',
                border: '1px solid var(--border-color, #E4DACA)',
                letterSpacing: '0.1px'
              }}
            >
              Pune Pilot
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
            <span>Early-Warning Map</span>
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
            <span>Model Accuracy</span>
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
            <span>Data & Limitations</span>
          </button>

          {/* Theme Switcher */}
          {setTheme && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #E4DACA)',
                background: 'var(--bg-widget, #FFFCF6)',
                color: 'var(--text-main, #25251F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="#d97706" />}
            </button>
          )}

          <button onClick={onOpenAdminNotifications} title="Admin notification center" aria-label="Admin notification center" style={{
            height: '32px', padding: '0 9px', borderRadius: '8px',
            border: '1px solid var(--border-color, #E4DACA)',
            background: 'var(--bg-widget, #FFFCF6)', color: 'var(--text-main, #25251F)',
            display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px'
          }}><Bell size={14} /> Notifications</button>
          <button onClick={enablePush} title="Enable browser notifications" style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted, #706D62)',
            cursor: 'pointer', fontSize: '11px', padding: '4px'
          }}>Enable alerts</button>

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
          <button onClick={onOpenAdminNotifications} aria-label="Admin notification center" title="Admin notification center" style={{
            width: '34px', height: '34px', borderRadius: '8px',
            border: '1px solid var(--border-color, #E4DACA)', background: 'var(--bg-card, #FFFCF6)',
            color: 'var(--text-main, #25251F)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}><Bell size={16} /></button>
          <button
            onClick={enablePush}
            aria-label="Enable browser notifications"
            title="Enable notifications"
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid var(--border-color, #E4DACA)',
              background: 'var(--bg-card, #FFFCF6)', color: 'var(--text-main, #25251F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          ><AlertCircle size={16} /></button>
          {setTheme && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
              style={{
                width: '34px',
                height: '34px',
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
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#d97706" />}
            </button>
          )}

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
                  Navigation
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
                  <span>Home / Overview</span>
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
                  <span>Early-Warning Map</span>
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
                  <span>Model Accuracy & Trust</span>
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
                  <span>Data & Limitations</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #706D62)" />
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenAdminModal?.(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                  borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-main, #25251F)',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500, textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={18} color="var(--accent-cyan, #77745B)" /><span>Admin &amp; Sandbox</span></div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CalendarClock size={18} color="var(--accent-cyan, #77745B)" /><span>Historical Replay</span></div>
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
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)' }}>
                Pune Municipal Corridor Pilot <br />
                Aundh – Baner Road Network
              </div>

              {setTheme && (
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #E4DACA)',
                    background: 'var(--bg-widget, #FFFCF6)',
                    color: 'var(--text-main, #25251F)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon size={15} />
                      <span>Switch to Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun size={15} color="#d97706" />
                      <span>Switch to Light Theme</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
