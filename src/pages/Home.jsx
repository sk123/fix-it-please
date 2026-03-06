import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, FolderOpen, StickyNote, Download, Smartphone, Phone, DollarSign, Camera, AlertTriangle, LifeBuoy } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';
import { getRepairRequests, getSettings } from '../utils/storage';
import { getStateTimelineForUrgency, inferStateCodeFromAddress, normalizeStateCode } from '../utils/stateRepairRules';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.fixitplease.app';
const PLAY_STORE_LIVE = false; // 🚩 flip to true when public release is ready
const isAndroid = /android/i.test(navigator.userAgent);
const isMobile = 'ontouchstart' in window;
const isMacDesktop = /Macintosh/i.test(navigator.userAgent) && !isMobile;
const isNativeApp = !!window.Capacitor?.isNativePlatform?.();

// Compute deadline alerts from repair records
function getDeadlineAlerts(records, stateCode) {
  if (!records || records.length === 0) return null;
  const now = Date.now();
  let overdue = 0;
  let noResponse = 0;

  records.forEach(r => {
    if ((r.status || 'pending') === 'resolved') return;
    const daysSince = Math.floor((now - new Date(r.timestamp).getTime()) / (1000 * 60 * 60 * 24));

    // Use state follow-up days if available, otherwise default to 14
    const overdueDays = stateCode
      ? (getStateTimelineForUrgency(stateCode, r.urgency || 'normal')?.followUpDays?.[0] || 14)
      : 14;

    if (daysSince > overdueDays) {
      overdue++;
    }

    // No response = no communications logged
    if (!r.communications || r.communications.length === 0) {
      noResponse++;
    }
  });

  if (overdue === 0 && noResponse === 0) return null;
  return { overdue, noResponse };
}

