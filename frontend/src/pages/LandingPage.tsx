import { useState, type FC } from 'react';
import {
  CloudRain,
  AlertTriangle,
  Users,
  Sprout,
  ArrowRight,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  BarChart3,
  Info
} from 'lucide-react';

interface LandingPageProps {
  onLaunchMap: () => void;
  onNavigate?: (tab: 'map' | 'evaluate' | 'limits') => void;
  onOpenSignIn?: () => void;
}

export const LandingPage: FC<LandingPageProps> = ({ onLaunchMap, onNavigate, onOpenSignIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="landing-page-container"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'var(--bg-primary, #faf7f0)',
        color: 'var(--text-main, #1d2821)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. TOP NAVBAR */}
      <nav className="landing-nav">
        {/* Left: Brand Logo */}
        <div
          className="landing-nav-brand"
          onClick={onLaunchMap}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-beige-dark, #28392c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(40, 57, 44, 0.25)',
              flexShrink: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 13C4.567 13 3 11.433 3 9.5C3 7.736 4.305 6.279 6.012 6.039C6.527 3.725 8.583 2 11 2C13.844 2 16.2 4.093 16.592 6.808C18.528 7.169 20 8.845 20 10.875C20 13.153 18.153 15 15.875 15H6.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17C6 15.8 8.5 15.8 10.5 17C12.5 18.2 15 18.2 17 17C18.5 16.1 19.5 16.2 20.5 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 20.5C6 19.3 8.5 19.3 10.5 20.5C12.5 21.7 15 21.7 17 20.5C18.5 19.6 19.5 19.7 20.5 20.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a241e', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              JalDrishti
            </div>
            <div style={{ fontSize: '10.5px', color: '#687569', fontWeight: 500 }}>
              Pune Flood Forecasting
            </div>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop only - Dead-centered in the viewport) */}
        <div className="landing-nav-center desktop-only">
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#1f2820', cursor: 'pointer' }}>
              Home
            </span>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2.5px',
                background: '#28392c',
                borderRadius: '2px'
              }}
            />
          </div>

          <span
            onClick={() => onNavigate && onNavigate('evaluate')}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            About & Accuracy
          </span>

          <span
            onClick={() => onNavigate && onNavigate('limits')}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            Data & Limits
          </span>
        </div>

        {/* Right: Action Buttons (Desktop only - Pinned to far right) */}
        <div className="landing-nav-actions desktop-only">
          <button
            onClick={onOpenSignIn || onLaunchMap}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '1px solid #d9cebe',
              background: '#faf6ee',
              color: '#28392c',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f2ebd9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#faf6ee'; }}
          >
            Sign In
          </button>

          <button
            onClick={onLaunchMap}
            style={{
              padding: '8px 22px',
              borderRadius: '9999px',
              border: 'none',
              background: '#28392c',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(40, 57, 44, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e2b21'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#28392c'; }}
          >
            Launch Map
          </button>
        </div>

        {/* Mobile Right Action: Launch Map Pill & Hamburger Menu */}
        <div className="landing-nav-mobile mobile-only">
          <button
            onClick={onLaunchMap}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: '#28392c',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(40, 57, 44, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Launch Map</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #d9cebe',
              background: '#faf6ee',
              color: '#28392c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* Slide-out Mobile Menu Drawer */}
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
            className="animate-slide-right"
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: '#faf7f0',
              borderLeft: '1px solid #E4DACA',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
              paddingTop: 'calc(var(--sat, 0px) + 16px)',
              paddingBottom: 'calc(var(--sab, 0px) + 20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid #E4DACA'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#28392c" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a241e' }}>
                  JalDrishti
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ background: 'transparent', border: 'none', color: '#687569', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', flex: 1 }}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLaunchMap();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#28392c',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Live Flood Map</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigate) onNavigate('evaluate');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1a241e',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BarChart3 size={17} color="#28392c" />
                <span>Model Accuracy</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigate) onNavigate('limits');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1a241e',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Info size={17} color="#28392c" />
                <span>Data & Limitations</span>
              </button>
            </div>

            {/* Footer */}
            {onOpenSignIn && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSignIn();
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #d9cebe',
                  background: '#faf6ee',
                  color: '#28392c',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In / PMC Official
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. HERO SECTION — Clean background with scenic Pune artwork on the right */}
      <section
        className="landing-hero"
        style={{
          width: '100%',
          backgroundImage: 'url(/pune-hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          minHeight: '560px',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Soft atmospheric gradient wash ensuring high legibility for text while preserving right-side artwork */}
        <div className="landing-hero-overlay" />

        {/* Hero Left Content Column */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '560px'
          }}
        >
          {/* Pune Pilot Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ebdcc9',
              color: '#6d4c26',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 700,
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(80, 60, 40, 0.06)'
            }}
          >
            <MapPin size={12} color="#6d4c26" />
            <span>Pune Pilot</span>
          </div>

          {/* Main Headline */}
          <h1 className="landing-title">
            Forecasting<br />
            Waterlogging,<br />
            Building a Safer Pune.
          </h1>

          {/* Subtitle */}
          <p className="landing-subtitle">
            JalDrishti uses real-time weather data and AI to predict waterlogging on Pune’s roads and neighbourhoods — helping citizens and authorities stay one step ahead.
          </p>

          {/* Action Buttons */}
          <div className="landing-hero-actions">
            <button
              onClick={onLaunchMap}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#28392c',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '14.5px',
                fontWeight: 650,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(40, 57, 44, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>View Live Map</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('evaluate')}
              style={{
                background: '#f7f1e4',
                color: '#28392c',
                padding: '12px 24px',
                borderRadius: '9999px',
                border: '1px solid #d9cebe',
                fontSize: '14.5px',
                fontWeight: 650,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(80, 60, 40, 0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* 3. SOFT ORGANIC TRANSITION WAVE */}
      <div style={{ position: 'relative', marginTop: '-36px', zIndex: 15 }}>
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '50px', display: 'block' }}>
          <path d="M0 35C280 12 560 52 840 28C1120 5 1320 40 1440 32V70H0V35Z" fill="var(--bg-primary, #faf7f0)" />
        </svg>
      </div>

      {/* 4. FOUR KEY CAPABILITIES CARDS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="landing-capabilities-grid">
          {/* Card 1: Hyperlocal Forecasts */}
          <div
            style={{
              background: '#FFFCF6',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E4DACA',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(37, 37, 31, 0.04)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#e8ebe2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#344638'
              }}
            >
              <CloudRain size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Hyperlocal Forecasts
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#556357', margin: 0 }}>
              Predicts waterlogging at road and neighbourhood level (1–6 hours ahead).
            </p>
          </div>

          {/* Card 2: Real-Time Insights */}
          <div
            style={{
              background: '#FFFCF6',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E4DACA',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(37, 37, 31, 0.04)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#f6e7d8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a8611c'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Real-Time Insights
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#556357', margin: 0 }}>
              Live radar rainfall, risk maps and easy-to-understand alerts.
            </p>
          </div>

          {/* Card 3: For Citizens & Authorities */}
          <div
            style={{
              background: '#FFFCF6',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E4DACA',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(37, 37, 31, 0.04)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#e3eae1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#344638'
              }}
            >
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Citizens & Authorities
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#556357', margin: 0 }}>
              Plan dry travel, deploy civic de-watering pumps, and respond faster.
            </p>
          </div>

          {/* Card 4: A More Resilient Pune */}
          <div
            style={{
              background: '#FFFCF6',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E4DACA',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(37, 37, 31, 0.04)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#dfeadb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2e4933'
              }}
            >
              <Sprout size={20} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Resilient Pune
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#556357', margin: 0 }}>
              Safer roads, smoother mobility and stronger civic communities.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM BANNER */}
      <section className="landing-bottom-banner">
        <div
          style={{
            background: '#f1ecd9',
            border: '1px solid #e2d7c0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e3dcbe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3d4d39',
                flexShrink: 0
              }}
            >
              <Sprout size={18} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#253527', letterSpacing: '-0.2px' }}>
              Data-driven foresight for a safer, more resilient Pune.
            </div>
          </div>

          <div style={{ width: '100%', height: '32px', overflow: 'hidden', opacity: 0.7 }}>
            <svg viewBox="0 0 440 42" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
              <path d="M 330 42 C 360 20 400 15 440 28 L 440 42 Z" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <rect x="382" y="10" width="16" height="18" stroke="#687864" strokeWidth="1.2" fill="#f1ecd9" />
              <path d="M 270 42 L 270 30 C 285 24 315 24 330 30 L 330 42" stroke="#687864" strokeWidth="1.2" fill="none" />
              <rect x="180" y="24" width="16" height="18" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <rect x="198" y="16" width="18" height="26" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <rect x="220" y="22" width="22" height="20" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <polygon points="231,14 225,22 237,22" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <rect x="130" y="28" width="18" height="14" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <circle cx="160" cy="30" r="8" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <circle cx="170" cy="34" r="6" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};
