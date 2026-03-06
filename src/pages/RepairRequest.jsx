import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, Mail, ChevronRight, ImageIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { saveRepairRequest, getSettings, saveSettings, saveVaultItem, logCommunication } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t, tm, ISSUE_KEY_MAP, LOCATION_KEY_MAP, URGENCY_KEY_MAP } from '../utils/i18n';
import { getStateTimelineForUrgency, getStateRepairRule, inferStateCodeFromAddress, getStateOptions, normalizeStateCode } from '../utils/stateRepairRules';

const LOCATIONS = [
  { id: 'kitchen' },
  { id: 'bathroom' },
  { id: 'bedroom' },
  { id: 'living_room' },
  { id: 'hallway' },
  { id: 'laundry' },
  { id: 'basement' },
  { id: 'balcony_patio' },
  { id: 'garage' },
  { id: 'exterior' },
];

const LOCATION_ISSUES = {
  kitchen: [
    { id: 'sink', icon: '🚰' },
    { id: 'faucet', icon: '🚿' },
    { id: 'fridge', icon: '🧊' },
    { id: 'stove_oven', icon: '🍳' },
    { id: 'dishwasher', icon: '🍽️' },
    { id: 'garbage_disposal', icon: '🗑️' },
    { id: 'cabinets', icon: '🗄️' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'water_leak', icon: '💧' },
    { id: 'mold', icon: '🟢' },
    { id: 'flooring', icon: '🪵' },
    { id: 'other', icon: '🔧' },
  ],
  bathroom: [
    { id: 'toilet', icon: '🚽' },
    { id: 'shower_tub', icon: '🚿' },
    { id: 'sink', icon: '🚰' },
    { id: 'faucet', icon: '🔧' },
    { id: 'no_hot_water', icon: '🌡️' },
    { id: 'water_leak', icon: '💧' },
    { id: 'mold', icon: '🟢' },
    { id: 'exhaust_fan', icon: '💨' },
    { id: 'flooring', icon: '🪵' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'other', icon: '🔧' },
  ],
  bedroom: [
    { id: 'heating_ac', icon: '🌡️' },
    { id: 'pest', icon: '🐜' },
    { id: 'mold', icon: '🟢' },
    { id: 'door', icon: '🚪' },
    { id: 'window', icon: '🪟' },
    { id: 'closet', icon: '🗄️' },
    { id: 'ceiling', icon: '🏠' },
    { id: 'walls', icon: '🧱' },
    { id: 'flooring', icon: '🪵' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'other', icon: '🔧' },
  ],
  living_room: [
    { id: 'heating_ac', icon: '🌡️' },
    { id: 'pest', icon: '🐜' },
    { id: 'mold', icon: '🟢' },
    { id: 'door', icon: '🚪' },
    { id: 'window', icon: '🪟' },
    { id: 'ceiling', icon: '🏠' },
    { id: 'walls', icon: '🧱' },
    { id: 'flooring', icon: '🪵' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'other', icon: '🔧' },
  ],
  hallway: [
    { id: 'stairs', icon: '🪜' },
    { id: 'door', icon: '🚪' },
    { id: 'flooring', icon: '🪵' },
    { id: 'pest', icon: '🐜' },
    { id: 'lights', icon: '💡' },
    { id: 'walls', icon: '🧱' },
    { id: 'other', icon: '🔧' },
  ],
  laundry: [
    { id: 'washer', icon: '🧺' },
    { id: 'dryer', icon: '💨' },
    { id: 'sink', icon: '🚰' },
    { id: 'water_leak', icon: '💧' },
    { id: 'mold', icon: '🟢' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'other', icon: '🔧' },
  ],
  basement: [
    { id: 'water_leak', icon: '💧' },
    { id: 'flooding', icon: '🌊' },
    { id: 'mold', icon: '🟢' },
    { id: 'heater', icon: '🔥' },
    { id: 'water_heater', icon: '🛢️' },
    { id: 'pest', icon: '🐜' },
    { id: 'outlets', icon: '🔌' },
    { id: 'lights', icon: '💡' },
    { id: 'structural', icon: '🏗️' },
    { id: 'other', icon: '🔧' },
  ],
  balcony_patio: [
    { id: 'railing', icon: '🚧' },
    { id: 'door', icon: '🚪' },
    { id: 'flooring', icon: '🪵' },
    { id: 'drainage', icon: '💧' },
    { id: 'lights', icon: '💡' },
    { id: 'pest', icon: '🐜' },
    { id: 'other', icon: '🔧' },
  ],
  garage: [
    { id: 'garage_door', icon: '🚗' },
    { id: 'lights', icon: '💡' },
    { id: 'outlets', icon: '🔌' },
    { id: 'water_leak', icon: '💧' },
    { id: 'pest', icon: '🐜' },
    { id: 'door', icon: '🚪' },
    { id: 'other', icon: '🔧' },
  ],
  exterior: [
    { id: 'roof', icon: '🏠' },
    { id: 'exterior_door', icon: '🚪' },
    { id: 'steps_walkway', icon: '🪜' },
    { id: 'fence_gate', icon: '🔒' },
    { id: 'parking', icon: '🚗' },
    { id: 'lights', icon: '💡' },
    { id: 'trash', icon: '🗑️' },
    { id: 'landscaping', icon: '🌳' },
    { id: 'pest', icon: '🐜' },
    { id: 'other', icon: '🔧' },
  ],
};


