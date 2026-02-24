import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, FolderOpen, StickyNote, Settings } from 'lucide-react';
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
      <header className="app-header">
        <div className="header-inner">
          <Wrench size={20} className="header-icon" />
          <h1 className="header-title">
            <span className="title-text">{t('appTitle', uiLang)}</span>
          </h1>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
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
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          padding: 0.9rem 1rem;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.25);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .header-icon {
          color: rgba(255,255,255,0.85);
        }
        .header-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
          text-shadow: 0 0 20px rgba(255,255,255,0.15);
        }
        .title-text {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,1) 0%,
            rgba(255,255,255,1) 40%,
            rgba(200,220,255,0.8) 50%,
            rgba(255,255,255,1) 60%,
            rgba(255,255,255,1) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 100% 0; }
          50% { background-position: -100% 0; }
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
