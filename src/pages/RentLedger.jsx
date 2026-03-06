import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Plus, Camera, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getRentPayments, saveRentPayment, deleteRentPayment, getSettings } from '../utils/storage';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

export default function RentLedger() {
    const [payments, setPayments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('money_order');
    const [note, setNote] = useState('');
    const [receiptPhoto, setReceiptPhoto] = useState(null);
    const [monthlyRent, setMonthlyRent] = useState(0);
    const fileInputRef = useRef(null);
    const { uiLang } = useLanguage();

    useEffect(() => {
        setPayments(getRentPayments());
        const s = getSettings();
        setMonthlyRent(parseFloat(s.monthlyRent) || 0);
    }, []);

    const handleTakePhoto = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const image = await CapCamera.getPhoto({
                    quality: 80, resultType: CameraResultType.DataUrl,
                    source: CameraSource.Camera, width: 1200, correctOrientation: true,
                });
                setReceiptPhoto(image.dataUrl);
            } catch (err) { console.log('Camera cancelled', err); }
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
                    quality: 80, resultType: CameraResultType.DataUrl,
                    source: CameraSource.Photos, width: 1200, correctOrientation: true,
                });
                setReceiptPhoto(image.dataUrl);
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
            reader.onloadend = () => setReceiptPhoto(reader.result);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleSave = () => {
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) return;
        saveRentPayment({
            amount: parsed,
            method,
            note: note.trim(),
            receiptPhoto,
        });
        setPayments(getRentPayments());
        setAmount(''); setMethod('money_order'); setNote(''); setReceiptPhoto(null);
        setShowForm(false);
    };

    const handleDelete = (id) => {
        deleteRentPayment(id);
        setPayments(getRentPayments());
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        }).format(new Date(iso));
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    // Calculate balance for current month
    const now = new Date();
    const currentMonthPayments = payments.filter(p => {
        const d = new Date(p.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalPaidThisMonth = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remaining = monthlyRent > 0 ? monthlyRent - totalPaidThisMonth : null;

    const METHODS = [
        { id: 'money_order', label: t('payMethodMoneyOrder', uiLang) },
        { id: 'cash', label: t('payMethodCash', uiLang) },
        { id: 'check', label: t('payMethodCheck', uiLang) },
        { id: 'bank_transfer', label: t('payMethodTransfer', uiLang) },
        { id: 'other', label: t('payMethodOther', uiLang) },
    ];

    return (
        <div className="animate-fade-in rent-page">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileInput} style={{ display: 'none' }} />

            <h2 className="step-title">{t('rentLedger', uiLang)}</h2>
            <p className="step-subtitle">{t('rentLedgerDesc', uiLang)}</p>

            {/* Balance Card */}
            {monthlyRent > 0 && (
                <div className="glass-panel balance-card">
                    <div className="balance-row">
                        <div className="balance-item">
                            <span className="balance-label">{t('monthlyRent', uiLang)}</span>
                            <span className="balance-amount">{formatCurrency(monthlyRent)}</span>
                        </div>
                        <div className="balance-item">
                            <span className="balance-label">{t('paidThisMonth', uiLang)}</span>
                            <span className="balance-amount balance-paid">{formatCurrency(totalPaidThisMonth)}</span>
                        </div>
                        {remaining !== null && (
                            <div className="balance-item">
                                <span className="balance-label">{remaining <= 0 ? t('paidInFull', uiLang) : t('remaining', uiLang)}</span>
                                <span className={`balance-amount ${remaining <= 0 ? 'balance-good' : 'balance-due'}`}>
                                    {remaining <= 0 ? '✓' : formatCurrency(remaining)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {monthlyRent === 0 && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--color-text-light-muted)' }}>
                    💡 {t('setMonthlyRentHint', uiLang)}
                </div>
            )}

            {/* Add Payment Button */}
            {!showForm && (
                <button className="add-payment-btn" onClick={() => setShowForm(true)}>
                    <Plus size={20} />
                    <span>{t('logPayment', uiLang)}</span>
                </button>
            )}

            {/* Payment Form */}
            {showForm && (
                <div className="glass-panel payment-form animate-fade-in">
                    <div className="form-header">
                        <span className="form-title">💰 {t('logPayment', uiLang)}</span>
                        <button className="form-close" onClick={() => setShowForm(false)}><X size={18} /></button>
                    </div>

                    <div className="form-field">
                        <label className="input-label">{t('amount', uiLang)}</label>
                        <input
                            className="input-field"
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            autoFocus
                            style={{ fontSize: '1.2rem', fontWeight: 700 }}
                        />
                    </div>

                    <div className="form-field">
                        <label className="input-label">{t('paymentMethod', uiLang)}</label>
                        <div className="method-grid">
                            {METHODS.map(m => (
                                <button
                                    key={m.id}
                                    className={`method-chip ${method === m.id ? 'method-active' : ''}`}
                                    onClick={() => setMethod(m.id)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Receipt photo */}
                    <div className="form-field">
                        <label className="input-label">{t('receiptPhoto', uiLang)}</label>
                        {receiptPhoto ? (
                            <div className="receipt-preview">
                                <img src={receiptPhoto} alt="Receipt" />
                                <button className="receipt-remove" onClick={() => setReceiptPhoto(null)}><X size={14} /></button>
                            </div>
                        ) : (
                            <div className="photo-btn-grid">
                                <button className="photo-btn" onClick={handleTakePhoto}>
                                    <Camera size={20} /> <span>{t('takePhoto', uiLang)}</span>
                                </button>
                                <button className="photo-btn photo-btn-secondary" onClick={handleChooseGallery}>
                                    <ImageIcon size={20} /> <span>{t('chooseFromGallery', uiLang)}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-field">
                        <input
                            className="input-field"
                            placeholder={t('paymentNotePlaceholder', uiLang)}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary save-payment-btn" onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0}>
                        {t('savePayment', uiLang)}
                    </button>
                </div>
            )}

            {/* Payment History */}
            {payments.length === 0 && !showForm && (
                <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.7 }}>
                    <DollarSign size={40} style={{ color: 'var(--color-text-light-muted)', marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--color-text-light-muted)', margin: 0 }}>{t('noPaymentsYet', uiLang)}</p>
                </div>
            )}

            {payments.length > 0 && (
                <div className="payments-list">
                    {payments.map(p => (
                        <div key={p.id} className="glass-panel payment-card">
                            <div className="payment-top">
                                <div>
                                    <span className="payment-amount">{formatCurrency(p.amount)}</span>
                                    <span className="payment-method">{METHODS.find(m => m.id === p.method)?.label || p.method}</span>
                                </div>
                                <span className="payment-date">{formatDate(p.timestamp)}</span>
                            </div>
                            {p.note && <p className="payment-note">{p.note}</p>}
                            {p.receiptPhoto && (
                                <div className="payment-receipt">
                                    <img src={p.receiptPhoto} alt="Receipt" />
                                </div>
                            )}
                            <button className="payment-delete" onClick={() => handleDelete(p.id)}>
                                <Trash2 size={14} /> {t('remove', uiLang)}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .rent-page{padding-bottom:2rem}
        .balance-card{padding:1.15rem;margin-bottom:1rem}
        .balance-row{display:flex;gap:0.5rem;justify-content:space-around;text-align:center}
        .balance-item{display:flex;flex-direction:column;gap:0.2rem}
        .balance-label{font-size:0.68rem;color:var(--color-text-light-muted);text-transform:uppercase;letter-spacing:0.05em;font-weight:600}
        .balance-amount{font-size:1.15rem;font-weight:800}
        .balance-paid{color:var(--color-primary)}
        .balance-good{color:var(--color-success)}
        .balance-due{color:#f59e0b}
        .add-payment-btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.85rem;border-radius:var(--radius-md);border:2px solid var(--color-primary);background:rgba(59,130,246,0.06);color:var(--color-primary);font-weight:700;font-size:0.95rem;font-family:inherit;cursor:pointer;transition:all var(--transition-fast);margin-bottom:1rem}
        .add-payment-btn:active{transform:scale(0.97);background:rgba(59,130,246,0.12)}
        .payment-form{padding:1.15rem;margin-bottom:1rem}
        .form-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem}
        .form-title{font-weight:700;font-size:0.95rem}
        .form-close{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;color:var(--color-text-light-muted);cursor:pointer;border-radius:var(--radius-sm)}
        .form-field{margin-bottom:0.75rem}
        .method-grid{display:flex;flex-wrap:wrap;gap:0.35rem}
        .method-chip{padding:0.4rem 0.7rem;border-radius:100px;border:1.5px solid var(--color-border);background:var(--color-surface-light);font-family:inherit;font-size:0.75rem;font-weight:600;color:var(--color-text-light-muted);cursor:pointer;transition:all var(--transition-fast)}
        .method-chip:active{transform:scale(0.95)}
        .method-active{border-color:var(--color-primary);color:var(--color-primary);background:rgba(59,130,246,0.08)}
        .receipt-preview{position:relative;width:100%;max-height:200px;border-radius:var(--radius-md);overflow:hidden}
        .receipt-preview img{width:100%;max-height:200px;object-fit:cover;border-radius:var(--radius-md)}
        .receipt-remove{position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(0,0,0,0.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
        .save-payment-btn{width:100%;padding:0.85rem;font-size:0.95rem}
        .payments-list{display:flex;flex-direction:column;gap:0.6rem;margin-top:0.75rem}
        .payment-card{padding:1rem 1.15rem}
        .payment-top{display:flex;justify-content:space-between;align-items:flex-start}
        .payment-amount{font-size:1.15rem;font-weight:800;margin-right:0.5rem}
        .payment-method{font-size:0.7rem;color:var(--color-text-light-muted);text-transform:uppercase;font-weight:600}
        .payment-date{font-size:0.75rem;color:var(--color-text-light-muted)}
        .payment-note{font-size:0.82rem;color:var(--color-text-light);margin-top:0.35rem}
        .payment-receipt{margin-top:0.5rem;width:100%;max-height:120px;border-radius:var(--radius-sm);overflow:hidden}
        .payment-receipt img{width:100%;max-height:120px;object-fit:cover}
        .payment-delete{display:flex;align-items:center;gap:0.35rem;margin-top:0.5rem;background:none;border:none;color:var(--color-danger,#ef4444);font-size:0.75rem;font-weight:600;cursor:pointer;padding:0.25rem 0;font-family:inherit;opacity:0.7}
      `}</style>
        </div>
    );
}