const URGENCY_LEVELS = [
  { id: 'low', color: 'var(--color-success)' },
  { id: 'normal', color: 'var(--color-primary)' },
  { id: 'high', color: '#f59e0b' },
  { id: 'emergency', color: 'var(--color-danger)' },
];

// Context-aware placeholder hints — add detail the user DIDN'T already tap
const ISSUE_DESCRIPTION_HINTS = {
  sink: 'How long has it been draining slowly? Any standing water or odor?',
  faucet: 'Is it a slow drip or a constant flow? Hot, cold, or both?',
  fridge: 'Is it not cooling, making noise, or leaking? When did it start?',
  stove_oven: 'Which burner or element? Any smell of gas or burning?',
  dishwasher: 'Is it not draining, leaking, or not cleaning properly?',
  garbage_disposal: 'Is it jammed, humming but not spinning, or completely dead?',
  cabinets: 'Which cabinet? Hinge broken, door won\'t close, or shelf collapsed?',
  outlets: 'Which outlet(s)? Any sparking, discoloration, or tripped breaker?',
  lights: 'Is it flickering, completely out, or a fixture issue? Which room?',
  toilet: 'Is it running constantly, overflowing, not flushing, or rocking?',
  shower_tub: 'Low pressure, no hot water, clog, or tile/grout issue?',
  exhaust_fan: 'Not turning on, noisy, or not venting properly?',
  mirror: 'Cracked, loose, or falling off wall?',
  door: 'Won\'t close, lock broken, hinge loose, or gap letting in draft?',
  window: 'Won\'t open/close, cracked, broken lock, or drafty?',
  closet: 'Sliding door off track, rod collapsed, or door won\'t shut?',
  walls: 'Crack, hole, water stain, mold, or peeling paint? Roughly what size?',
  stairs: 'Loose railing, broken step, or creaking?',
  washer: 'Not draining, leaking, not spinning, or error code showing?',
  dryer: 'Not heating, taking too long, or making unusual noise?',
  water_leak: 'Where exactly is the water coming from? Any visible damage?',
  heater: 'Not turning on, not reaching temp, or making noise?',
  water_heater: 'No hot water, lukewarm, or leaking around the unit?',
  pest: 'What type of pest? Where did you see them and how many?',
  roof: 'Visible damage, leaking into unit, or missing shingles?',
  parking: 'Damaged surface, lighting issue, or blocked access?',
  landscaping: 'Overgrown, blocked path, fallen branch, or drainage issue?',
  trash: 'Overflowing, not collected, or placement issue?',
  exterior_door: 'Lock broken, door won\'t seal, or hinge damage?',
  other: 'Please describe what\'s happening and how long it\'s been an issue.',
};


