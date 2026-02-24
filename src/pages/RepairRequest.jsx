import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, Mail, ChevronRight } from 'lucide-react';
import { saveRepairRequest, getSettings, saveSettings } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t, tm, ISSUE_KEY_MAP, LOCATION_KEY_MAP, URGENCY_KEY_MAP } from '../utils/i18n';

const ISSUE_TYPES = [
  { id: 'plumbing', icon: '🚿' },
  { id: 'electrical', icon: '⚡' },
  { id: 'appliance', icon: '🧊' },
  { id: 'hvac', icon: '🌡️' },
  { id: 'pest', icon: '🐜' },
  { id: 'lock', icon: '🔒' },
  { id: 'window', icon: '🪟' },
  { id: 'water_damage', icon: '💧' },
  { id: 'mold', icon: '🟤' },
  { id: 'structural', icon: '🏗️' },
  { id: 'other', icon: '🔧' },
];

const LOCATIONS = [
  { id: 'kitchen' },
  { id: 'bathroom' },
  { id: 'bedroom' },
  { id: 'living_room' },
  { id: 'hallway' },
  { id: 'laundry' },
  { id: 'basement' },
  { id: 'exterior' },
];

const URGENCY_LEVELS = [
  { id: 'low', color: 'var(--color-success)' },
  { id: 'normal', color: 'var(--color-primary)' },
  { id: 'high', color: '#f59e0b' },
  { id: 'emergency', color: 'var(--color-danger)' },
];

