import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

export const DEFAULT_QURAN_PREFS = {
    riwaya: 'hafs',             // 'hafs' | 'warsh'
    font: 'amiri-quran',        // see QURAN_FONTS
    theme: 'dark',              // 'dark' | 'sepia' | 'light'
    fontSize: 32,
    translation: 'none',        // 'none' | 'en' | 'fr'
    reciterId: 'ar.alafasy',
    repeatVerse: 1,
    keepAwake: true,
    mode: 'flow',               // 'flow' (continuous) | 'mushaf' (page by page)
};

export const QURAN_FONTS = {
    'amiri-quran': { label: 'Amiri Quran', css: "'Amiri Quran', 'Amiri', serif" },
    scheherazade: { label: 'Scheherazade New', css: "'Scheherazade New', 'Amiri', serif" },
    naskh: { label: 'Noto Naskh Arabic', css: "'Noto Naskh Arabic', 'Amiri', serif" },
    amiri: { label: 'Amiri', css: "'Amiri', serif" },
};

export const QURAN_THEMES = {
    dark: { page: 'bg-slate-900/95 text-slate-100', card: 'bg-white/5 border-white/10', muted: 'text-white/50', accent: 'text-emerald-400' },
    sepia: { page: 'bg-[#f4ecd8] text-[#3b2f1e]', card: 'bg-[#fbf5e6] border-[#e2d5b5]', muted: 'text-[#7a6a4f]', accent: 'text-[#8a5a14]' },
    light: { page: 'bg-white text-slate-900', card: 'bg-slate-50 border-slate-200', muted: 'text-slate-500', accent: 'text-emerald-700' },
};

export const useQuranPrefs = () => {
    const [prefs, setPrefs] = usePersistentState('adhanTime_quranPrefs_v1', DEFAULT_QURAN_PREFS);
    const update = useCallback((patch) => setPrefs(prev => ({ ...prev, ...patch })), [setPrefs]);
    return [prefs, update];
};

/**
 * Bookmarks / favourites with optional notes: [{ id, type: 'bookmark'|'favorite', s, a, note, createdAt }]
 */
export const useBookmarks = () => {
    const [items, setItems] = usePersistentState('adhanTime_quranBookmarks_v1', []);

    const find = useCallback((type, s, a) => items.find(b => b.type === type && b.s === s && b.a === a), [items]);

    const toggle = useCallback((type, s, a) => setItems(prev => {
        const exists = prev.find(b => b.type === type && b.s === s && b.a === a);
        return exists
            ? prev.filter(b => b !== exists)
            : [{ id: `${type}-${s}-${a}-${Date.now()}`, type, s, a, note: '', createdAt: Date.now() }, ...prev];
    }), [setItems]);

    const setNote = useCallback((type, s, a, note) => setItems(prev => {
        const exists = prev.find(b => b.type === type && b.s === s && b.a === a);
        if (exists) return prev.map(b => (b === exists ? { ...b, note } : b));
        return [{ id: `${type}-${s}-${a}-${Date.now()}`, type, s, a, note, createdAt: Date.now() }, ...prev];
    }), [setItems]);

    const remove = useCallback((id) => setItems(prev => prev.filter(b => b.id !== id)), [setItems]);

    return { items, find, toggle, setNote, remove };
};

/** Memorisation status per surah: { [surahNumber]: 'memorized' | 'learning' | 'review' } */
export const HIFZ_STATUSES = ['memorized', 'learning', 'review'];

export const useHifz = () => {
    const [statuses, setStatuses] = usePersistentState('adhanTime_hifz_v1', {});
    const setStatus = useCallback((surah, status) => setStatuses(prev => {
        const nextState = { ...prev };
        if (!status || prev[surah] === status) delete nextState[surah];
        else nextState[surah] = status;
        return nextState;
    }), [setStatuses]);
    return [statuses, setStatus];
};
