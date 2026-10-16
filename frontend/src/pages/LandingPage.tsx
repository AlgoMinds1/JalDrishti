import { useState, type FC } from 'react';
import {
  CloudRain,
  AlertTriangle,
  Users,
  Sprout,
  ArrowRight,
  ChevronRight,
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
        background: 'var(--bg-primary, #faf7f0)',
        color: 'var(--text-main, #1d2821)',
        position: 'relative'
      }}
    >
      {/* 1. TOP NAVBAR */}
      <nav className="landing-nav">
        {/* Brand Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
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

        {/* Center Nav Links (Desktop Only: hidden on mobile) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2820', cursor: 'pointer' }}>
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
            style={{ fontSize: '14px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            About & Accuracy
          </span>

          <span
            onClick={() => onNavigate && onNavigate('limits')}
            style={{ fontSize: '14px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            Data & Limits
          </span>
        </div>

        {/* Desktop Right Action Buttons */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '12px' }}>
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
        <div className="mobile-only" style={{ alignItems: 'center', gap: '8px' }}>
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

      {/* 2. HERO SECTION */}
      <section
        className="landing-hero"
        style={{
          backgroundImage: 'url(/pune-hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Soft atmospheric gradient wash ensuring high legibility */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(250, 247, 240, 0.95) 0%, rgba(250, 247, 240, 0.92) 55%, rgba(250, 247, 240, 0.55) 85%, rgba(250, 247, 240, 0.2) 100%)',
            pointerEvents: 'none'
          }}
        />

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

        {/* Hero Right Column: Floating Interactive Map Mockup Card */}
        <div className="landing-hero-preview">
          {/* Main Map Card */}
          <div
            style={{
              position: 'relative',
              width: '420px',
              maxWidth: '100%',
              height: '300px',
              borderRadius: '20px',
              background: '#faf6ee',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 48px rgba(50, 40, 30, 0.15), 0 2px 6px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            {/* SVG Illustration of Pune Map */}
            <svg width="100%" height="100%" viewBox="0 0 430 320" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9cc9c1" />
                  <stop offset="100%" stopColor="#b6ded8" />
                </linearGradient>
              </defs>

              <rect width="430" height="320" fill="#f8f4eb" />
              <path d="M 0 0 L 140 0 C 130 50 110 80 80 100 L 0 120 Z" fill="#ebf0e3" opacity="0.8" />
              <path d="M 330 0 L 430 0 L 430 110 C 390 100 360 80 340 40 Z" fill="#ebf0e3" opacity="0.8" />
              <path d="M 280 200 C 320 220 380 230 430 210 L 430 320 L 260 320 Z" fill="#ebf0e3" opacity="0.7" />

              <path d="M 20 0 L 20 320 M 60 0 L 60 320 M 120 0 L 120 320 M 200 0 L 200 320 M 280 0 L 280 320 M 360 0 L 360 320" stroke="#eee6d8" strokeWidth="2" />
              <path d="M 0 40 L 430 40 M 0 90 L 430 90 M 0 160 L 430 160 M 0 220 L 430 220 M 0 270 L 430 270" stroke="#eee6d8" strokeWidth="2" />

              <path d="M 0 80 C 120 90 200 120 270 190 C 310 230 360 280 430 310" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 140 0 C 160 80 180 140 240 210 L 300 320" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 40 320 C 80 260 160 200 240 180 C 330 160 380 120 430 80" stroke="#ffffff" strokeWidth="5.5" fill="none" strokeLinecap="round" />

              <path
                d="M 240 -10 C 230 50 200 100 230 150 C 260 200 310 220 350 240 C 390 260 410 250 440 270"
                stroke="url(#riverGradient)"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Road Hazard Lines */}
              <path d="M 170 150 C 200 170 230 190 260 210" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 240 100 C 270 120 300 150 330 180" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <path d="M 90 120 C 120 140 150 160 180 180" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            </svg>

            {/* Floating Risk Card */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 14px rgba(40, 30, 20, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(220, 210, 195, 0.7)'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}
              >
                <AlertTriangle size={14} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>
                  High Risk Segment
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>
                  Aundh–Baner Corridor
                </div>
              </div>
            </div>

            {/* Bottom Floating Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                background: '#ffffff',
                borderRadius: '9999px',
                padding: '5px 12px 5px 8px',
                boxShadow: '0 4px 14px rgba(40, 30, 20, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#28392c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Users size={12} />
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1f2820' }}>
                Keep Pune Moving Safely
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSITION WAVE */}
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