export default function RepairRequest() {
  const [issue, setIssue] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=issue, 2=location, 3=urgency+photo, 4=send
  const fileInputRef = useRef(null);
  const [landlord, setLandlord] = useState({});
  const [tenant, setTenant] = useState({});
  const { uiLang, messageLang } = useLanguage();

  useEffect(() => {
    const s = getSettings();
    setLandlord(s);
    setTenant(s);
  }, []);

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Translate issue/location labels for UI
  const getIssueLabel = (id) => t(ISSUE_KEY_MAP[id], uiLang);
  const getLocationLabel = (id) => t(LOCATION_KEY_MAP[id], uiLang);
  const getUrgencyLabel = (id) => t(URGENCY_KEY_MAP[id], uiLang);

  // Translate issue/location labels for the message body
  const getMsgIssueLabel = (id) => tm(ISSUE_KEY_MAP[id], messageLang);
  const getMsgLocationLabel = (id) => tm(LOCATION_KEY_MAP[id], messageLang);
  const getMsgUrgencyLabel = (id) => tm(URGENCY_KEY_MAP[id], messageLang);

  const getMessageBody = () => {
    const ml = messageLang;
    const lines = [tm('maintenanceRequest', ml)];
    lines.push('');
    if (landlord.landlordName) lines.push(`${tm('to', ml)}: ${landlord.landlordName}`);
    if (tenant.tenantName) lines.push(`${tm('from', ml)}: ${tenant.tenantName}`);
    if (tenant.tenantAddress) lines.push(`${tm('address', ml)}: ${tenant.tenantAddress}`);
    if (tenant.tenantPhone) lines.push(`${tm('contactPhone', ml)}: ${tenant.tenantPhone}`);
    if (tenant.tenantEmail) lines.push(`${tm('contactEmail', ml)}: ${tenant.tenantEmail}`);
    lines.push('');
    lines.push(`${tm('issue', ml)}: ${getMsgIssueLabel(issue)}`);
    lines.push(`${tm('location', ml)}: ${getMsgLocationLabel(location)}`);
    lines.push(`${tm('urgency', ml)}: ${getMsgUrgencyLabel(urgency)}`);
    lines.push('');
    lines.push(tm('footer', ml));
    return encodeURIComponent(lines.join('\n'));
  };

  const handleSubmit = (method) => {
    setIsSubmitting(true);

    saveRepairRequest({
      issue: getIssueLabel(issue),
      location: getLocationLabel(location),
      urgency,
      hasPhoto: !!photoPreview,
      method,
    });

    // Auto-save contact info if entered inline
    const toSave = {};
    if (landlord.landlordPhone) toSave.landlordPhone = landlord.landlordPhone;
    if (landlord.landlordEmail) toSave.landlordEmail = landlord.landlordEmail;
    if (landlord.landlordName) toSave.landlordName = landlord.landlordName;
    if (tenant.tenantName) toSave.tenantName = tenant.tenantName;
    if (tenant.tenantAddress) toSave.tenantAddress = tenant.tenantAddress;
    if (tenant.tenantPhone) toSave.tenantPhone = tenant.tenantPhone;
    if (tenant.tenantEmail) toSave.tenantEmail = tenant.tenantEmail;
    if (Object.keys(toSave).length) saveSettings(toSave);

    const body = getMessageBody();
    let url = '';
    if (method === 'sms') {
      const phone = landlord.landlordPhone || '';
      url = `sms:${phone}?body=${body}`;
    } else {
      const email = landlord.landlordEmail || '';
      url = `mailto:${email}?subject=${encodeURIComponent(tm('emailSubject', messageLang))}&body=${body}`;
    }

    window.location.href = url;

    setTimeout(() => {
      setIssue('');
      setLocation('');
      setUrgency('normal');
      setPhotoPreview(null);
      setStep(1);
      setIsSubmitting(false);
    }, 1000);
  };

  const canProceed = () => {
    if (step === 1) return !!issue;
    if (step === 2) return !!location;
    if (step === 3) return true;
    return false;
  };

  return (
    <div className="animate-fade-in repair-flow">
      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {/* Step 1: Issue Type */}
      {step === 1 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('whatsTheProblem', uiLang)}</h2>
          <p className="step-subtitle">{t('tapToSelect', uiLang)}</p>
          <div className="chip-grid">
            {ISSUE_TYPES.map(type => (
              <button
                key={type.id}
                className={`chip ${issue === type.id ? 'chip-active' : ''}`}
                onClick={() => setIssue(type.id)}
              >
                <span className="chip-icon">{type.icon}</span>
                <span className="chip-label">{getIssueLabel(type.id)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('whereIsIt', uiLang)}</h2>
          <p className="step-subtitle">{t('tapTheLocation', uiLang)}</p>
          <div className="chip-grid chip-grid-2col">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                className={`chip chip-wide ${location === loc.id ? 'chip-active' : ''}`}
                onClick={() => setLocation(loc.id)}
              >
                <span className="chip-label">{getLocationLabel(loc.id)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Urgency + Photo */}
      {step === 3 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('howUrgent', uiLang)}</h2>
          <div className="urgency-grid">
            {URGENCY_LEVELS.map(level => (
              <button
                key={level.id}
                className={`urgency-chip ${urgency === level.id ? 'urgency-active' : ''}`}
                onClick={() => setUrgency(level.id)}
                style={{
                  '--urgency-color': level.color,
                }}
              >
                {getUrgencyLabel(level.id)}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p className="step-subtitle" style={{ marginBottom: '0.75rem' }}>{t('addPhoto', uiLang)}</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
              style={{ display: 'none' }}
            />

            {photoPreview ? (
              <div className="photo-preview-wrap">
                <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                <button onClick={() => setPhotoPreview(null)} className="photo-remove-btn">
                  {t('remove', uiLang)}
                </button>
              </div>
            ) : (
              <button className="photo-btn" onClick={() => fileInputRef.current?.click()}>
                <Camera size={28} />
                <span>{t('takePhoto', uiLang)}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Summary & Send */}
      {step === 4 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('reviewAndSend', uiLang)}</h2>

          <div className="summary-card glass-panel">
            <div className="summary-row">
              <span className="summary-label">{t('summaryIssue', uiLang)}</span>
              <span className="summary-value">{ISSUE_TYPES.find(i => i.id === issue)?.icon} {getIssueLabel(issue)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t('summaryLocation', uiLang)}</span>
              <span className="summary-value">{getLocationLabel(location)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t('summaryUrgency', uiLang)}</span>
              <span className="summary-value" style={{ textTransform: 'capitalize' }}>{getUrgencyLabel(urgency)}</span>
            </div>
            {photoPreview && (
              <div className="summary-row">
                <span className="summary-label">{t('summaryPhoto', uiLang)}</span>
                <span className="summary-value">{t('summaryAttached', uiLang)}</span>
              </div>
            )}
          </div>

          {/* Inline tenant info if not yet saved */}
          {(!tenant.tenantName && !tenant.tenantAddress) && (
            <div className="glass-panel contact-nudge">
              <p className="nudge-text">{t('yourInfo', uiLang)}</p>
              <input
                className="input-field"
                placeholder={t('yourName', uiLang)}
                value={tenant.tenantName || ''}
                onChange={e => setTenant(prev => ({ ...prev, tenantName: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                className="input-field"
                placeholder={t('yourAddress', uiLang)}
                value={tenant.tenantAddress || ''}
                onChange={e => setTenant(prev => ({ ...prev, tenantAddress: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                className="input-field"
                type="tel"
                placeholder={t('yourPhoneOptional', uiLang)}
                value={tenant.tenantPhone || ''}
                onChange={e => setTenant(prev => ({ ...prev, tenantPhone: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                className="input-field"
                type="email"
                placeholder={t('yourEmailOptional', uiLang)}
                value={tenant.tenantEmail || ''}
                onChange={e => setTenant(prev => ({ ...prev, tenantEmail: e.target.value }))}
              />
              <p className="nudge-hint">{t('wellRemember', uiLang)}</p>
            </div>
          )}

          {/* Inline landlord contact if not yet saved */}
          {(!landlord.landlordPhone && !landlord.landlordEmail) && (
            <div className="glass-panel contact-nudge">
              <p className="nudge-text">{t('whoShouldThisGoTo', uiLang)}</p>
              <input
                className="input-field"
                placeholder={t('landlordNamePlaceholder', uiLang)}
                value={landlord.landlordName || ''}
                onChange={e => setLandlord(prev => ({ ...prev, landlordName: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                className="input-field"
                type="tel"
                placeholder={t('phonePlaceholder', uiLang)}
                value={landlord.landlordPhone || ''}
                onChange={e => setLandlord(prev => ({ ...prev, landlordPhone: e.target.value }))}
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                className="input-field"
                type="email"
                placeholder={t('emailPlaceholder', uiLang)}
                value={landlord.landlordEmail || ''}
                onChange={e => setLandlord(prev => ({ ...prev, landlordEmail: e.target.value }))}
              />
              <p className="nudge-hint">{t('wellRemember', uiLang)}</p>
            </div>
          )}

          <div className="send-grid">
            <button
              className="send-btn send-btn-sms"
              onClick={() => handleSubmit('sms')}
              disabled={isSubmitting}
            >
              <Send size={22} />
              <span>{t('sendText', uiLang)}</span>
            </button>
            <button
              className="send-btn send-btn-email"
              onClick={() => handleSubmit('email')}
              disabled={isSubmitting}
            >
              <Mail size={22} />
              <span>{t('sendEmail', uiLang)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="step-nav">
        {step > 1 && (
          <button className="btn btn-secondary step-back-btn" onClick={() => setStep(s => s - 1)}>
            {t('back', uiLang)}
          </button>
        )}
        {step < 4 && (
          <button
            className="btn btn-primary step-next-btn"
            disabled={!canProceed()}
            onClick={() => setStep(s => s + 1)}
          >
            {t('next', uiLang)} <ChevronRight size={18} />
          </button>
        )}
      </div>

      <style>{`
        .repair-flow {
          padding-bottom: 2rem;
        }
        .progress-track {
          height: 4px;
          background: var(--color-border);
          border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }
        .step-title {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .step-subtitle {
          color: var(--color-text-light-muted);
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }
        .step-panel {
          min-height: 320px;
        }

        /* Chip grid */
        .chip-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .chip-grid-2col {
          grid-template-columns: repeat(2, 1fr);
        }
        .chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 1rem 0.5rem;
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-border);
          background: var(--color-surface-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          color: var(--color-text-light);
          min-height: 70px;
        }
        .chip:active {
          transform: scale(0.95);
        }
        .chip-wide {
          flex-direction: row;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          justify-content: flex-start;
          min-height: 56px;
        }
        .chip-active {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.08);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
        }
        .chip-icon {
          font-size: 1.5rem;
          line-height: 1;
        }
        .chip-label {
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Urgency */
        .urgency-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .urgency-chip {
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--color-border);
          background: var(--color-surface-light);
          font-weight: 700;
          font-size: 1rem;
          font-family: inherit;
          color: var(--color-text-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: 56px;
        }
        .urgency-chip:active {
          transform: scale(0.95);
        }
        .urgency-active {
          border-color: var(--urgency-color);
          background: color-mix(in srgb, var(--urgency-color) 10%, transparent);
          color: var(--urgency-color);
        }

        /* Photo */
        .photo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1.25rem;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: transparent;
          cursor: pointer;
          color: var(--color-primary);
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          transition: all var(--transition-fast);
        }
        .photo-btn:active {
          transform: scale(0.98);
          border-color: var(--color-primary);
        }
        .photo-preview-wrap {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .photo-preview-img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          display: block;
        }
        .photo-remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.35rem 0.75rem;
          background: rgba(0,0,0,0.65);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        /* Summary */
        .summary-card {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .summary-row:last-child {
          border-bottom: none;
        }
        .summary-label {
          color: var(--color-text-light-muted);
          font-size: 0.85rem;
        }
        .summary-value {
          font-weight: 600;
          font-size: 0.95rem;
        }

        /* Send buttons */
        .send-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.1rem;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 700;
          font-size: 1.1rem;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: white;
        }
        .send-btn:active {
          transform: scale(0.97);
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .send-btn-sms {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .send-btn-email {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        }

        /* Contact nudge */
        .contact-nudge {
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
        }
        .nudge-text {
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 0.65rem;
        }
        .nudge-hint {
          font-size: 0.75rem;
          color: var(--color-text-light-muted);
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .step-nav {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .step-back-btn {
          flex: 0 0 auto;
          padding: 0.85rem 1.25rem;
        }
        .step-next-btn {
          flex: 1;
          padding: 0.85rem 1.5rem;
          font-size: 1.05rem;
        }
        .step-next-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
