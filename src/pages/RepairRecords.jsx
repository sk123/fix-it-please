import React, { useEffect, useState } from 'react';
import { getRepairRequests, updateRepairStatus } from '../utils/storage';
import { Camera, Calendar } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

const STATUS_KEYS = [
    { id: 'pending', key: 'statusPending', color: '#f59e0b' },
    { id: 'in_progress', key: 'statusInProgress', color: 'var(--color-primary)' },
    { id: 'resolved', key: 'statusResolved', color: 'var(--color-success)' },
];

export default function RepairRecords() {
    const [records, setRecords] = useState([]);
    const { uiLang } = useLanguage();

    useEffect(() => {
        setRecords(getRepairRequests());
    }, []);

    const handleStatusChange = (id, status) => {
        updateRepairStatus(id, status);
        setRecords(getRepairRequests());
    };

    const formatDate = (isoString) => {
        if (!isoString) return t('unknownDate', uiLang);
        const d = new Date(isoString);
        return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
        }).format(d);
    };

    return (
        <div className="animate-fade-in records-page">
            <h2 className="step-title">{t('history', uiLang)}</h2>
            <p className="step-subtitle">{t('trackRequests', uiLang)}</p>

            {records.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.7 }}>
                    <Calendar size={40} style={{ color: 'var(--color-text-light-muted)', marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--color-text-light-muted)', margin: 0 }}>
                        {t('noRequestsYet', uiLang)}
                    </p>
                </div>
            ) : (
                <div className="records-list">
                    {records.map(record => {
                        const currentStatus = record.status || 'pending';
                        return (
                            <div key={record.id} className="glass-panel record-card">
                                <div className="record-header">
                                    <h4 className="record-issue">{record.issue}</h4>
                                    {record.hasPhoto && (
                                        <div style={{ color: 'var(--color-text-light-muted)' }} title="Included a photo">
                                            <Camera size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="record-meta">
                                    <span>{formatDate(record.timestamp)}</span>
                                    {record.location && <span> · {record.location}</span>}
                                    <span> · {record.method === 'sms' ? 'SMS' : t('sendEmail', uiLang)}</span>
                                </div>

                                {/* Status chips */}
                                <div className="status-row">
                                    {STATUS_KEYS.map(opt => (
                                        <button
                                            key={opt.id}
                                            className={`status-chip ${currentStatus === opt.id ? 'status-active' : ''}`}
                                            style={{ '--status-color': opt.color }}
                                            onClick={() => handleStatusChange(record.id, opt.id)}
                                        >
                                            {t(opt.key, uiLang)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
        .records-page {
          padding-bottom: 2rem;
        }
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .record-card {
          padding: 1.15rem 1.25rem;
        }
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.35rem;
        }
        .record-issue {
          margin: 0;
          font-size: 1.05rem;
        }
        .record-meta {
          font-size: 0.78rem;
          color: var(--color-text-light-muted);
          margin-bottom: 0.75rem;
        }
        .status-row {
          display: flex;
          gap: 0.5rem;
        }
        .status-chip {
          flex: 1;
          padding: 0.5rem 0.25rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--color-border);
          background: var(--color-surface-light);
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-light-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }
        .status-chip:active {
          transform: scale(0.95);
        }
        .status-active {
          border-color: var(--status-color);
          color: var(--status-color);
          background: color-mix(in srgb, var(--status-color) 10%, transparent);
        }
      `}</style>
        </div>
    );
}
