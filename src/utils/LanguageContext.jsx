import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings } from './storage';

const LanguageContext = createContext({
    uiLang: 'en',
    messageLang: 'en',
    setUiLang: () => { },
    setMessageLang: () => { },
});

export function LanguageProvider({ children }) {
    const [uiLang, setUiLangState] = useState('en');
    const [messageLang, setMessageLangState] = useState('en');

    useEffect(() => {
        const s = getSettings();
        if (s.uiLang) setUiLangState(s.uiLang);
        if (s.messageLang) setMessageLangState(s.messageLang);
    }, []);

    const setUiLang = (lang) => {
        setUiLangState(lang);
        saveSettings({ uiLang: lang });
    };

    const setMessageLang = (lang) => {
        setMessageLangState(lang);
        saveSettings({ messageLang: lang });
    };

    return (
        <LanguageContext.Provider value={{ uiLang, messageLang, setUiLang, setMessageLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
