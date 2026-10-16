import { useState, type FC, type FormEvent } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CloudRain,
  AlertTriangle,
  Check,
  ChevronRight,
  X
} from 'lucide-react';

interface SignInPageProps {
  onSignInSuccess: () => void;
  onBackHome: () => void;
}

export const SignInPage: FC<SignInPageProps> = ({ onSignInSuccess, onBackHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSignInSuccess();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#faf7f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Botanical Leaves Corner Framing (SVG Overlays) */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '180px', height: '180px', pointerEvents: 'none', opacity: 0.35, zIndex: 1 }}
        viewBox="0 0 100 100" fill="none"
      >
        <path d="M 0 0 C 30 10 50 40 40 70 C 25 50 15 30 0 20 Z" fill="#465c4b" />
        <path d="M 15 0 C 45 15 70 30 65 60 C 45 45 30 25 15 10 Z" fill="#58745f" />
        <path d="M 0 35 C 20 40 40 60 30 90 C 20 70 10 55 0 45 Z" fill="#3a4d3f" />
      </svg>

      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px', pointerEvents: 'none', opacity: 0.35, zIndex: 1 }}
        viewBox="0 0 100 100" fill="none"
      >
        <path d="M 0 100 C 20 80 40 60 70 65 C 50 80 30 90 10 100 Z" fill="#465c4b" />
        <path d="M 0 70 C 25 55 50 45 60 20 C 45 40 30 55 10 70 Z" fill="#58745f" />
      </svg>

      <svg
        style={{ position: 'absolute', bottom: 0, right: 0, width: '220px', height: '220px', pointerEvents: 'none', opacity: 0.4, zIndex: 1 }}
        viewBox="0 0 100 100" fill="none"
      >
        <path d="M 100 100 C 80 75 60 55 25 60 C 50 75 75 88 95 100 Z" fill="#465c4b" />
        <path d="M 100 70 C 75 55 55 35 45 10 C 60 35 75 50 95 70 Z" fill="#58745f" />
        <path d="M 75 100 C 60 85 45 70 20 75 C 40 88 60 95 75 100 Z" fill="#3a4d3f" />
      </svg>

      {/* Close / Return to Home Button */}
      <button
        onClick={onBackHome}
        title="Return to Landing Page"
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #dfd3c3',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#344638',
          boxShadow: '0 2px 8px rgba(50, 40, 30, 0.08)',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f2ece0'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; }}
      >
        <X size={18} />
      </button>

      {/* MAIN SIGN IN CONTAINER CARD (MATCHING THE USER'S MOCKUP) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1060px',
        minHeight: '600px',
        background: '#fbf9f5',
        borderRadius: '24px',
        border: '1.5px solid rgba(220, 210, 195, 0.75)',
        boxShadow: '0 24px 64px rgba(60, 48, 35, 0.14), 0 2px 6px rgba(0,0,0,0.04)',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* LEFT HALF: SIGN IN FORM */}
        <div style={{
          width: '410px',
          minWidth: '380px',
          padding: '36px 38px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fcfaf6',
          borderRight: '1px solid rgba(225, 215, 200, 0.6)',
          boxSizing: 'border-box'
        }}>
          <div>
            {/* Top Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onBackHome}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#28392c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(40, 57, 44, 0.25)',
                  flexShrink: 0
                }}>
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
                  <div style={{ fontSize: '10px', color: '#687569', fontWeight: 500 }}>
                    Hyperlocal Flood Forecasting
                  </div>
                </div>
              </div>

              {/* Pune Pilot Pill Badge */}
              <div style={{
                background: '#f1ecd9',
                color: '#6d4c26',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 650,
                border: '1px solid #e2d7c0'
              }}>
                Pune Pilot
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <h2 style={{
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.8px',
                color: '#1a241e',
                margin: '0 0 8px 0'
              }}>
                Welcome Back
              </h2>
              <p style={{
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#556357',
                margin: 0,
                padding: '0 10px'
              }}>
                Sign in to continue monitoring flood risks and building a safer, more resilient Pune.
              </p>
            </div>

            {/* Social Logins Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '22px'
            }}>
              {/* Google Button */}
              <button
                type="button"
                onClick={onSignInSuccess}
                title="Sign in with Google"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2d8c9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(50, 40, 30, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(50, 40, 30, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(50, 40, 30, 0.05)'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={onSignInSuccess}
                title="Sign in with GitHub"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2d8c9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(50, 40, 30, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(50, 40, 30, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(50, 40, 30, 0.05)'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#181717">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                onClick={onSignInSuccess}
                title="Sign in with Microsoft"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2d8c9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(50, 40, 30, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(50, 40, 30, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(50, 40, 30, 0.05)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
              </button>
            </div>

            {/* Divider Line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0 18px',
              gap: '12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e4dacf' }} />
              <span style={{ fontSize: '11.5px', color: '#7a867c' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', background: '#e4dacf' }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Email Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #dcd1c2',
                borderRadius: '12px',
                padding: '11px 14px',
                boxShadow: '0 1px 3px rgba(60, 50, 40, 0.03)'
              }}>
                <Mail size={16} color="#788479" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13.5px',
                    color: '#1a241e',
                    width: '100%'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #dcd1c2',
                borderRadius: '12px',
                padding: '11px 14px',
                boxShadow: '0 1px 3px rgba(60, 50, 40, 0.03)'
              }}>
                <Lock size={16} color="#788479" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13.5px',
                    color: '#1a241e',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b978c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginTop: '2px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#49574c' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: '#28392c',
                      width: '15px',
                      height: '15px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Remember me</span>
                </label>

                <span
                  style={{ color: '#28392c', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => alert('Password reset link sent to your registered address.')}
                >
                  Forgot password?
                </span>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#28392c',
                  color: '#ffffff',
                  padding: '13px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  marginTop: '10px',
                  boxShadow: '0 4px 16px rgba(40, 57, 44, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1e2b21'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#28392c'; }}
              >
                <span>Sign In</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Footer Text */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#556357', marginTop: '16px' }}>
            <span>Don't have an account? </span>
            <span
              onClick={onSignInSuccess}
              style={{ color: '#28392c', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign up
            </span>
          </div>
        </div>

        {/* RIGHT HALF: ILLUSTRATED PUNE FLOOD RISK MAP WITH FLOATING CARDS */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: '#f6f1e5',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Top-Right Weather Card: Moderate Rain Pune | 24°C */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            padding: '8px 14px',
            boxShadow: '0 8px 24px rgba(40, 30, 20, 0.1)',
            border: '1px solid rgba(230, 220, 205, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#e8ebe2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#344638'
            }}>
              <CloudRain size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 750, color: '#1a241e', lineHeight: 1.15 }}>
                Moderate Rain
              </div>
              <div style={{ fontSize: '9.5px', color: '#687569', marginTop: '1px' }}>
                Pune | 24°C
              </div>
            </div>
          </div>

          {/* Map Vector Illustration Canvas */}
          <svg width="100%" height="100%" viewBox="0 0 650 560" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="puneRiver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#96bebe" />
                <stop offset="100%" stopColor="#aed7ce" />
              </linearGradient>
              <radialGradient id="highRiskGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moderateRiskGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Terrain */}
            <rect width="650" height="560" fill="#f8f4ea" />

            {/* Rolling Hills & Green Parks */}
            <path d="M 0 60 C 60 50 120 70 180 120 C 130 180 60 170 0 160 Z" fill="#ebf0e0" opacity="0.85" />
            <path d="M 440 30 C 520 20 600 60 650 120 L 650 0 L 400 0 Z" fill="#ebf0e0" opacity="0.85" />
            <path d="M 380 440 C 450 420 540 450 650 490 L 650 560 L 320 560 Z" fill="#ebf0e0" opacity="0.85" />

            {/* Minor Roads Network */}
            <g stroke="#eee3d3" strokeWidth="1.8" opacity="0.9">
              <line x1="40" y1="0" x2="40" y2="560" />
              <line x1="100" y1="0" x2="100" y2="560" />
              <line x1="180" y1="0" x2="180" y2="560" />
              <line x1="280" y1="0" x2="280" y2="560" />
              <line x1="380" y1="0" x2="380" y2="560" />
              <line x1="480" y1="0" x2="480" y2="560" />
              <line x1="580" y1="0" x2="580" y2="560" />
              <line x1="0" y1="80" x2="650" y2="80" />
              <line x1="0" y1="180" x2="650" y2="180" />
              <line x1="0" y1="280" x2="650" y2="280" />
              <line x1="0" y1="380" x2="650" y2="380" />
              <line x1="0" y1="480" x2="650" y2="480" />
            </g>

            {/* Major Arterial Roads (White Highway Corridors) */}
            <g stroke="#ffffff" fill="none" strokeLinecap="round">
              <path d="M 0 160 C 140 180 240 220 340 300 C 420 370 520 440 650 480" strokeWidth="7" />
              <path d="M 120 0 C 160 140 240 240 360 340 L 460 560" strokeWidth="6.5" />
              <path d="M 380 0 C 370 120 380 260 480 380 L 580 560" strokeWidth="5.5" />
              <path d="M 60 560 C 120 440 220 340 380 260 C 480 200 580 140 650 90" strokeWidth="5.5" />
            </g>

            {/* Terracotta / Orange Waterlogging Inundation Buffer Zones along River */}
            <path
              d="M 220 -20 C 200 60 170 140 210 220 C 250 300 320 340 380 370 C 440 400 480 440 560 520"
              stroke="#f6ad7b"
              strokeWidth="56"
              strokeOpacity="0.45"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 320 280 C 380 320 450 360 520 420"
              stroke="#ea580c"
              strokeWidth="36"
              strokeOpacity="0.25"
              fill="none"
              strokeLinecap="round"
            />

            {/* Mula-Mutha River Ribbon */}
            <path
              d="M 220 -20 C 200 60 170 140 210 220 C 250 300 320 340 380 370 C 440 400 480 440 560 520"
              stroke="url(#puneRiver)"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bridges across Pune river */}
            <line x1="190" y1="180" x2="225" y2="195" stroke="#718274" strokeWidth="4.5" strokeLinecap="square" />
            <line x1="285" y1="300" x2="315" y2="318" stroke="#718274" strokeWidth="4.5" strokeLinecap="square" />
            <line x1="420" y1="390" x2="455" y2="408" stroke="#718274" strokeWidth="4.5" strokeLinecap="square" />

            {/* Locality Text Labels */}
            <text x="30" y="115" fill="#526055" fontSize="12.5" fontWeight="700">Hinjawadi</text>
            <text x="140" y="200" fill="#526055" fontSize="12" fontWeight="700">Baner</text>
            <text x="245" y="210" fill="#526055" fontSize="12" fontWeight="700">Pimple Nilakh</text>
            <text x="210" y="280" fill="#526055" fontSize="12" fontWeight="700">Aundh</text>
            <text x="330" y="285" fill="#526055" fontSize="12.5" fontWeight="700">Shivajinagar</text>
            <text x="190" y="380" fill="#526055" fontSize="12.5" fontWeight="700">Kothrud</text>
            <text x="445" y="200" fill="#526055" fontSize="12.5" fontWeight="700">Vishrantwadi</text>
            <text x="500" y="250" fill="#526055" fontSize="12" fontWeight="700">Pune Airport</text>
            <text x="490" y="285" fill="#526055" fontSize="12" fontWeight="700">Kalyani Nagar</text>
            <text x="440" y="460" fill="#526055" fontSize="12" fontWeight="700">Hadapsar</text>
            <text x="360" y="525" fill="#526055" fontSize="12" fontWeight="700">Katraj</text>

            {/* Big Central Pune Label */}
            <text x="365" y="325" fill="#1f2c22" fontSize="26" fontWeight="850" letterSpacing="-0.5px">Pune</text>

            {/* Airport Airplane Icon */}
            <g transform="translate(485, 240)">
              <circle cx="0" cy="0" r="11" fill="#e9ece3" />
              <path d="M -5 -1 L 0 -5 L 5 -1 L 2 1 L 2 5 L 0 4 L -2 5 L -2 1 Z" fill="#2d3b2f" />
            </g>

            {/* Glowing Pulses & Pins */}
            {/* Vishrantwadi Red Glow */}
            <circle cx="410" cy="195" r="45" fill="url(#highRiskGlow)" />
            <circle cx="410" cy="195" r="14" fill="#dc2626" />
            <circle cx="410" cy="195" r="5" fill="#ffffff" />

            {/* Hadapsar Amber Glow */}
            <circle cx="505" cy="340" r="32" fill="url(#moderateRiskGlow)" />
            <g transform="translate(505, 340)">
              <circle cx="0" cy="0" r="13" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
              <path d="M 0 -5 L 5 4 L -5 4 Z" fill="#d97706" />
              <rect x="-0.8" y="-2" width="1.6" height="3" fill="#ffffff" />
              <circle cx="0" cy="2.5" r="0.8" fill="#ffffff" />
            </g>

            {/* Aundh Amber Pin */}
            <g transform="translate(215, 235)">
              <circle cx="0" cy="0" r="13" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
              <path d="M 0 -5 L 5 4 L -5 4 Z" fill="#d97706" />
              <rect x="-0.8" y="-2" width="1.6" height="3" fill="#ffffff" />
              <circle cx="0" cy="2.5" r="0.8" fill="#ffffff" />
            </g>

            {/* East Outer Amber Pin */}
            <g transform="translate(580, 160)">
              <circle cx="0" cy="0" r="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
              <path d="M 0 -5 L 4.5 3.5 L -4.5 3.5 Z" fill="#d97706" />
              <circle cx="0" cy="2" r="0.7" fill="#ffffff" />
            </g>

            {/* Kothrud Green Safe Pin */}
            <g transform="translate(285, 355)">
              <circle cx="0" cy="0" r="13" fill="#38543f" />
              <circle cx="0" cy="0" r="5" fill="#ffffff" />
            </g>
          </svg>

          {/* FLOATING CARD 1: High Risk Vishrantwadi (Top Center-Right) */}
          <div style={{
            position: 'absolute',
            top: '105px',
            left: '275px',
            zIndex: 25,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 28px rgba(50, 40, 30, 0.12)',
            border: '1px solid rgba(230, 220, 205, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }} onClick={onSignInSuccess}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0
            }}>
              <AlertTriangle size={15} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>High Risk</span>
                <ChevronRight size={13} color="#9ca3af" />
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#374151' }}>
                Vishrantwadi
              </div>
              <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '1px' }}>
                Likely waterlogging in next 1–3 hours
              </div>
            </div>
          </div>

          {/* FLOATING CARD 2: Moderate Risk Hadapsar (Right Center) */}
          <div style={{
            position: 'absolute',
            top: '280px',
            right: '22px',
            zIndex: 25,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 28px rgba(50, 40, 30, 0.12)',
            border: '1px solid rgba(230, 220, 205, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }} onClick={onSignInSuccess}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              flexShrink: 0
            }}>
              <AlertTriangle size={15} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>Moderate Risk</span>
                <ChevronRight size={13} color="#9ca3af" />
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#374151' }}>
                Hadapsar
              </div>
              <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '1px' }}>
                Possible waterlogging in next 3–6 hours
              </div>
            </div>
          </div>

          {/* FLOATING CARD 3: Low Risk Kothrud (Bottom Left of Map) */}
          <div style={{
            position: 'absolute',
            bottom: '95px',
            left: '60px',
            zIndex: 25,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 28px rgba(50, 40, 30, 0.12)',
            border: '1px solid rgba(230, 220, 205, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }} onClick={onSignInSuccess}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#38543f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Check size={16} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#273c2c' }}>Low Risk</span>
                <ChevronRight size={13} color="#9ca3af" />
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#374151' }}>
                Kothrud
              </div>
              <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '1px' }}>
                No significant risk in next 6 hours
              </div>
            </div>
          </div>

          {/* BOTTOM PANORAMIC WATERCOLOR LANDSCAPE SPANNING BASE OF CARD */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '90px',
            zIndex: 15,
            backgroundImage: 'url(/pune-hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 85%',
            opacity: 0.85,
            borderTop: '1px solid rgba(220, 210, 195, 0.4)'
          }}>
            {/* Soft gradient fade into the map */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, rgba(251, 249, 245, 0.1) 0%, rgba(248, 244, 234, 0.85) 100%)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
