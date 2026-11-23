import { useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { quranTranslations } from '../utils/quranTranslations';

// Built once so `t` keeps the same identity between renders
const merged = {
    en: { ...translations.en, ...quranTranslations.en },
    ar: { ...translations.ar, ...quranTranslations.ar },
};

export const useLanguage = () => {
    const [language, setLanguage] = useState(() => {
        try { return localStorage.getItem('language') || 'en'; } catch { return 'en'; }
    });

    useEffect(() => {
        try { localStorage.setItem('language', language); } catch { /* private mode */ }
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    return {
        language,
        toggleLanguage,
        t: merged[language],
        isRTL: language === 'ar'
    };
};