// Compute lease alerts
function getLeaseAlerts(settings) {
  if (!settings.leaseEndDate) return null;
  const end = new Date(settings.leaseEndDate);
  const now = new Date();
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { expired: true, daysLeft: Math.abs(daysLeft) };
  if (daysLeft <= 90) return { expired: false, daysLeft };
  return null;
}

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState(null);
  const [leaseAlerts, setLeaseAlerts] = useState(null);
  const { uiLang } = useLanguage();

  useEffect(() => {
    // Catch the browser's install prompt so we can trigger it with our own button
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed as PWA or running as native Capacitor app
    if (window.matchMedia('(display-mode: standalone)').matches || isNativeApp) {
      setIsInstalled(true);
    }

    // Compute deadline alerts
    try {
      const records = getRepairRequests();
      const settings = getSettings();
      const stateCode = normalizeStateCode(settings.tenantState || inferStateCodeFromAddress(settings.tenantAddress));
      setDeadlineAlerts(getDeadlineAlerts(records, stateCode));
      setLeaseAlerts(getLeaseAlerts(settings));
    } catch (err) { console.error('Failed to compute alerts', err); }

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

      {/* Play Store banner — only shown after public launch */}
      {PLAY_STORE_LIVE && isAndroid && !isInstalled && (
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-banner">
          <Smartphone size={20} />
          <div>
            <strong>{t('getOnPlayStore', uiLang)}</strong>
            <span>{t('playStoreSubtitle', uiLang)}</span>
          </div>
        </a>
      )}

      {/* PWA nudge for Android mobile (while Play Store not yet public) */}
      {!PLAY_STORE_LIVE && isMobile && !isAndroid && !isInstalled && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light-muted)', textAlign: 'center', margin: '0' }}>
          📱 Open <strong>fixit.rent</strong> in Safari → tap <em>Share → Add to Home Screen</em> for the best experience.
        </p>
      )}
      {!PLAY_STORE_LIVE && isAndroid && !isInstalled && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light-muted)', textAlign: 'center', margin: '0' }}>
          📱 Tap your browser menu → <em>Add to Home Screen</em> to install the app.
        </p>
      )}

      {/* Subtle nudge for Mac desktop users to install on iPhone */}
      {isMacDesktop && !isInstalled && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light-muted)', textAlign: 'center', margin: '0' }}>
          📱 On your iPhone? Open <strong>fixit.rent</strong> in Safari → tap <em>Share → Add to Home Screen</em>.
        </p>
      )}

      {/* PWA Install banner — shows for non-Android as fallback */}
      {installPrompt && !isInstalled && (
        <button className="install-banner" onClick={handleInstall}>
          <Download size={20} />
          <div>
            <strong>{t('installTitle', uiLang)}</strong>
            <span>{t('installSubtitle', uiLang)}</span>
          </div>
        </button>
      )}

      {/* === Deadline Dashboard === */}
      {(deadlineAlerts || leaseAlerts) && (
        <div className="dashboard-alerts">
          {deadlineAlerts?.overdue > 0 && (
            <Link to="/records" className="alert-card alert-warning">
              <span className="alert-icon">⏰</span>
              <span className="alert-text">
                <strong>{deadlineAlerts.overdue} {t('repairsOverdue', uiLang)}</strong>
                <span>{t('repairsOverdueHint', uiLang)}</span>
              </span>
            </Link>
          )}
          {deadlineAlerts?.noResponse > 0 && (
            <Link to="/records" className="alert-card alert-info">
              <span className="alert-icon">📩</span>
              <span className="alert-text">
                <strong>{deadlineAlerts.noResponse} {t('noResponseYet', uiLang)}</strong>
                <span>{t('noResponseHint', uiLang)}</span>
              </span>
            </Link>
          )}
          {leaseAlerts && !leaseAlerts.expired && (
            <Link to="/settings" className="alert-card alert-lease">
              <span className="alert-icon">📋</span>
              <span className="alert-text">
                <strong>{t('leaseEndsIn', uiLang)} {leaseAlerts.daysLeft} {t('days', uiLang)}</strong>
                <span>{t('leaseEndHint', uiLang)}</span>
              </span>
            </Link>
          )}
          {leaseAlerts?.expired && (
            <Link to="/settings" className="alert-card alert-warning">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">
                <strong>{t('leaseExpired', uiLang)} {leaseAlerts.daysLeft} {t('daysAgo', uiLang)}</strong>
                <span>{t('leaseExpiredHint', uiLang)}</span>
              </span>
            </Link>
          )}
        </div>
      )}

      <div className="home-tools">
        {/* Primary tools */}
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

        <Link to="/rent" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))' }}>
            <DollarSign size={32} color="var(--color-success)" />
          </div>
          <div className="home-card-text">
            <h3>{t('rentTracker', uiLang)}</h3>
            <p>{t('rentTrackerDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/vault" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.1))' }}>
            <FolderOpen size={32} color="#6366f1" />
          </div>
          <div className="home-card-text">
            <h3>{t('documentVault', uiLang)}</h3>
            <p>{t('documentVaultDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/condition" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.1))' }}>
            <Camera size={32} color="#ec4899" />
          </div>
          <div className="home-card-text">
            <h3>{t('conditionReport', uiLang)}</h3>
            <p>{t('conditionReportHomeDesc', uiLang)}</p>
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

        {/* Help & safety tools */}
        <div className="home-section-label">{t('helpAndSafety', uiLang)}</div>

        <Link to="/emergency" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))' }}>
            <Phone size={32} color="#ef4444" />
          </div>
          <div className="home-card-text">
            <h3>{t('emergencyContacts', uiLang)}</h3>
            <p>{t('emergencyContactsDesc', uiLang)}</p>
          </div>
        </Link>

        <Link to="/legal-aid" className="home-card glass-panel">
          <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.1))' }}>
            <LifeBuoy size={32} color="#0ea5e9" />
          </div>
          <div className="home-card-text">
            <h3>{t('legalAidTitle', uiLang)}</h3>
            <p>{t('legalAidHomeDesc', uiLang)}</p>
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
        .store-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.15rem;
          border: none;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          text-decoration: none;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
        .store-banner:active {
          transform: scale(0.98);
        }
        .store-banner strong {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .store-banner span {
          font-size: 0.75rem;
          opacity: 0.85;
        }
        /* Deadline Dashboard */
        .dashboard-alerts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .alert-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-fast);
        }
        .alert-card:active {
          transform: scale(0.98);
        }
        .alert-icon {
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .alert-text {
          display: flex;
          flex-direction: column;
        }
        .alert-text strong {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .alert-text span {
          font-size: 0.72rem;
          opacity: 0.75;
        }
        .alert-warning {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .alert-warning strong {
          color: #d97706;
        }
        .alert-info {
          background: rgba(59, 130, 246, 0.06);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .alert-info strong {
          color: var(--color-primary);
        }
        .alert-lease {
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }
        .alert-lease strong {
          color: #7c3aed;
        }
        .home-section-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-light-muted);
          margin-top: 0.25rem;
          padding-left: 0.15rem;
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
