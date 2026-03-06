import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { Check } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';
import { getStateOptions, inferStateCodeFromAddress, normalizeStateCode } from '../utils/stateRepairRules';

export default function Settings() {
    const [landlordName, setLandlordName] = useState('');
    const [landlordPhone, setLandlordPhone] = useState('');
    const [landlordEmail, setLandlordEmail] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [tenantAddress, setTenantAddress] = useState('');
    const [tenantState, setTenantState] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [leaseStartDate, setLeaseStartDate] = useState('');
    const [leaseEndDate, setLeaseEndDate] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [saved, setSaved] = useState(false);
    const { uiLang, messageLang, setUiLang, setMessageLang } = useLanguage();
    const stateOptions = getStateOptions();

    useEffect(() => {
        const s = getSettings();
        setLandlordName(s.landlordName || '');
        setLandlordPhone(s.landlordPhone || '');
        setLandlordEmail(s.landlordEmail || '');
        setTenantName(s.tenantName || '');
        setTenantAddress(s.tenantAddress || '');
        setTenantState(normalizeStateCode(s.tenantState || inferStateCodeFromAddress(s.tenantAddress)));
        setTenantPhone(s.tenantPhone || '');
        setTenantEmail(s.tenantEmail || '');
        setLeaseStartDate(s.leaseStartDate || '');
        setLeaseEndDate(s.leaseEndDate || '');
        setMonthlyRent(s.monthlyRent || '');
    }, []);

    const handleSave = () => {
        saveSettings({
            landlordName, landlordPhone, landlordEmail,
            tenantName, tenantAddress, tenantState, tenantPhone, tenantEmail,
            leaseStartDate, leaseEndDate, monthlyRent,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUiLangChange = (lang) => {
        setUiLang(lang);
        // If switching to English, also set message language to English
        // (no reason to offer the option)
        if (lang === 'en') {
            setMessageLang('en');
        }
    };

    return (
        <div className="animate-fade-in settings-page">
            <h2 className="step-title">{t('settings', uiLang)}</h2>
            <p className="step-subtitle">{t('settingsSubtitle', uiLang)}</p>

            {/* Language Selection */}
            <h3 className="settings-section-title">{t('languageSection', uiLang)}</h3>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div className="settings-field">
                    <label className="input-label">{t('appLanguage', uiLang)}</label>
                    <div className="lang-toggle">
                        <button
                            className={`lang-btn ${uiLang === 'en' ? 'lang-active' : ''}`}
                            onClick={() => handleUiLangChange('en')}
                        >
                            {t('langEnglish', uiLang)}
                        </button>
                        <button
                            className={`lang-btn ${uiLang === 'es' ? 'lang-active' : ''}`}
                            onClick={() => handleUiLangChange('es')}
                        >
                            {t('langSpanish', uiLang)}
                        </button>
                    </div>
                </div>

                {/* Only show message language option when UI is Spanish */}
                {uiLang === 'es' && (
                    <div className="settings-field">
                        <label className="input-label">{t('messageLanguage', uiLang)}</label>
                        <p className="lang-hint">{t('messageLanguageHint', uiLang)}</p>
                        <div className="lang-toggle">
                            <button
                                className={`lang-btn ${messageLang === 'en' ? 'lang-active' : ''}`}
                                onClick={() => setMessageLang('en')}
                            >
                                English
                            </button>
                            <button
                                className={`lang-btn ${messageLang === 'es' ? 'lang-active' : ''}`}
                                onClick={() => setMessageLang('es')}
                            >
                                Español
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <h3 className="settings-section-title">{t('yourInfoSection', uiLang)}</h3>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div className="settings-field">
                    <label className="input-label" htmlFor="t-name">{t('yourNameLabel', uiLang)}</label>
                    <input
                        id="t-name"
                        className="input-field"
                        placeholder="e.g. Jane Doe"
                        value={tenantName}
                        onChange={e => setTenantName(e.target.value)}
                    />
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="t-address">{t('yourAddressLabel', uiLang)}</label>
                    <input
                        id="t-address"
                        className="input-field"
                        placeholder="e.g. 123 Main St, Apt 4B"
                        value={tenantAddress}
                        onChange={e => {
                            const nextAddress = e.target.value;
                            setTenantAddress(nextAddress);
                            if (!tenantState) {
                                setTenantState(normalizeStateCode(inferStateCodeFromAddress(nextAddress)));
                            }
                        }}
                    />
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="t-state">{t('selectStateOptional', uiLang)}</label>
                    <select
                        id="t-state"
                        className="input-field"
                        value={tenantState}
                        onChange={e => setTenantState(e.target.value)}
                    >
                        <option value="">{t('selectStateOptional', uiLang)}</option>
                        {stateOptions.map(option => (
                            <option key={option.code} value={option.code}>
                                {option.name} ({option.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="t-phone">{t('yourPhoneLabel', uiLang)}</label>
                    <input
                        id="t-phone"
                        className="input-field"
                        type="tel"
                        placeholder="e.g. (203) 555-6789"
                        value={tenantPhone}
                        onChange={e => setTenantPhone(e.target.value)}
                    />
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="t-email">{t('yourEmailLabel', uiLang)}</label>
                    <input
                        id="t-email"
                        className="input-field"
                        type="email"
                        placeholder="e.g. jane@email.com"
                        value={tenantEmail}
                        onChange={e => setTenantEmail(e.target.value)}
                    />
                </div>
            </div>

            <h3 className="settings-section-title">{t('landlordSection', uiLang)}</h3>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div className="settings-field">
                    <label className="input-label" htmlFor="ll-name">{t('landlordNameLabel', uiLang)}</label>
                    <input
                        id="ll-name"
                        className="input-field"
                        placeholder="e.g. John Smith"
                        value={landlordName}
                        onChange={e => setLandlordName(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label className="input-label" htmlFor="ll-phone">{t('landlordPhoneLabel', uiLang)}</label>
                    <input
                        id="ll-phone"
                        className="input-field"
                        type="tel"
                        placeholder="e.g. (203) 555-1234"
                        value={landlordPhone}
                        onChange={e => setLandlordPhone(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label className="input-label" htmlFor="ll-email">{t('landlordEmailLabel', uiLang)}</label>
                    <input
                        id="ll-email"
                        className="input-field"
                        type="email"
                        placeholder="e.g. landlord@email.com"
                        value={landlordEmail}
                        onChange={e => setLandlordEmail(e.target.value)}
                    />
                </div>
            </div>

            <h3 className="settings-section-title">{t('leaseSection', uiLang)}</h3>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div className="settings-field">
                    <label className="input-label" htmlFor="l-start">{t('leaseStartLabel', uiLang)}</label>
                    <input
                        id="l-start"
                        className="input-field"
                        type="date"
                        value={leaseStartDate}
                        onChange={e => setLeaseStartDate(e.target.value)}
                    />
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="l-end">{t('leaseEndLabel', uiLang)}</label>
                    <input
                        id="l-end"
                        className="input-field"
                        type="date"
                        value={leaseEndDate}
                        onChange={e => setLeaseEndDate(e.target.value)}
                    />
                </div>
                <div className="settings-field">
                    <label className="input-label" htmlFor="l-rent">{t('monthlyRentLabel', uiLang)}</label>
                    <input
                        id="l-rent"
                        className="input-field"
                        type="number"
                        inputMode="decimal"
                        placeholder="e.g. 1200"
                        value={monthlyRent}
                        onChange={e => setMonthlyRent(e.target.value)}
                    />
                </div>
            </div>

            <button className="btn btn-primary save-btn" onClick={handleSave}>
                {saved ? <><Check size={20} /> {t('saved', uiLang)}</> : t('saveSettings', uiLang)}
            </button>

            <style>{`
        .settings-page {
          padding-bottom: 2rem;
        }
        .settings-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 1.25rem 0 0.5rem;
        }
        .settings-field {
          margin-bottom: 1.25rem;
        }
        .settings-field:last-child {
          margin-bottom: 0;
        }
        .save-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 1rem;
          font-size: 1.05rem;
        }
        .lang-toggle {
          display: flex;
          gap: 0.5rem;
        }
        .lang-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--color-border);
          background: var(--color-surface-light);
          font-weight: 600;
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--color-text-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }
        .lang-btn:active {
          transform: scale(0.97);
        }
        .lang-active {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.08);
          color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
        }
        .lang-hint {
          font-size: 0.75rem;
          color: var(--color-text-light-muted);
          margin-bottom: 0.65rem;
          margin-top: 0.15rem;
        }
      `}</style>
        </div>
    );
}
