import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Check, ChevronRight, Trash2, Image as ImageIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { saveConditionReport, getConditionReports, deleteConditionReport } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

const ROOMS = [
    { id: 'kitchen', icon: '🍳' },
    { id: 'bathroom', icon: '🚿' },
    { id: 'bedroom', icon: '🛏️' },
    { id: 'living_room', icon: '🛋️' },
    { id: 'hallway', icon: '🚪' },
    { id: 'laundry', icon: '🧺' },
    { id: 'basement', icon: '📦' },
    { id: 'balcony_patio', icon: '🌿' },
    { id: 'garage', icon: '🚗' },
    { id: 'exterior', icon: '🏠' },
];

export default function ConditionReport() {
    const [reports, setReports] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [reportType, setReportType] = useState('move_in');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomPhotos, setRoomPhotos] = useState({}); // { roomId: [dataUrl, ...] }
    const [roomNotes, setRoomNotes] = useState({}); // { roomId: 'note' }
    const [completedRooms, setCompletedRooms] = useState([]);
    const fileInputRef = useRef(null);
    const { uiLang } = useLanguage();

    useEffect(() => {
        setReports(getConditionReports());
    }, []);

    const handleTakePhoto = async () => {
        if (!currentRoom) return;
        if (Capacitor.isNativePlatform()) {
            try {
                const image = await CapCamera.getPhoto({
                    quality: 80, resultType: CameraResultType.DataUrl,
                    source: CameraSource.Camera, width: 1200, correctOrientation: true, saveToGallery: true,
                });
                addPhoto(image.dataUrl);
            } catch (err) { console.log('Camera cancelled', err); }
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
            }
        }
    };

    const handleChooseGallery = async () => {
        if (!currentRoom) return;
        if (Capacitor.isNativePlatform()) {
            try {
                const image = await CapCamera.getPhoto({
                    quality: 80, resultType: CameraResultType.DataUrl,
                    source: CameraSource.Photos, width: 1200, correctOrientation: true,
                });
                addPhoto(image.dataUrl);
            } catch (err) { console.log('Gallery cancelled', err); }
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
            }
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => addPhoto(reader.result);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const addPhoto = (dataUrl) => {
        if (!currentRoom) return;
        setRoomPhotos(prev => ({
            ...prev,
            [currentRoom]: [...(prev[currentRoom] || []), dataUrl],
        }));
    };

    const markRoomDone = () => {
        if (!currentRoom) return;
        if (!completedRooms.includes(currentRoom)) {
            setCompletedRooms(prev => [...prev, currentRoom]);
        }
        setCurrentRoom(null);
    };

    const handleSaveReport = () => {
        const rooms = completedRooms.map(roomId => ({
            roomId,
            photos: roomPhotos[roomId] || [],
            note: roomNotes[roomId] || '',
        }));
        saveConditionReport({
            type: reportType,
            rooms,
            totalPhotos: rooms.reduce((sum, r) => sum + r.photos.length, 0),
        });
        setReports(getConditionReports());
        resetForm();
    };

    const resetForm = () => {
        setIsCreating(false);
        setReportType('move_in');
        setCurrentRoom(null);
        setRoomPhotos({});
        setRoomNotes({});
        setCompletedRooms([]);
    };

    const handleDeleteReport = (id) => {
        deleteConditionReport(id);
        setReports(getConditionReports());
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
        }).format(new Date(iso));
    };

    const getRoomLabel = (id) => t(`loc${id.charAt(0).toUpperCase()}${id.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`, uiLang) || id;

    return (
        <div className="animate-fade-in condition-page">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileInput} style={{ display: 'none' }} />

            <h2 className="step-title">{t('conditionReport', uiLang)}</h2>
            <p className="step-subtitle">{t('conditionReportDesc', uiLang)}</p>

            {!isCreating && (
                <>
                    <button className="start-report-btn" onClick={() => setIsCreating(true)}>
                        <Camera size={22} />
                        <div>
                            <strong>{t('startReport', uiLang)}</strong>
                            <span>{t('startReportHint', uiLang)}</span>
                        </div>
                    </button>

                    {reports.length > 0 && (
                        <div className="past-reports">
                            <h3 className="section-label">{t('pastReports', uiLang)}</h3>
                            {reports.map(r => (
                                <div key={r.id} className="glass-panel report-card">
                                    <div className="report-top">
                                        <span className={`report-type-badge ${r.type === 'move_in' ? 'badge-in' : 'badge-out'}`}>
                                            {r.type === 'move_in' ? t('moveIn', uiLang) : t('moveOut', uiLang)}
                                        </span>
                                        <span className="report-date">{formatDate(r.timestamp)}</span>
                                    </div>
                                    <p className="report-meta">
                                        {r.rooms?.length || 0} {t('rooms', uiLang)} · {r.totalPhotos || 0} {t('photos', uiLang)}
                                    </p>
                                    <button className="payment-delete" onClick={() => handleDeleteReport(r.id)} aria-label="Delete report">
                                        <Trash2 size={14} aria-hidden="true" /> {t('remove', uiLang)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {reports.length === 0 && (
                        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.7 }}>
                            <Camera size={40} style={{ color: 'var(--color-text-light-muted)', marginBottom: '0.75rem' }} />
                            <p style={{ color: 'var(--color-text-light-muted)', margin: 0 }}>{t('noReportsYet', uiLang)}</p>
                        </div>
                    )}
                </>
            )}

            {/* Creating a report */}
            {isCreating && !currentRoom && (
                <div className="animate-fade-in">
                    {/* Type selector */}
                    <div className="type-toggle">
                        <button className={`type-btn ${reportType === 'move_in' ? 'type-active' : ''}`} onClick={() => setReportType('move_in')} aria-pressed={reportType === 'move_in'}>
                            📥 {t('moveIn', uiLang)}
                        </button>
                        <button className={`type-btn ${reportType === 'move_out' ? 'type-active' : ''}`} onClick={() => setReportType('move_out')} aria-pressed={reportType === 'move_out'}>
                            📤 {t('moveOut', uiLang)}
                        </button>
                    </div>

                    <h3 className="section-label">{t('selectRoomsToDocument', uiLang)}</h3>
                    <div className="room-grid">
                        {ROOMS.map(room => {
                            const isDone = completedRooms.includes(room.id);
                            const photoCount = (roomPhotos[room.id] || []).length;
                            return (
                                <button key={room.id} className={`room-btn glass-panel ${isDone ? 'room-done' : ''}`} onClick={() => setCurrentRoom(room.id)} aria-pressed={isDone}>
                                    <span className="room-icon">{room.icon}</span>
                                    <span className="room-label">{getRoomLabel(room.id)}</span>
                                    {isDone && <Check size={16} className="room-check" />}
                                    {photoCount > 0 && <span className="room-count">{photoCount} 📷</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="report-actions">
                        {completedRooms.length > 0 && (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveReport}>
                                {t('saveReport', uiLang)} ({completedRooms.length} {t('rooms', uiLang)})
                            </button>
                        )}
                        <button className="btn btn-secondary" style={{ flex: completedRooms.length > 0 ? 0 : 1 }} onClick={resetForm}>
                            {t('cancelLog', uiLang)}
                        </button>
                    </div>
                </div>
            )}

            {/* Documenting a specific room */}
            {isCreating && currentRoom && (
                <div className="animate-fade-in room-capture">
                    <h3 className="room-capture-title">
                        {ROOMS.find(r => r.id === currentRoom)?.icon} {getRoomLabel(currentRoom)}
                    </h3>
                    <p className="step-subtitle">{t('takePhotosOfRoom', uiLang)}</p>

                    {/* Photo grid */}
                    {(roomPhotos[currentRoom] || []).length > 0 && (
                        <div className="capture-photos">
                            {roomPhotos[currentRoom].map((photo, i) => (
                                <div key={i} className="capture-thumb">
                                    <img src={photo} alt={`Room photo ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="photo-btn-grid" style={{ marginBottom: '0.75rem' }}>
                        <button className="photo-btn" onClick={handleTakePhoto}>
                            <Camera size={22} /> <span>{t('takePhoto', uiLang)}</span>
                        </button>
                        <button className="photo-btn photo-btn-secondary" onClick={handleChooseGallery}>
                            <ImageIcon size={22} /> <span>{t('chooseFromGallery', uiLang)}</span>
                        </button>
                    </div>

                    <input
                        className="input-field"
                        placeholder={t('roomNotePlaceholder', uiLang)}
                        aria-label={t('roomNotePlaceholder', uiLang)}
                        value={roomNotes[currentRoom] || ''}
                        onChange={e => setRoomNotes(prev => ({ ...prev, [currentRoom]: e.target.value }))}
                        style={{ marginBottom: '0.75rem' }}
                    />

                    <div className="report-actions">
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={markRoomDone}>
                            <Check size={18} /> {t('doneWithRoom', uiLang)}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setCurrentRoom(null)}>
                            {t('back', uiLang)}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        .condition-page{padding-bottom:2rem}
        .start-report-btn{display:flex;align-items:center;gap:0.75rem;width:100%;padding:1rem 1.15rem;border:2px solid var(--color-primary);border-radius:var(--radius-lg);background:rgba(59,130,246,0.06);color:var(--color-primary);cursor:pointer;font-family:inherit;text-align:left;transition:all var(--transition-fast);margin-bottom:1rem}
        .start-report-btn:active{transform:scale(0.98)}
        .start-report-btn strong{display:block;font-size:0.95rem}
        .start-report-btn span{font-size:0.78rem;opacity:0.75}
        .section-label{font-size:0.85rem;font-weight:700;margin:1rem 0 0.5rem;color:var(--color-text)}
        .type-toggle{display:flex;gap:0.5rem;margin-bottom:1rem}
        .type-btn{flex:1;padding:0.75rem;border-radius:var(--radius-md);border:2px solid var(--color-border);background:var(--color-surface-light);font-weight:600;font-size:0.9rem;font-family:inherit;color:var(--color-text-light);cursor:pointer;transition:all var(--transition-fast);text-align:center}
        .type-btn:active{transform:scale(0.97)}
        .type-active{border-color:var(--color-primary);background:rgba(59,130,246,0.08);color:var(--color-primary)}
        .room-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem}
        .room-btn{display:flex;flex-direction:column;align-items:center;gap:0.25rem;padding:0.85rem 0.5rem;cursor:pointer;border:2px solid transparent;position:relative;transition:all var(--transition-fast)}
        .room-btn:active{transform:scale(0.96)}
        .room-done{border-color:var(--color-success);background:rgba(16,185,129,0.06)}
        .room-icon{font-size:1.5rem}
        .room-label{font-size:0.78rem;font-weight:600;text-align:center}
        .room-check{position:absolute;top:6px;right:6px;color:var(--color-success)}
        .room-count{font-size:0.65rem;color:var(--color-text-light-muted)}
        .report-actions{display:flex;gap:0.5rem;margin-top:0.5rem}
        .room-capture-title{font-size:1.2rem;margin-bottom:0.15rem}
        .capture-photos{display:flex;gap:0.5rem;overflow-x:auto;padding-bottom:0.5rem;margin-bottom:0.75rem}
        .capture-thumb{min-width:100px;height:100px;border-radius:var(--radius-sm);overflow:hidden}
        .capture-thumb img{width:100px;height:100px;object-fit:cover}
        .past-reports{margin-top:0.5rem}
        .report-card{padding:1rem 1.15rem;margin-bottom:0.5rem}
        .report-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem}
        .report-type-badge{font-size:0.7rem;font-weight:700;text-transform:uppercase;padding:0.2rem 0.5rem;border-radius:100px;letter-spacing:0.03em}
        .badge-in{background:rgba(59,130,246,0.1);color:var(--color-primary)}
        .badge-out{background:rgba(245,158,11,0.1);color:#d97706}
        .report-date{font-size:0.75rem;color:var(--color-text-light-muted)}
        .report-meta{font-size:0.82rem;color:var(--color-text-light-muted);margin:0}
      `}</style>
        </div>
    );
}
