import React, { useState, useEffect, useRef } from 'react';
import { getNotes, saveNote, deleteNote } from '../utils/storage';
import { Mic, MicOff, Plus, Trash2, X } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import { t } from '../utils/i18n';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const { uiLang } = useLanguage();

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('speechNotSupported', uiLang));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = uiLang === 'es' ? 'es-US' : 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    const note = saveNote({ text: text.trim() });
    if (note) {
      setNotes(getNotes());
      setText('');
      setShowComposer(false);
    }
  };

  const handleDelete = (id) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(uiLang === 'es' ? 'es-US' : 'en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="animate-fade-in notes-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="step-title" style={{ marginBottom: '0.15rem' }}>{t('notes', uiLang)}</h2>
          <p className="step-subtitle" style={{ marginBottom: 0 }}>{t('recordAnything', uiLang)}</p>
        </div>
      </div>

      {/* Composer */}
      {showComposer ? (
        <div className="glass-panel composer animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700 }}>{t('newNote', uiLang)}</span>
            <button className="icon-btn" onClick={() => { setShowComposer(false); setText(''); stopRecording(); }} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <textarea
            className="input-field note-textarea"
            placeholder={t('typeOrSpeak', uiLang)}
            aria-label={t('typeOrSpeak', uiLang)}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
          />

          <div className="composer-actions">
            <button
              className={`mic-btn ${isRecording ? 'mic-recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              aria-pressed={isRecording}
            >
              {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
              {isRecording ? t('stop', uiLang) : t('speak', uiLang)}
            </button>

            <button className="btn btn-primary" style={{ flex: 1, padding: '0.85rem' }} onClick={handleSave} disabled={!text.trim()}>
              {t('saveNote', uiLang)}
            </button>
          </div>
        </div>
      ) : (
        <button className="add-note-btn" onClick={() => setShowComposer(true)}>
          <Plus size={24} />
          <span>{t('newNote', uiLang)}</span>
        </button>
      )}

      {/* Notes list */}
      <div className="notes-list">
        {notes.length === 0 && !showComposer && (
          <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', opacity: 0.7 }}>
            <p style={{ color: 'var(--color-text-light-muted)', margin: 0 }}>{t('noNotesYet', uiLang)}</p>
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className="glass-panel note-card">
            <p className="note-text">{note.text}</p>
            <div className="note-footer">
              <span className="note-date">{formatDate(note.timestamp)}</span>
              <button className="icon-btn delete-btn" onClick={() => handleDelete(note.id)} aria-label="Delete note">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .notes-page {
          padding-bottom: 2rem;
        }
        .add-note-btn {
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
          margin-bottom: 1.25rem;
        }
        .add-note-btn:active {
          transform: scale(0.98);
          border-color: var(--color-primary);
        }
        .composer {
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .note-textarea {
          resize: none;
          min-height: 120px;
          font-size: 1rem;
          line-height: 1.6;
        }
        .composer-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .mic-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--color-border);
          background: var(--color-surface-light);
          color: var(--color-text-light);
          font-weight: 600;
          font-family: inherit;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .mic-btn:active {
          transform: scale(0.95);
        }
        .mic-recording {
          border-color: var(--color-danger);
          color: var(--color-danger);
          animation: pulse-rec 1.5s infinite;
        }
        @keyframes pulse-rec {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
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
          transition: all var(--transition-fast);
        }
        .icon-btn:active {
          transform: scale(0.9);
        }
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .note-card {
          padding: 1rem 1.25rem;
        }
        .note-text {
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-wrap;
          margin-bottom: 0.75rem;
        }
        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .note-date {
          font-size: 0.75rem;
          color: var(--color-text-light-muted);
        }
        .delete-btn {
          color: var(--color-text-light-muted);
        }
        .delete-btn:hover {
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}
