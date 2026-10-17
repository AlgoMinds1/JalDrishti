import type { FC } from 'react';
import { Languages, Moon, Sun, X } from 'lucide-react';
import { languageOptions, useAppLanguage } from '../language';

interface Props { isOpen: boolean; onClose: () => void; theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void }

export const UserSettingsModal: FC<Props> = ({ isOpen, onClose, theme, setTheme }) => {
  const { language, setLanguage, t } = useAppLanguage();
  if (!isOpen) return null;
  return (
    <div role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 4900, background: 'rgba(20,20,18,.5)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="user-settings-title" style={{ width: 'min(420px, 96vw)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card, #FFFCF6)', border: '1px solid var(--border-color)', boxShadow: '0 18px 50px rgba(0,0,0,.24)', color: 'var(--text-main)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 id="user-settings-title" style={{ margin: 0, fontSize: 18 }}>{t('settings')}</h2>
          <button onClick={onClose} aria-label={t('close')} style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </header>
        <div style={{ display: 'grid', gap: 16, padding: 18 }}>
          <label style={{ display: 'grid', gap: 7, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Languages size={16} />{t('language')}</span>
            <select value={language} onChange={event => setLanguage(event.target.value as 'en' | 'hi' | 'mr')} style={{ height: 42, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-pill)', color: 'var(--text-main)', padding: '0 10px', fontSize: 14 }}>
              {languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gap: 7, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{t('appearance')}</span>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 42, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-pill)', color: 'var(--text-main)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {theme === 'light' ? <><Moon size={17} />{t('darkTheme')}</> : <><Sun size={17} />{t('lightTheme')}</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
