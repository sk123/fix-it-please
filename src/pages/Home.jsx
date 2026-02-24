import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, FolderOpen, StickyNote, Download } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { uiLang } = useLanguage();

  useEffect(() => {
    // Catch the browser's install prompt so we can trigger it with our own button
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="animate-fade-in home-page">
      <h2 className="home-greeting">{t('homeGreeting', uiLang)}</h2>

      {/* Install banner — only shows if the browser supports it and app isn't installed yet */}
      {installPrompt && !isInstalled && (
        <button className="install-banner" onClick={handleInstall}>
          <Download size={20} />
          <div>
            <strong>{t('installTitle', uiLang)}</strong>
            <span>{t('installSubtitle', uiLang)}</span>
          </div>
        </button>
      )}

      <div className="home-tools">
        <Link to="/repair" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))' }}>
            <Wrench size={32} color="var(--color-primary)" />
          </div>
          <div className="home-card-text">
            <h3>{t('fixSomething', uiLang)}</h3>
            <p>{t('fixSomethingDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/records" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))' }}>
            <Clock size={32} color="#f59e0b" />
          </div>
          <div className="home-card-text">
            <h3>{t('requestHistory', uiLang)}</h3>
            <p>{t('requestHistoryDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/vault" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))' }}>
            <FolderOpen size={32} color="var(--color-success)" />
          </div>
          <div className="home-card-text">
            <h3>{t('documentVault', uiLang)}</h3>
            <p>{t('documentVaultDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/notes" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1))' }}>
            <StickyNote size={32} color="var(--color-secondary)" />
          </div>
          <div className="home-card-text">
            <h3>{t('recordNote', uiLang)}</h3>
            <p>{t('recordNoteDesc', uiLang)}</p>
          </div>
        </Link>
      </div>

      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .home-greeting {
          font-size: 1.6rem;
          margin-bottom: 0.15rem;
        }
        .install-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.15rem;
          border: none;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }
        .install-banner:active {
          transform: scale(0.98);
        }
        .install-banner strong {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .install-banner span {
          font-size: 0.75rem;
          opacity: 0.85;
        }
        .home-tools {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .home-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.15rem;
          text-decoration: none;
          color: inherit;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .home-card:active {
          transform: scale(0.98);
        }
        .home-card:hover {
          box-shadow: var(--shadow-lg);
        }
        .home-card-icon {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
        }
        .home-card-text h3 {
          font-size: 1.05rem;
          margin-bottom: 0.15rem;
        }
        .home-card-text p {
          font-size: 0.8rem;
          color: var(--color-text-light-muted);
          margin: 0;
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}
