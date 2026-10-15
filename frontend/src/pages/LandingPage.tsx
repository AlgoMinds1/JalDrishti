import type { FC } from 'react';
import {
  CloudRain,
  AlertTriangle,
  Users,
  Sprout,
  ArrowRight,
  ChevronRight,
  MapPin,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onLaunchMap: () => void;
  onNavigate?: (tab: 'map' | 'evaluate' | 'limits') => void;
  onOpenSignIn?: () => void;
}

export const LandingPage: FC<LandingPageProps> = ({ onLaunchMap, onNavigate, onOpenSignIn }) => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#faf7f0',
      color: '#1d2821',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. TOP NAVBAR */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(250, 247, 240, 0.92)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(229, 220, 206, 0.6)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onLaunchMap}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#28392c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(40, 57, 44, 0.25)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 13C4.567 13 3 11.433 3 9.5C3 7.736 4.305 6.279 6.012 6.039C6.527 3.725 8.583 2 11 2C13.844 2 16.2 4.093 16.592 6.808C18.528 7.169 20 8.845 20 10.875C20 13.153 18.153 15 15.875 15H6.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17C6 15.8 8.5 15.8 10.5 17C12.5 18.2 15 18.2 17 17C18.5 16.1 19.5 16.2 20.5 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 20.5C6 19.3 8.5 19.3 10.5 20.5C12.5 21.7 15 21.7 17 20.5C18.5 19.6 19.5 19.7 20.5 20.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a241e', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              JalDrishti
            </div>
            <div style={{ fontSize: '11px', color: '#687569', fontWeight: 500 }}>
              Hyperlocal Flood Forecasting
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#1f2820', cursor: 'pointer' }}>
              Home
            </span>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2.5px',
              background: '#28392c',
              borderRadius: '2px'
            }} />
          </div>

          <span
            onClick={() => onNavigate && onNavigate('evaluate')}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            About
          </span>

          <span
            onClick={() => onNavigate && onNavigate('evaluate')}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            How It Works
          </span>

          <span
            onClick={onLaunchMap}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            Features
          </span>

          <span
            onClick={() => onNavigate && onNavigate('limits')}
            style={{ fontSize: '14.5px', fontWeight: 500, color: '#526055', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1f2820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#526055'; }}
          >
            Impact
          </span>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenSignIn || onLaunchMap}
            style={{
              padding: '9px 22px',
              borderRadius: '9999px',
              border: '1px solid #d9cebe',
              background: '#faf6ee',
              color: '#28392c',
              fontSize: '13.5px',
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
              padding: '9px 24px',
              borderRadius: '9999px',
              border: 'none',
              background: '#28392c',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(40, 57, 44, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e2b21'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#28392c'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH SCENIC PUNE WATERCOLOR BACKGROUND */}
      <section style={{
        position: 'relative',
        minHeight: '580px',
        padding: '50px 48px 70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundImage: 'url(/pune-hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 42%',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Soft atmospheric gradient wash ensuring high legibility */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(250, 247, 240, 0.94) 0%, rgba(250, 247, 240, 0.88) 45%, rgba(250, 247, 240, 0.35) 75%, rgba(250, 247, 240, 0.15) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Hero Left Content Column */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '560px',
          paddingRight: '20px'
        }}>
          {/* Pune Pilot Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ebdcc9',
            color: '#6d4c26',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(80, 60, 40, 0.06)'
          }}>
            <MapPin size={13} color="#6d4c26" />
            <span>Pune Pilot</span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: '52px',
            fontWeight: 850,
            lineHeight: 1.12,
            letterSpacing: '-1.4px',
            color: '#1a241e',
            margin: '0 0 18px 0'
          }}>
            Forecasting<br />
            Waterlogging,<br />
            Building a Safer Pune.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            lineHeight: 1.65,
            color: '#49574c',
            maxWidth: '500px',
            margin: '0 0 32px 0'
          }}>
            JalDrishti uses real-time weather data and AI to predict waterlogging on Pune’s roads and neighbourhoods — helping citizens and authorities stay one step ahead.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={onLaunchMap}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#28392c',
                color: '#ffffff',
                padding: '13px 28px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 650,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(40, 57, 44, 0.3)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e2b21';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#28392c';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>View Live Map</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('evaluate')}
              style={{
                background: '#f7f1e4',
                color: '#28392c',
                padding: '13px 28px',
                borderRadius: '9999px',
                border: '1px solid #d9cebe',
                fontSize: '15px',
                fontWeight: 650,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(80, 60, 40, 0.05)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#efe4d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f7f1e4';
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Right Column: Floating Interactive Map Mockup Card */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0
        }}>
          {/* Main Map Card */}
          <div style={{
            position: 'relative',
            width: '430px',
            height: '320px',
            borderRadius: '22px',
            background: '#faf6ee',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 20px 48px rgba(50, 40, 30, 0.15), 0 2px 6px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            {/* SVG Illustration of Pune Map with River Curve, Roads, and Markers */}
            <svg width="100%" height="100%" viewBox="0 0 430 320" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <radialGradient id="highRiskPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9cc9c1" />
                  <stop offset="100%" stopColor="#b6ded8" />
                </linearGradient>
              </defs>

              {/* Map Background Terrain */}
              <rect width="430" height="320" fill="#f8f4eb" />

              {/* Green Park Areas */}
              <path d="M 0 0 L 140 0 C 130 50 110 80 80 100 L 0 120 Z" fill="#ebf0e3" opacity="0.8" />
              <path d="M 330 0 L 430 0 L 430 110 C 390 100 360 80 340 40 Z" fill="#ebf0e3" opacity="0.8" />
              <path d="M 280 200 C 320 220 380 230 430 210 L 430 320 L 260 320 Z" fill="#ebf0e3" opacity="0.7" />

              {/* Minor Road Network Grid */}
              <path d="M 20 0 L 20 320 M 60 0 L 60 320 M 120 0 L 120 320 M 200 0 L 200 320 M 280 0 L 280 320 M 360 0 L 360 320" stroke="#eee6d8" strokeWidth="2" />
              <path d="M 0 40 L 430 40 M 0 90 L 430 90 M 0 160 L 430 160 M 0 220 L 430 220 M 0 270 L 430 270" stroke="#eee6d8" strokeWidth="2" />

              {/* Major Roads (Light White/Cream Arterials) */}
              <path d="M 0 80 C 120 90 200 120 270 190 C 310 230 360 280 430 310" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 140 0 C 160 80 180 140 240 210 L 300 320" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 40 320 C 80 260 160 200 240 180 C 330 160 380 120 430 80" stroke="#ffffff" strokeWidth="5.5" fill="none" strokeLinecap="round" />

              {/* Pune Mula-Mutha River Ribbon */}
              <path
                d="M 240 -10 C 230 50 200 100 230 150 C 260 200 310 220 350 240 C 390 260 410 250 440 270"
                stroke="url(#riverGradient)"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Bridge Crossings over River */}
              <line x1="210" y1="125" x2="245" y2="135" stroke="#758878" strokeWidth="4" strokeLinecap="square" />
              <line x1="310" y1="218" x2="345" y2="230" stroke="#758878" strokeWidth="4" strokeLinecap="square" />

              {/* Red High Risk Ripple Pulse Glow */}
              <circle cx="280" cy="180" r="54" fill="url(#highRiskPulse)" />
              <circle cx="280" cy="180" r="28" fill="#ef4444" fillOpacity="0.25" />

              {/* Yellow Warning Pin 1 (West Road) */}
              <g transform="translate(120, 130)">
                <circle cx="0" cy="0" r="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M 0 -6 L 6 5 L -6 5 Z" fill="#d97706" />
                <rect x="-1" y="-2" width="2" height="3.5" fill="#ffffff" />
                <circle cx="0" cy="3" r="1" fill="#ffffff" />
              </g>

              {/* Green Safe Pin 2 (South Road) */}
              <g transform="translate(250, 260)">
                <circle cx="0" cy="0" r="14" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
                <path d="M -4 0 L -1 3 L 4 -3" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Red Risk Pin Marker (Vishrantwadi / Yerawada River Bend) */}
              <g transform="translate(280, 180)">
                <circle cx="0" cy="0" r="13" fill="#dc2626" />
                <circle cx="0" cy="0" r="5" fill="#ffffff" />
              </g>
            </svg>

            {/* Floating Callout: High Risk Vishrantwadi */}
            <div style={{
              position: 'absolute',
              top: '24px',
              right: '28px',
              background: '#ffffff',
              borderRadius: '14px',
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(40, 30, 20, 0.12)',
              border: '1px solid rgba(230, 220, 205, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}>
                <AlertTriangle size={16} />
              </div>

              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>
                  High Risk
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginTop: '1px' }}>
                  Vishrantwadi
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>
                  Likely waterlogging in 1–3 hours
                </div>
              </div>
            </div>

            {/* Bottom-Left Floating Pill: Keep Pune Moving, Safely */}
            <div style={{
              position: 'absolute',
              bottom: '18px',
              left: '18px',
              background: '#ffffff',
              borderRadius: '9999px',
              padding: '6px 14px 6px 8px',
              boxShadow: '0 6px 18px rgba(40, 30, 20, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#5a8264',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Users size={14} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 750, color: '#1f2820', lineHeight: 1.1 }}>
                  Keep Pune
                </div>
                <div style={{ fontSize: '9.5px', color: '#687569' }}>
                  Moving, Safely.
                </div>
              </div>
            </div>
          </div>

          {/* Floating Right Widget: Rain Forecast & Risk Level */}
          <div style={{
            width: '142px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            borderRadius: '18px',
            padding: '16px 14px',
            boxShadow: '0 12px 32px rgba(50, 40, 30, 0.12)',
            border: '1px solid rgba(225, 215, 200, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Rain Forecast Header */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f2820', marginBottom: '8px' }}>
                Rain Forecast
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#e9ece6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2d3b2f',
                  flexShrink: 0
                }}>
                  <CloudRain size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#1f2820', lineHeight: 1.15 }}>
                    Moderate Rain
                  </div>
                  <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '1px' }}>
                    in next 2 hours
                  </div>
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div style={{ height: '1px', background: '#ebdcc9' }} />

            {/* Risk Level Legend */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f2820', marginBottom: '8px' }}>
                Risk Level
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>Low</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>Moderate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                  <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>High</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                  <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>Severe</span>
                </div>
              </div>
            </div>

            {/* Expand / Forward Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
              <button
                onClick={onLaunchMap}
                title="Open Map Forecast"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#f2ece0',
                  border: 'none',
                  color: '#49574c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOFT ORGANIC CURVED TRANSITION WAVE */}
      <div style={{ position: 'relative', marginTop: '-42px', zIndex: 15 }}>
        <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '70px', display: 'block' }}>
          <path d="M0 48C280 18 560 68 840 38C1120 8 1320 54 1440 42V96H0V48Z" fill="#faf7f0" />
        </svg>
      </div>

      {/* 4. FOUR KEY CAPABILITIES CARDS (Matching the 4 cards in the user image) */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 48px 46px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          {/* Card 1: Hyperlocal Forecasts */}
          <div style={{
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#e8ebe2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#344638'
            }}>
              <CloudRain size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Hyperlocal Forecasts
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#556357', margin: 0 }}>
              Predicts waterlogging at road and neighbourhood level (1–6 hours ahead).
            </p>
          </div>

          {/* Card 2: Real-Time Insights */}
          <div style={{
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#f6e7d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a8611c'
            }}>
              <AlertTriangle size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              Real-Time Insights
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#556357', margin: 0 }}>
              Live rain data, risk maps and easy-to-understand alerts.
            </p>
          </div>

          {/* Card 3: For Citizens & Authorities */}
          <div style={{
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#e3eae1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#344638'
            }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              For Citizens & Authorities
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#556357', margin: 0 }}>
              Plan your travel, manage resources and respond faster.
            </p>
          </div>

          {/* Card 4: A More Resilient Pune */}
          <div style={{
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#dfeadb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2e4933'
            }}>
              <Sprout size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#1a241e', margin: 0 }}>
              A More Resilient Pune
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#556357', margin: 0 }}>
              Safer roads, smoother mobility and stronger communities during heavy rains.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM BANNER: DATA-DRIVEN FORESIGHT WITH PUNE SKYLINE SILHOUETTE */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 48px 48px'
      }}>
        <div style={{
          background: '#f1ecd9',
          border: '1px solid #e2d7c0',
          borderRadius: '18px',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          overflow: 'hidden'
        }}>
          {/* Banner Left Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#e3dcbe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3d4d39'
            }}>
              <Sprout size={20} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 750, color: '#253527', letterSpacing: '-0.2px' }}>
              Data-driven foresight for a safer, more resilient city.
            </div>
          </div>

          {/* Banner Right: Panoramic Line-Art Pune Skyline */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', opacity: 0.65 }}>
            <svg width="440" height="42" viewBox="0 0 440 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rolling Hill on right */}
              <path d="M 330 42 C 360 20 400 15 440 28 L 440 42 Z" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              {/* Fort tower on hill */}
              <rect x="382" y="10" width="16" height="18" stroke="#687864" strokeWidth="1.2" fill="#f1ecd9" />
              <path d="M 380 10 L 400 10 M 384 7 L 384 10 M 390 7 L 390 10 M 396 7 L 396 10" stroke="#687864" strokeWidth="1" />
              <line x1="390" y1="7" x2="390" y2="2" stroke="#687864" strokeWidth="1" />
              <path d="M 390 2 L 398 4 L 390 6 Z" fill="#d97706" />

              {/* Arched Pune Bridge */}
              <path d="M 270 42 L 270 30 C 285 24 315 24 330 30 L 330 42" stroke="#687864" strokeWidth="1.2" fill="none" />
              <path d="M 280 42 C 280 34 295 34 295 42" stroke="#687864" strokeWidth="1" fill="none" />
              <path d="M 305 42 C 305 34 320 34 320 42" stroke="#687864" strokeWidth="1" fill="none" />

              {/* City Heritage Buildings */}
              <rect x="180" y="24" width="16" height="18" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <rect x="198" y="16" width="18" height="26" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <rect x="220" y="22" width="22" height="20" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <polygon points="231,14 225,22 237,22" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />

              {/* Windows & Tree Dots */}
              <line x1="202" y1="20" x2="204" y2="20" stroke="#687864" strokeWidth="1.2" />
              <line x1="208" y1="20" x2="210" y2="20" stroke="#687864" strokeWidth="1.2" />
              <line x1="202" y1="26" x2="204" y2="26" stroke="#687864" strokeWidth="1.2" />
              <line x1="208" y1="26" x2="210" y2="26" stroke="#687864" strokeWidth="1.2" />

              {/* Left Houses & Trees */}
              <rect x="130" y="28" width="18" height="14" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <polygon points="139,22 128,28 150,28" stroke="#687864" strokeWidth="1" fill="#f1ecd9" />
              <circle cx="160" cy="30" r="8" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <circle cx="170" cy="34" r="6" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <circle cx="254" cy="32" r="7" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <circle cx="345" cy="33" r="8" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
              <circle cx="360" cy="27" r="9" stroke="#687864" strokeWidth="1" fill="#e8dfcb" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};
