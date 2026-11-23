// Quran fonts are only needed in the reader, so they are fetched on first use.
const QURAN_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Noto+Naskh+Arabic:wght@400;600&family=Scheherazade+New:wght@400;700&display=swap';

let loaded = false;

export const ensureQuranFonts = () => {
    if (loaded || typeof document === 'undefined') return;
    loaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = QURAN_FONTS_URL;
    document.head.appendChild(link);
};
