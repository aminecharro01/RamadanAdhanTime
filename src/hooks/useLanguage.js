import { useState, useEffect } from 'react';
import { translations } from '../utils/translations';

export const useLanguage = () => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    return {
        language,
        toggleLanguage,
        t: translations[language],
        isRTL: language === 'ar'
    };
};
