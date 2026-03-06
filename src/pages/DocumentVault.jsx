import React, { useState, useEffect, useRef } from 'react';
import { getVaultItems, saveVaultItem, deleteVaultItem } from '../utils/storage';
import { FolderOpen, Upload, Trash2, FileText, Image as ImageIcon, File, X } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

const CATEGORY_KEYS = [
  { id: 'lease', key: 'leaseContract', icon: '📄' },
  { id: 'receipts', key: 'receipts', icon: '🧾' },
  { id: 'correspondence', key: 'lettersEmails', icon: '✉️' },
  { id: 'images', key: 'imagesVideos', icon: '🖼️' },
  { id: 'other', key: 'other', icon: '📁' },
];

export default function DocumentVault() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const fileInputRef = useRef(null);
  const { uiLang } = useLanguage();

  useEffect(() => {
    setItems(getVaultItems());
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const item = saveVaultItem({
          name: file.name,
          type: file.type,
          size: file.size,
          category: activeCategory,
          dataUrl: reader.result,
        });
        if (item) setItems(getVaultItems());
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id) => {
    deleteVaultItem(id);
    setItems(getVaultItems());
  };

  const categoryItems = activeCategory
    ? items.filter(i => i.category === activeCategory || (activeCategory === 'images' && i.category === 'walkthrough'))
    : [];

  const getCategoryCount = (catId) => items.filter(i => i.category === catId || (catId === 'images' && i.category === 'walkthrough')).length;

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
      month: 'short', day: 'numeric',
    }).format(d);
  };

  const isImage = (type) => type && type.startsWith('image/');

  // Category grid view
  if (!activeCategory) {
    return (
      <div className="animate-fade-in vault-page">
        <h2 className="step-title">{t('documentVaultTitle', uiLang)}</h2>
        <p className="step-subtitle">{t('keepFilesOrganized', uiLang)}</p>

        <div className="vault-grid">
          {CATEGORY_KEYS.map(cat => (
            <button
              key={cat.id}
              className="vault-folder glass-panel"
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="vault-folder-icon">{cat.icon}</span>
              <span className="vault-folder-label">{t(cat.key, uiLang)}</span>
              <span className="vault-folder-count">{getCategoryCount(cat.id)} {t('items', uiLang)}</span>
            </button>
          ))}
        </div>

        <style>{vaultStyles}</style>
      </div>
    );
  }

  // Category detail view
  const activeCat = CATEGORY_KEYS.find(c => c.id === activeCategory);

  return (
    <div className="animate-fade-in vault-page">
      <button className="vault-back-btn" onClick={() => setActiveCategory(null)}>
        {t('backToFolders', uiLang)}
      </button>
      <h2 className="step-title">{activeCat?.icon} {t(activeCat?.key, uiLang)}</h2>

      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
        <Upload size={22} />
        <span>{t('uploadFileOrPhoto', uiLang)}</span>
      </button>

      {categoryItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', opacity: 0.7 }}>
          <FolderOpen size={40} style={{ color: 'var(--color-text-light-muted)', marginBottom: '0.75rem' }} aria-hidden="true" />
          <p style={{ color: 'var(--color-text-light-muted)', margin: 0 }}>{t('noFilesYet', uiLang)}</p>
        </div>
      ) : (
        <div className="vault-files">
          {categoryItems.map(item => (
            <div key={item.id} className="glass-panel vault-file-card">
              {isImage(item.type) ? (
                <div className="vault-thumb-wrap">
                  <img src={item.dataUrl} alt={item.name} className="vault-thumb" />
                </div>
              ) : (
                <div className="vault-file-icon">
                  {item.type?.includes('pdf') ? <FileText size={28} /> : <File size={28} />}
                </div>
              )}
              <div className="vault-file-info">
                <span className="vault-file-name">{item.name}</span>
                <span className="vault-file-meta">{formatSize(item.size)} · {formatDate(item.timestamp)}</span>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(item.id)} aria-label="Delete file">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{vaultStyles}</style>
    </div>
  );
}

const vaultStyles = `
  .vault-page {
    padding-bottom: 2rem;
  }
  .vault-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .vault-folder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1.25rem 0.75rem;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all var(--transition-fast);
    color: var(--color-text-light);
  }
  .vault-folder:active {
    transform: scale(0.96);
  }
  .vault-folder-icon {
    font-size: 2rem;
    line-height: 1;
    margin-bottom: 0.25rem;
  }
  .vault-folder-label {
    font-weight: 600;
    font-size: 0.85rem;
    text-align: center;
  }
  .vault-folder-count {
    font-size: 0.7rem;
    color: var(--color-text-light-muted);
  }
  .vault-back-btn {
    display: inline-block;
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-primary);
    cursor: pointer;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
  }
  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin-bottom: 1rem;
  }
  .upload-btn:active {
    transform: scale(0.98);
    border-color: var(--color-primary);
  }
  .vault-files {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .vault-file-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .vault-thumb-wrap {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .vault-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .vault-file-icon {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59,130,246,0.08);
    border-radius: var(--radius-sm);
    color: var(--color-primary);
  }
  .vault-file-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .vault-file-name {
    font-weight: 600;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .vault-file-meta {
    font-size: 0.7rem;
    color: var(--color-text-light-muted);
  }
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--color-text-light-muted);
    border-radius: var(--radius-sm);
    cursor: pointer;
    flex-shrink: 0;
  }
  .icon-btn:active {
    transform: scale(0.9);
  }
`;
