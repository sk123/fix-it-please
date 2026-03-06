import React from 'react';
import { Phone, AlertTriangle, ExternalLink } from 'lucide-react';
import { getSettings } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

export default function EmergencyDial() {
    const { uiLang } = useLanguage();
    const settings = getSettings();
    const landlordName = settings.landlordName || '';
    const landlordPhone = settings.landlordPhone || '';

    const CONTACTS = [
        ...(landlordPhone ? [{
            label: landlordName || t('landlordSection', uiLang),
            phone: landlordPhone,
            desc: t('emergencyLandlordDesc', uiLang),
            color: '#2563eb',
            gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        }] : []),
        {
            label: '911',
            phone: '911',
            desc: t('emergency911Desc', uiLang),
            color: '#dc2626',
            gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        },
        {
            label: '311',
            phone: '311',
            desc: t('emergency311Desc', uiLang),
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        },
        {
            label: '211 — United Way',
            phone: '211',
            desc: t('emergency211Desc', uiLang),
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
        },
        {
            label: 'HUD Housing Counseling',
            phone: '1-800-569-4287',
            desc: t('emergencyHudDesc', uiLang),
            color: '#6366f1',
            gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        },
    ];

    return (
        <div className="animate-fade-in emergency-page">
            <h2 className="step-title">{t('emergencyTitle', uiLang)}</h2>
            <p className="step-subtitle">{t('emergencySubtitle', uiLang)}</p>

            <div className="emergency-list">
                {CONTACTS.map((c, i) => (
                    <a key={i} href={`tel:${c.phone}`} className="emergency-card" style={{ '--e-gradient': c.gradient }}>
                        <div className="e-icon">
                            <Phone size={24} aria-hidden="true" />
                        </div>
                        <div className="e-info">
                            <strong>{c.label}</strong>
                            <span className="e-phone">{c.phone}</span>
                            <span className="e-desc">{c.desc}</span>
                        </div>
                    </a>
                ))}
            </div>

            {!landlordPhone && (
                <a href="/settings" className="glass-panel" style={{ display: 'block', padding: '1rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'none', lineHeight: 1.45 }}>
                    💡 {t('emergencyAddLandlord', uiLang)}
                </a>
            )}

            <div className="emergency-disc">
                <AlertTriangle size={14} aria-hidden="true" />
                <span>{t('emergencyDisclaimer', uiLang)}</span>
            </div>

            <style>{`
        .emergency-page{padding-bottom:2rem}
        .emergency-list{display:flex;flex-direction:column;gap:0.6rem}
        .emergency-card{display:flex;align-items:center;gap:0.85rem;padding:1rem 1.15rem;border-radius:var(--radius-lg);background:var(--e-gradient);color:white;text-decoration:none;transition:all var(--transition-fast);box-shadow:0 4px 14px rgba(0,0,0,0.15)}
        .emergency-card:active{transform:scale(0.98)}
        .e-icon{flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.2);border-radius:var(--radius-md)}
        .e-info{display:flex;flex-direction:column}
        .e-info strong{font-size:1rem;font-weight:700}
        .e-phone{font-size:0.85rem;opacity:0.9;font-weight:600}
        .e-desc{font-size:0.72rem;opacity:0.75;line-height:1.35;margin-top:0.15rem}
        .emergency-disc{display:flex;align-items:flex-start;gap:0.5rem;padding:0.75rem 1rem;margin-top:1rem;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:var(--radius-md);font-size:0.78rem;color:var(--color-text-light-muted);line-height:1.45}
        .emergency-disc svg{flex-shrink:0;color:#ef4444;margin-top:1px}
      `}</style>
        </div>
    );
}
