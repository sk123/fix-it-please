import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, FolderOpen, StickyNote, Settings, Phone, LifeBuoy } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

export default function Layout() {
  const location = useLocation();
  const { uiLang } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('navHome', uiLang) },
    { path: '/repair', icon: Wrench, label: t('navRepair', uiLang) },
    { path: '/vault', icon: FolderOpen, label: t('navVault', uiLang) },
    { path: '/notes', icon: StickyNote, label: t('navNotes', uiLang) },
    { path: '/settings', icon: Settings, label: t('navSettings', uiLang) },
  ];

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <Wrench size={22} className="header-icon" aria-hidden="true" />
            <div className="header-text">
              <h1 className="header-title">
                <span className="title-fix">fix it </span>
                <span className="title-please">PLEASE</span>
              </h1>
              <p className="header-subtitle">{t('headerSubtitle', uiLang)}</p>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/emergency" className={`header-action-btn ${location.pathname === '/emergency' ? 'header-action-active' : ''}`} aria-label={t('emergencyContacts', uiLang)}>
              <Phone size={18} aria-hidden="true" />
            </Link>
            <Link to="/legal-aid" className={`header-action-btn header-action-aid ${location.pathname === '/legal-aid' ? 'header-action-active' : ''}`} aria-label={t('legalAidTitle', uiLang)}>
              <LifeBuoy size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--color-surface-light);
          border-bottom: 1px solid var(--color-border);
          padding: 0.75rem 1.15rem;
          padding-top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
          backdrop-filter: blur(16px);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 480px;
          margin: 0 auto;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .header-actions {
          display: flex;
          gap: 0.35rem;
        }
        .header-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          color: var(--color-text-light-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .header-action-btn:active {
          transform: scale(0.9);
        }
        .header-action-btn:hover {
          background: rgba(59,130,246,0.08);
          color: var(--color-primary);
        }
        .header-action-active {
          background: rgba(59,130,246,0.1);
          color: var(--color-primary);
        }
        .header-icon {
          color: var(--color-primary);
          flex-shrink: 0;
        }
        .header-text {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .header-title {
          font-size: 1.35rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .title-fix {
          color: var(--color-text-light);
        }
        .title-please {
          color: var(--color-primary);
        }
        .title-bang {
          color: var(--color-secondary);
          font-style: italic;
        }
        .header-subtitle {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--color-text-light-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
        }
        .bottom-nav {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: var(--color-surface-light);
          border-top: 1px solid var(--color-border);
          padding: 0.5rem 0 0.6rem;
          z-index: 50;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(16px);
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          color: var(--color-text-light-muted);
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 600;
          transition: color var(--transition-fast);
          padding: 0.15rem 0.25rem;
          min-width: 48px;
        }
        
        .nav-item:active {
          transform: scale(0.93);
        }

        .nav-item.active {
          color: var(--color-primary);
        }

        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