export default function RepairRequest() {
  const [locations, setLocations] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState({});
  const [urgency, setUrgency] = useState('normal');
  const [description, setDescription] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoToast, setPhotoToast] = useState(false);
  const [step, setStep] = useState(1); // 1=location, 2=issue, 3=urgency+photo+desc, 4=send
  const fileInputRef = useRef(null);
  const [landlord, setLandlord] = useState({});
  const [tenant, setTenant] = useState({});
  const [showTenantFields, setShowTenantFields] = useState(false);
  const [showLandlordFields, setShowLandlordFields] = useState(false);
  const { uiLang } = useLanguage();
  const [messageLang, setMessageLang] = useState('en');
  const [tenantState, setTenantState] = useState('');


  useEffect(() => {
    const s = getSettings();
    setLandlord(s);
    setTenant(s);
    setTenantState(normalizeStateCode(s.tenantState || inferStateCodeFromAddress(s.tenantAddress)));
    if (!s.tenantName && !s.tenantAddress) setShowTenantFields(true);
    if (!s.landlordPhone && !s.landlordEmail) setShowLandlordFields(true);
  }, []);

  // Use Capacitor Camera on native, fallback to file input on web
  const handleTakePhoto = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 80,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1200,
          correctOrientation: true,
          saveToGallery: true,
        });
        setPhotoPreviews(prev => [...prev, image.dataUrl]);
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

  const handleChooseGallery = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 80,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          width: 1200,
          correctOrientation: true,
        });
        setPhotoPreviews(prev => [...prev, image.dataUrl]);
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

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Translate issue/location labels for UI
  const getIssueLabel = (id) => {
    const key = ISSUE_KEY_MAP[id];
    if (key) return t(key, uiLang);
    // Try the id itself as an i18n key (e.g. 'itemMold')
    const direct = t(id, uiLang);
    if (direct !== id) return direct;
    return id;
  };
  const getLocationLabel = (id) => t(LOCATION_KEY_MAP[id], uiLang);
  const getUrgencyLabel = (id) => t(URGENCY_KEY_MAP[id], uiLang);

  // Translate issue/location labels for the message body
  const getMsgUrgencyLabel = (id) => tm(URGENCY_KEY_MAP[id], messageLang);
  const stateCode = normalizeStateCode(tenantState || tenant.tenantState || inferStateCodeFromAddress(tenant.tenantAddress));
  const stateCatalogRule = getStateRepairRule(stateCode);
  const stateRule = getStateTimelineForUrgency(stateCode, urgency);
  const stateTimelineUnverified = Boolean(stateCode && stateCatalogRule && !stateRule);
  const stateOptions = getStateOptions();

  const getMessageBody = () => {
    const ml = messageLang;

    // --- Header ---
    const lines = [tm('maintenanceRequest', ml)];
    lines.push('');

    // --- Contact info ---
    if (landlord.landlordName) lines.push(`${tm('to', ml)}: ${landlord.landlordName}`);
    if (tenant.tenantName) lines.push(`${tm('from', ml)}: ${tenant.tenantName}`);
    if (tenant.tenantAddress) lines.push(`${tm('address', ml)}: ${tenant.tenantAddress}`);
    if (tenant.tenantPhone) lines.push(`${tm('contactPhone', ml)}: ${tenant.tenantPhone}`);
    if (tenant.tenantEmail) lines.push(`${tm('contactEmail', ml)}: ${tenant.tenantEmail}`);
    lines.push('');

    // --- Urgency (prominent, before the issue list) ---
    lines.push(`${tm('urgency', ml)}: ${getMsgUrgencyLabel(urgency)}`);
    lines.push('');
    // State timeline hidden — not yet verified from official sources
    // if (stateRule) {
    //   lines.push(`${tm('stateTimeline', ml)}: ${stateRule.name} — ${stateRule.deadline}`);
    // }

    // --- Issue list ---
    lines.push(`${tm('location', ml)} / ${tm('issue', ml)}:`);
    locations.forEach(loc => {
      const issuesForLoc = selectedIssues[loc] || [];
      if (issuesForLoc.length > 0) {
        const issueStrs = issuesForLoc.map(i => {
          const key = ISSUE_KEY_MAP[i];
          if (key) return tm(key, ml);
          const direct = tm(i, ml);
          if (direct !== i) return direct;
          return i;
        });
        lines.push(`- ${tm(LOCATION_KEY_MAP[loc], ml)}: ${issueStrs.join(', ')}`);
      }
    });
    lines.push('');

    // --- Additional description ---
    if (description.trim()) {
      lines.push(description.trim());
      lines.push('');
    }

    // --- Photo attachment instructions (web only, shown in UI toast instead) ---
    if (photoPreviews.length > 0 && Capacitor.isNativePlatform()) {
      if (Capacitor.platform === 'ios') {
        lines.push(tm('attachInstructionIos', ml));
      } else if (Capacitor.platform === 'android') {
        lines.push(tm('attachInstructionAndroid', ml));
      }
    }

    return lines.join('\n');
  };


  const savePhotoToVault = () => {
    if (photoPreviews.length === 0) return;
    const timestamp = new Date().toISOString();
    // Use first location/issue combo for vault name
    const firstLoc = locations.find(l => selectedIssues[l] && selectedIssues[l].length > 0);
    const issueLabel = firstLoc ? getIssueLabel(selectedIssues[firstLoc][0]) : t('issueOther', uiLang);

    photoPreviews.forEach((preview, index) => {
      const suffix = photoPreviews.length > 1 ? ` ${index + 1}` : '';
      saveVaultItem({
        name: `Repair - ${issueLabel}${suffix} - ${timestamp.slice(0, 10)}.jpg`,
        type: 'image/jpeg',
        size: Math.round(preview.length * 0.75),
        category: 'images',
        dataUrl: preview,
      });
    });
  };

  const handleSubmit = async (method) => {
    setIsSubmitting(true);

    const historyLocs = locations.map(l => getLocationLabel(l)).join(', ');
    const firstLoc = locations.find(l => selectedIssues[l] && selectedIssues[l].length > 0);
    const historyIssue = firstLoc ? selectedIssues[firstLoc].map(i => getIssueLabel(i)).join(', ') + ((locations.length > 1 || selectedIssues[firstLoc].length > 1) ? '...' : '') : t('issueOther', uiLang);

    const requestId = saveRepairRequest({
      issue: historyIssue || t('issueOther', uiLang),
      location: historyLocs,
      urgency,
      description: description.trim(),
      hasPhoto: photoPreviews.length > 0,
      photoDataUrl: photoPreviews[0], // Store first photo as thumbnail
      method,
      details: selectedIssues
    })?.id;

    const toSave = {};
    if (landlord.landlordPhone) toSave.landlordPhone = landlord.landlordPhone;
    if (landlord.landlordEmail) toSave.landlordEmail = landlord.landlordEmail;
    if (landlord.landlordName) toSave.landlordName = landlord.landlordName;
    if (tenant.tenantName) toSave.tenantName = tenant.tenantName;
    if (tenant.tenantAddress) toSave.tenantAddress = tenant.tenantAddress;
    if (stateCode) toSave.tenantState = stateCode;
    if (tenant.tenantPhone) toSave.tenantPhone = tenant.tenantPhone;
    if (tenant.tenantEmail) toSave.tenantEmail = tenant.tenantEmail;
    if (Object.keys(toSave).length) saveSettings(toSave);

    savePhotoToVault();

    const body = getMessageBody();

    if (photoPreviews.length > 0 && Capacitor.isNativePlatform()) {
      try {
        // Save the first photo to cache for sharing
        const fileName = `repair-photo-${Date.now()}.jpg`;
        const base64Data = photoPreviews[0].split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: tm('emailSubject', messageLang),
          text: body,
          url: savedFile.uri,
          dialogTitle: tm('emailSubject', messageLang),
        });
        logCommunication(requestId, method, body, { direction: 'sent' });
      } catch (err) {
        console.log('Share cancelled or failed, falling back', err);
        openMessageIntent(method, body);
        logCommunication(requestId, method, body, { direction: 'sent' });
      }
    } else {
      // On web: auto-download photos then show toast before opening message app
      if (photoPreviews.length > 0) {
        photoPreviews.forEach((dataUrl, i) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `repair-photo-${i + 1}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        // Show toast, then open message app after short delay so user sees it
        setPhotoToast(true);
        setTimeout(() => {
          setPhotoToast(false);
          openMessageIntent(method, body);
          logCommunication(requestId, method, body, { direction: 'sent' });
        }, 2500);
        setIsSubmitting(false);
        return;
      }
      openMessageIntent(method, body);
      logCommunication(requestId, method, body, { direction: 'sent' });
    }

    setTimeout(() => {
      setLocations([]);
      setSelectedIssues({});
      setUrgency('normal');
      setDescription('');
      setPhotoPreviews([]);
      setShowDescription(false);
      setStep(1);
      setIsSubmitting(false);
    }, 1000);
  };

  const openMessageIntent = (method, body) => {
    const encodedBody = encodeURIComponent(body);
    let url = '';
    if (method === 'sms') {
      const phone = landlord.landlordPhone || '';
      url = `sms:${phone}?body=${encodedBody}`;
    } else {
      const email = landlord.landlordEmail || '';
      url = `mailto:${email}?subject=${encodeURIComponent(tm('emailSubject', messageLang))}&body=${encodedBody}`;
    }
    window.location.href = url;
  };

  const canProceed = () => {
    if (step === 1) return locations.length > 0;
    if (step === 2) {
      return locations.some(loc => selectedIssues[loc] && selectedIssues[loc].length > 0);
    }
    if (step === 3) return true;
    return false;
  };

  return (
    <div className="animate-fade-in repair-flow">
      {/* Photo download toast (web only) */}
      {photoToast && (
        <div className="photo-toast">
          <span style={{ fontSize: '2rem' }}>📎</span>
          <div>
            <strong>Photo saved to Downloads</strong>
            <span>Attach it when your email or text app opens</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('whereIsTheProblem', uiLang)}</h2>
          <p className="step-subtitle">{t('tapToSelectOneOrMore', uiLang)}</p>
          <div className="chip-grid chip-grid-2col">
            {LOCATIONS.map(loc => {
              const isActive = locations.includes(loc.id);
              return (
                <button
                  key={loc.id}
                  className={`chip chip-wide ${isActive ? 'chip-active' : ''}`}
                  onClick={() => {
                    setLocations(prev => {
                      if (prev.includes(loc.id)) {
                        return prev.filter(id => id !== loc.id);
                      } else {
                        return [...prev, loc.id];
                      }
                    });
                  }}
                >
                  <span className="chip-label">{getLocationLabel(loc.id)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Issue Type */}
      {step === 2 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('whatNeedsFixing', uiLang)}</h2>
          <p className="step-subtitle">{t('tapToSelectOneOrMore', uiLang)}</p>

          <div className="locations-issues-container">
            {locations.length > 0 ? locations.map(locId => (
              <div key={locId} className="location-group">
                <h3 className="location-group-title" style={{ marginTop: '0.5rem', marginBottom: '0.75rem', fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                  {getLocationLabel(locId)}
                </h3>
                <div className="chip-grid">
                  {(LOCATION_ISSUES[locId] || [{ id: 'other', icon: '🔧' }]).map(type => {
                    const isActive = selectedIssues[locId] && selectedIssues[locId].includes(type.id);
                    return (
                      <button
                        key={`${locId}-${type.id}`}
                        className={`chip ${isActive ? 'chip-active' : ''}`}
                        onClick={() => {
                          setSelectedIssues(prev => {
                            const cur = prev[locId] || [];
                            if (cur.includes(type.id)) {
                              return { ...prev, [locId]: cur.filter(id => id !== type.id) };
                            } else {
                              return { ...prev, [locId]: [...cur, type.id] };
                            }
                          });
                        }}
                      >
                        <span className="chip-icon">{type.icon}</span>
                        <span className="chip-label">{getIssueLabel(type.id)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>{t('pleaseSelectLocationFirst', uiLang)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Urgency + Photo + Description */}
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
            {!showDescription ? (
              <button
                onClick={() => setShowDescription(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  fontFamily: 'inherit',
                  opacity: 0.85,
                }}
              >
                + Add description <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span>
              </button>
            ) : (
              <>
                <p className="step-subtitle" style={{ marginBottom: '0.5rem' }}>{t('describeIssue', uiLang)}</p>
                <textarea
                  className="input-field description-textarea"
                  placeholder={(() => {
                    const firstLoc = locations.find(l => selectedIssues[l]?.length > 0);
                    const firstIssue = firstLoc && selectedIssues[firstLoc][0];
                    return firstIssue && ISSUE_DESCRIPTION_HINTS[firstIssue]
                      ? ISSUE_DESCRIPTION_HINTS[firstIssue]
                      : t('descriptionPlaceholder', uiLang);
                  })()}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  autoFocus
                />
              </>
            )}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <p className="step-subtitle" style={{ marginBottom: '0.75rem' }}>{t('addPhoto', uiLang)}</p>

            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            {photoPreviews.length > 0 && (
              <div className="photo-previews-container" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="photo-preview-wrap" style={{ minWidth: '120px', position: 'relative' }}>
                    <img src={preview} alt="Preview" className="photo-preview-img" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button onClick={() => removePhoto(index)} className="photo-remove-btn" style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="photo-btn-grid">
              <button className="photo-btn" onClick={handleTakePhoto}>
                <Camera size={24} />
                <span>{photoPreviews.length > 0 ? t('takeNewPhoto', uiLang) : t('takePhoto', uiLang)}</span>
              </button>
              <button className="photo-btn photo-btn-secondary" onClick={handleChooseGallery}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                <span>{t('chooseFromGallery', uiLang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Summary & Send */}
      {step === 4 && (
        <div className="step-panel animate-fade-in">
          <h2 className="step-title">{t('reviewAndSend', uiLang)}</h2>

          <div className="summary-card glass-panel">
            <div className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span className="summary-label">{t('summaryLocation', uiLang)} &amp; {t('summaryIssue', uiLang)}</span>
              {locations.map(loc => {
                const issues = selectedIssues[loc] || [];
                if (issues.length === 0) return null;
                const issueLabels = issues.map(i => getIssueLabel(i)).join(', ');
                return (
                  <div key={loc} style={{ fontSize: '0.9rem', width: '100%' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{getLocationLabel(loc)}:</span> {issueLabels}
                  </div>
                );
              })}
            </div>

            <div className="summary-row">
              <span className="summary-label">{t('summaryUrgency', uiLang)}</span>
              <span className="summary-value" style={{ textTransform: 'capitalize' }}>{getUrgencyLabel(urgency)}</span>
            </div>
            {/* State timeline hidden — not yet verified from official sources */}
            {description.trim() && (
              <div className="summary-row">
                <span className="summary-label">{t('description', uiLang)}</span>
                <span className="summary-value summary-desc">{description.trim()}</span>
              </div>
            )}
            {photoPreviews.length > 0 && (
              <div className="summary-row">
                <span className="summary-label">{t('summaryPhoto', uiLang)}</span>
                <span className="summary-value">{photoPreviews.length} {t('summaryAttached', uiLang)}</span>
              </div>
            )}
          </div>

          {showTenantFields && (
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
                onChange={e => {
                  const nextAddress = e.target.value;
                  setTenant(prev => ({ ...prev, tenantAddress: nextAddress }));
                  if (!tenantState) {
                    setTenantState(normalizeStateCode(inferStateCodeFromAddress(nextAddress)));
                  }
                }}
                style={{ marginBottom: '0.5rem' }}
              />
              <select
                className="input-field"
                value={tenantState}
                onChange={e => setTenantState(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              >
                <option value="">{t('selectStateOptional', uiLang)}</option>
                {stateOptions.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.name} ({option.code})
                  </option>
                ))}
              </select>
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

          {/* State timeline nudge hidden — not yet verified */}
          {/*
          {!stateCode && !showTenantFields && (
            <div className="glass-panel contact-nudge">
              <p className="nudge-text">{t('stateTimelineSetup', uiLang)}</p>
              <select
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
              <p className="nudge-hint">{t('wellRemember', uiLang)}</p>
            </div>
          )}
          */}

          {showLandlordFields && (
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

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send request in: </span>
            <select
              value={messageLang}
              onChange={(e) => setMessageLang(e.target.value)}
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-primary)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted'
              }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="zh">中文</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
            </select>
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
        .photo-toast {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 999;
          background: var(--color-surface-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 260px;
          max-width: 90vw;
          animation: fadeIn 0.2s ease;
        }
        .photo-toast strong {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .photo-toast span {
          font-size: 0.8rem;
          color: var(--color-text-light-muted);
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
        
        .locations-issues-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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
          text-align: center;
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

        /* Description */
        .description-textarea {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
          font-size: 0.9rem;
          line-height: 1.5;
          box-sizing: border-box;
        }

        /* Photo */
        .photo-btn-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .photo-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.25rem 0.5rem;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: transparent;
          cursor: pointer;
          color: var(--color-primary);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          transition: all var(--transition-fast);
        }
        .photo-btn-secondary {
          color: var(--color-secondary);
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
        .summary-desc {
          max-width: 60%;
          text-align: right;
          font-weight: 400;
          font-size: 0.85rem;
          word-break: break-word;
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
          margin-top: 2rem;
          position: sticky;
          bottom: calc(75px + env(safe-area-inset-bottom, 0px));
          z-index: 40;
          padding: 0.5rem;
          background: var(--color-surface-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-border);
          backdrop-filter: blur(16px);
        }
        @media (min-width: 768px) {
          .step-nav {
            bottom: 2rem;
          }
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
