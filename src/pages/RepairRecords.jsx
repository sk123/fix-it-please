import React, { useState, useEffect, useRef } from 'react';
import { getRepairRequests, updateRepairStatus, getSettings, logManualCorrespondence } from '../utils/storage';
import { Camera, Calendar, FileDown, FolderDown, MessageSquarePlus, X, FileText } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';
import { exportCaseFile } from '../utils/exportCaseFile';
import { generateFormalRequest } from '../utils/generateFormalRequest';

const STATUS_KEYS = [
  { id: 'pending', key: 'statusPending', color: '#f59e0b' },
  { id: 'in_progress', key: 'statusInProgress', color: 'var(--color-primary)' },
  { id: 'resolved', key: 'statusResolved', color: 'var(--color-success)' },
];

const METHOD_OPTIONS = [
  { id: 'text', key: 'methodText' },
  { id: 'email', key: 'methodEmail' },
  { id: 'call', key: 'methodCall' },
  { id: 'letter', key: 'methodLetter' },
  { id: 'other', key: 'methodOther' },
];

export default function RepairRecords() {
  const [records, setRecords] = useState([]);
  const [settings, setSettings] = useState({});
  const { uiLang } = useLanguage();

  // Log Response state
  const [loggingId, setLoggingId] = useState(null);
  const [logPhoto, setLogPhoto] = useState(null);
  const [logNote, setLogNote] = useState('');
  const [logDirection, setLogDirection] = useState('received');
  const [logMethod, setLogMethod] = useState('text');
  const [showNoteField, setShowNoteField] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const data = getRepairRequests();
      setRecords(data || []);
      setSettings(getSettings() || {});
    } catch (err) {
      console.error('Failed to load records:', err);
    }
  }, []);

  const handleStatusChange = (id, status) => {
    updateRepairStatus(id, status);
    setRecords(getRepairRequests());
  };

  const handleExportAll = () => {
    exportCaseFile({ records, tenant: settings, landlord: settings });
  };

  const handleExportSingle = (record) => {
    exportCaseFile({ records: [record], tenant: settings, landlord: settings });
  };

  // === Log Response handlers ===
  const startLogging = (recordId) => {
    setLoggingId(recordId);
    setLogPhoto(null);
    setLogNote('');
    setLogDirection('received');
    setLogMethod('text');
    setShowNoteField(false);
  };

  const cancelLogging = () => {
    setLoggingId(null);
    setLogPhoto(null);
    setLogNote('');
    setShowNoteField(false);
  };

  const handleLogTakePhoto = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 80,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1200,
          correctOrientation: true,
        });
        setLogPhoto(image.dataUrl);
      } catch (err) {
        console.log('Camera cancelled', err);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
    }
  };

  const handleLogChooseGallery = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 80,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          width: 1200,
          correctOrientation: true,
        });
        setLogPhoto(image.dataUrl);
      } catch (err) {
        console.log('Gallery cancelled', err);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    }
  };

  const handleLogFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogPhoto(reader.result);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSaveLog = () => {
    if (!loggingId) return;
    logManualCorrespondence(loggingId, {
      direction: logDirection,
      method: logMethod,
      summary: logNote.trim(),
      imageDataUrl: logPhoto,
    });
    setRecords(getRepairRequests());
    cancelLogging();
  };

  const formatDate = (isoString) => {
    if (!isoString) return t('unknownDate', uiLang);
    const d = new Date(isoString);
    return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    }).format(d);
  };

  const getMethodLabel = (method) => {
    const opt = METHOD_OPTIONS.find(m => m.id === method);
    return opt ? t(opt.key, uiLang) : (method || '').toUpperCase();
  };

  return (
    <div className="animate-fade-in records-page">
      {/* Hidden file input for web photo capture */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleLogFileInput}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
        <div>
          <h2 className="step-title">{t('history', uiLang)}</h2>
          <p className="step-subtitle">{t('trackRequests', uiLang)}</p>
        </div>
        {records.length > 0 && (
          <button
            onClick={handleExportAll}
            title={t('exportFullHistory', uiLang)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              flexShrink: 0,
            }}
          >
            <FolderDown size={16} />
            {t('exportFullHistory', uiLang)}
          </button>
        )}
      </div>

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
            const isLogging = loggingId === record.id;

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

                {record.photoDataUrl && (
                  <div className="record-photo-preview">
                    <img src={record.photoDataUrl} alt="Repair" />
                  </div>
                )}

                {record.description && (
                  <p className="record-description">{record.description}</p>
                )}

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

                {/* === LOG RESPONSE button === */}
                {!isLogging && (
                  <button
                    className="log-response-btn"
                    onClick={() => startLogging(record.id)}
                  >
                    <MessageSquarePlus size={20} />
                    <span>{t('logResponse', uiLang)}</span>
                  </button>
                )}

                {/* === INLINE LOG FORM (tap-first: photo first, details optional) === */}
                {isLogging && (
                  <div className="log-form animate-fade-in">
                    <div className="log-form-header">
                      <span className="log-form-title">📸 {t('logResponse', uiLang)}</span>
                      <button className="log-close-btn" onClick={cancelLogging}>
                        <X size={18} />
                      </button>
                    </div>

                    {/* Photo preview or photo capture buttons */}
                    {logPhoto ? (
                      <div className="log-photo-preview">
                        <img src={logPhoto} alt="Response" />
                        <button
                          className="log-photo-remove"
                          onClick={() => setLogPhoto(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="log-photo-btns">
                        <button className="log-photo-btn" onClick={handleLogTakePhoto}>
                          <Camera size={22} />
                          <span>{t('takeScreenshot', uiLang)}</span>
                        </button>
                        <button className="log-photo-btn log-photo-btn-secondary" onClick={handleLogChooseGallery}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                          <span>{t('chooseScreenshot', uiLang)}</span>
                        </button>
                      </div>
                    )}

                    {/* Direction toggle */}
                    <div className="log-direction-row">
                      <button
                        className={`log-dir-btn ${logDirection === 'received' ? 'log-dir-active' : ''}`}
                        onClick={() => setLogDirection('received')}
                      >
                        ← {t('directionReceived', uiLang)}
                      </button>
                      <button
                        className={`log-dir-btn ${logDirection === 'sent' ? 'log-dir-active' : ''}`}
                        onClick={() => setLogDirection('sent')}
                      >
                        {t('directionSent', uiLang)} →
                      </button>
                    </div>

                    {/* Method selector */}
                    <div className="log-method-row">
                      {METHOD_OPTIONS.map(m => (
                        <button
                          key={m.id}
                          className={`log-method-btn ${logMethod === m.id ? 'log-method-active' : ''}`}
                          onClick={() => setLogMethod(m.id)}
                        >
                          {t(m.key, uiLang)}
                        </button>
                      ))}
                    </div>

                    {/* Optional note */}
                    {!showNoteField ? (
                      <button
                        className="log-add-note-btn"
                        onClick={() => setShowNoteField(true)}
                      >
                        + {t('optionalNote', uiLang)}
                      </button>
                    ) : (
                      <textarea
                        className="input-field log-note-textarea"
                        placeholder={t('notePlaceholder', uiLang)}
                        value={logNote}
                        onChange={e => setLogNote(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                    )}

                    {/* Save / Cancel */}
                    <div className="log-actions">
                      <button className="btn btn-primary log-save-btn" onClick={handleSaveLog}>
                        {t('saveLog', uiLang)}
                      </button>
                    </div>
                  </div>
                )}

                {/* Export button */}
                <button
                  className="btn btn-secondary export-btn"
                  onClick={() => handleExportSingle(record)}
                >
                  <FileDown size={18} />
                  <span>{t('exportRepairRequest', uiLang)}</span>
                </button>

                {/* Generate Formal Request */}
                <button
                  className="btn btn-secondary export-btn"
                  onClick={() => {
                    const settings = getSettings();
                    generateFormalRequest(record, settings, uiLang);
                  }}
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <FileText size={18} />
                  <span>{t('generateFormalRequest', uiLang)}</span>
                </button>

                {/* === ENHANCED CORRESPONDENCE TIMELINE === */}
                {record.communications && record.communications.length > 0 && (
                  <div className="comm-log">
                    <h5 className="comm-log-title">{t('correspondenceTimeline', uiLang)}</h5>
                    {record.communications.map(c => {
                      if (!c) return null;
                      const isSent = c.direction === 'sent' || !c.direction;
                      return (
                        <div key={c.id || Math.random()} className="comm-entry-enhanced">
                          <div className="comm-entry-row">
                            <span className={`comm-direction ${isSent ? 'comm-sent' : 'comm-received'}`}>
                              {isSent ? '→' : '←'}
                            </span>
                            <span className="comm-method-badge">
                              {getMethodLabel(c.method)}
                            </span>
                            <span className="comm-at">{formatDate(c.timestamp)}</span>
                          </div>
                          {c.summary && (
                            <p className="comm-summary">{c.summary}</p>
                          )}
                          {c.imageDataUrl && (
                            <div className="comm-image-thumb">
                              <img src={c.imageDataUrl} alt="Response" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
        .record-photo-preview {
          width: 100%;
          height: 120px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .record-photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .record-description {
          font-size: 0.85rem;
          color: var(--color-text-light);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        /* === Log Response Button === */
        .log-response-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--color-primary);
          background: rgba(59, 130, 246, 0.06);
          color: var(--color-primary);
          font-weight: 700;
          font-size: 0.95rem;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .log-response-btn:active {
          transform: scale(0.97);
          background: rgba(59, 130, 246, 0.12);
        }

        /* === Log Form === */
        .log-form {
          margin-top: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: rgba(59, 130, 246, 0.04);
          border: 1.5px solid rgba(59, 130, 246, 0.15);
        }
        .log-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .log-form-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text);
        }
        .log-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--color-text-light-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
        }
        .log-close-btn:active {
          transform: scale(0.9);
        }

        /* Photo capture buttons */
        .log-photo-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .log-photo-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 1rem 0.5rem;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.8rem;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .log-photo-btn:active {
          transform: scale(0.96);
          border-color: var(--color-primary);
        }
        .log-photo-btn-secondary {
          color: var(--color-text-light);
        }

        /* Photo preview */
        .log-photo-preview {
          position: relative;
          width: 100%;
          max-height: 200px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .log-photo-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .log-photo-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Direction toggle */
        .log-direction-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .log-dir-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--color-border);
          background: var(--color-surface-light);
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-light-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }
        .log-dir-btn:active {
          transform: scale(0.96);
        }
        .log-dir-active {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(59, 130, 246, 0.08);
        }

        /* Method selector */
        .log-method-row {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .log-method-btn {
          padding: 0.35rem 0.65rem;
          border-radius: 100px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface-light);
          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-text-light-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .log-method-btn:active {
          transform: scale(0.95);
        }
        .log-method-active {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(59, 130, 246, 0.08);
        }

        /* Optional note */
        .log-add-note-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.25rem 0;
          font-family: inherit;
          opacity: 0.85;
          margin-bottom: 0.5rem;
        }
        .log-note-textarea {
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        /* Save button */
        .log-actions {
          display: flex;
          gap: 0.5rem;
        }
        .log-save-btn {
          flex: 1;
          padding: 0.75rem;
          font-size: 0.95rem;
        }

        /* === Enhanced Timeline === */
        .comm-log {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--color-border);
        }
        .comm-log-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--color-text-light-muted);
          letter-spacing: 0.05em;
        }
        .comm-entry-enhanced {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(128,128,128,0.1);
        }
        .comm-entry-enhanced:last-child {
          border-bottom: none;
        }
        .comm-entry-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        .comm-direction {
          font-weight: 800;
          font-size: 0.9rem;
          width: 20px;
          text-align: center;
        }
        .comm-sent {
          color: var(--color-primary);
        }
        .comm-received {
          color: var(--color-success, #22c55e);
        }
        .comm-method-badge {
          font-weight: 700;
          font-size: 0.65rem;
          text-transform: uppercase;
          padding: 0.15rem 0.45rem;
          border-radius: 100px;
          background: rgba(59, 130, 246, 0.08);
          color: var(--color-primary);
          letter-spacing: 0.03em;
        }
        .comm-at {
          color: var(--color-text-light-muted);
          margin-left: auto;
          font-size: 0.68rem;
        }
        .comm-summary {
          margin: 0.35rem 0 0 1.75rem;
          font-size: 0.8rem;
          color: var(--color-text-light);
          line-height: 1.4;
        }
        .comm-image-thumb {
          margin: 0.5rem 0 0 1.75rem;
          width: 120px;
          height: 80px;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .comm-image-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .export-btn {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
