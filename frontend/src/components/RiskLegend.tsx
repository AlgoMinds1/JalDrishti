import { useState, type FC } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';
import { useAppLanguage } from '../language';

export const RiskLegend: FC<{ hideMobile?: boolean }> = ({ hideMobile = false }) => {
  const { t } = useAppLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const items = [
    { label: t('severe'), desc: t('severeDesc'), color: 'var(--risk-severe, #dc2626)' },
    { label: t('high'), desc: t('highDesc'), color: 'var(--risk-high, #ea580c)' },
    { label: t('moderate'), desc: t('moderateDesc'), color: 'var(--risk-moderate, #d97706)' },
    { label: t('low'), desc: t('lowDesc'), color: 'var(--risk-low, #16866A)' },
    { label: t('noRisk'), desc: t('dryDesc'), color: 'var(--risk-none, #9e8870)' }
  ];

  return (
    <>
      {/* ── Desktop Floating Card (Visible on >= 1024px) ── */}
      <div
        className="desktop-only"
        style={{
          position: 'absolute',
          top: '64px',
          left: '16px',
          zIndex: 900,
          background: 'var(--bg-card, #FFFCF6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #E4DACA)',
          padding: '12px 16px',
          boxShadow: '0 6px 20px rgba(37, 37, 31, 0.08)',
          minWidth: '210px',
          pointerEvents: 'auto',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
            {t('risk')}
          </span>
          <div title="Conformal calibrated prediction classes">
            <Info size={14} color="var(--accent-cyan, #77745B)" style={{ cursor: 'help' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: item.color,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '11.5px', color: 'var(--text-sub, #444238)', fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Floating Pill Button (Visible on < 1024px) ── */}
      {!hideMobile && <>
      <div
        className="mobile-only"
        style={{
          position: 'absolute',
          top: '56px',
          left: '12px',
          zIndex: 900,
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={() => setIsSheetOpen(true)}
          aria-label="Open Waterlogging Risk Legend"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #E4DACA)',
            background: 'var(--bg-card, #FFFCF6)',
            boxShadow: '0 2px 10px rgba(37, 37, 31, 0.08)',
            cursor: 'pointer',
            color: 'var(--text-main, #25251F)',
            fontSize: '11.5px',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-severe, #dc2626)' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-moderate, #d97706)' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-low, #16866A)' }} />
          </div>
          <span>{t('riskLegend')}</span>
        </button>
      </div>

      {/* ── Mobile Risk Legend Bottom Sheet ── */}
      {isSheetOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(37, 37, 31, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            className="animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-card, #FFFCF6)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              border: '1px solid var(--border-color, #E4DACA)',
              borderBottom: 'none',
              padding: '16px 20px',
              paddingBottom: 'calc(var(--sab, 0px) + 20px)',
              boxShadow: 'var(--shadow-sheet)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Sheet Drag Handle */}
            <div className="sheet-drag-handle" />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color, #E4DACA)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="var(--accent-cyan, #77745B)" />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                  {t('riskLevels')}
                </h4>
              </div>
              <button
                onClick={() => setIsSheetOpen(false)}
                aria-label="Close risk legend"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #706D62)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Legend Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {items.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary, #F5F0E7)'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      marginTop: '3px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main, #25251F)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #706D62)' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '14px',
                fontSize: '11px',
                color: 'var(--text-muted, #706D62)',
                lineHeight: 1.4,
                textAlign: 'center'
              }}
            >
              Conformal prediction bounds calibrated across 1,000 Pune corridor road segments.
            </div>
          </div>
        </div>
      )}
      </>}
    </>
  );
};
