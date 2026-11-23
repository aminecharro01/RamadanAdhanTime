// Quran data: whole editions are downloaded once, kept in memory and in IndexedDB (offline use).
//
// All editions share the Hafs/Uthmanic verse numbering, so every text is an array of 6236
// strings indexed by absolute verse number - 1.
//   - meta (surahs, juz, page, hizb quarter, sajda) + Hafs text: alquran.cloud "quran-uthmani"
//   - Warsh text: King Fahd Complex text via fawazahmed0/quran-api (renumbered to Uthmanic numbering)
//   - search text (no diacritics), translations and tafsir: alquran.cloud
import axios from 'axios';
import { idbGet, idbSet } from './idb';

const ALQURAN = 'https://api.alquran.cloud/v1/quran';
const CACHE_VERSION = 1;

export const TEXT_EDITIONS = {
    hafs: { label: 'Hafs', url: `${ALQURAN}/quran-uthmani`, kind: 'alquran', sizeKb: 400 },
    warsh: { label: 'Warsh', url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh.min.json', kind: 'fawaz', sizeKb: 290 },
    search: { label: 'Search index', url: `${ALQURAN}/quran-simple-clean`, kind: 'alquran', sizeKb: 290 },
    en: { label: 'English · Saheeh International', url: `${ALQURAN}/en.sahih`, kind: 'alquran', sizeKb: 360 },
    fr: { label: 'Français · Hamidullah', url: `${ALQURAN}/fr.hamidullah`, kind: 'alquran', sizeKb: 395 },
    tafsir: { label: 'التفسير الميسر', url: `${ALQURAN}/ar.muyassar`, kind: 'alquran', sizeKb: 655 },
};

const BASMALA_PREFIX = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/;
const memory = new Map(); // key -> Promise<value>

const cached = (key, loader) => {
    if (memory.has(key)) return memory.get(key);
    const p = (async () => {
        const stored = await idbGet(`${key}@${CACHE_VERSION}`);
        if (stored) return stored;
        const value = await loader();
        await idbSet(`${key}@${CACHE_VERSION}`, value);
        return value;
    })();
    p.catch(() => memory.delete(key)); // allow retry after a network error
    memory.set(key, p);
    return p;
};

const fetchAlquran = async (url) => (await axios.get(url)).data.data.surahs;

const hafsText = (surahs) => surahs.flatMap(s => s.ayahs.map(a => {
    const t = a.text.replace(/^\uFEFF/, '');
    // Verse 1 of each surah (except Al-Fatiha and At-Tawbah) starts with the basmala in this edition
    return a.numberInSurah === 1 && s.number !== 1 && s.number !== 9 ? t.replace(BASMALA_PREFIX, '') : t;
}));

/**
 * Quran structure built from the Hafs Uthmani edition (the Hafs text is stored from the same download).
 * @returns {{ surahs: Array, verses: Array<{ n, s, a, juz, page, hq, sajda }> }}
 */
export const loadMeta = () => cached('quran-meta', async () => {
    const surahs = await fetchAlquran(TEXT_EDITIONS.hafs.url);
    const verses = surahs.flatMap(s => s.ayahs.map(a => ({
        n: a.number, s: s.number, a: a.numberInSurah, juz: a.juz, page: a.page, hq: a.hizbQuarter, sajda: Boolean(a.sajda),
    })));
    const hafs = { text: hafsText(surahs) };
    if (!memory.has('text-hafs')) memory.set('text-hafs', Promise.resolve(hafs));
    await idbSet(`text-hafs@${CACHE_VERSION}`, hafs);
    return {
        verses,
        surahs: surahs.map(s => ({
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            englishNameTranslation: s.englishNameTranslation,
            revelationType: s.revelationType,
            count: s.ayahs.length,
            start: s.ayahs[0].number,
        })),
    };
});

/** A text edition as { text: string[6236] }. */
export const loadText = (id) => {
    const ed = TEXT_EDITIONS[id];
    if (!ed) return Promise.reject(new Error(`Unknown edition ${id}`));
    return cached(`text-${id}`, async () => {
        if (ed.kind === 'fawaz') {
            const res = await axios.get(ed.url);
            return { text: res.data.quran.map(v => v.text) };
        }
        const surahs = await fetchAlquran(ed.url);
        if (id === 'hafs') return { text: hafsText(surahs) };
        return { text: surahs.flatMap(s => s.ayahs.map(a => a.text.replace(/^\uFEFF/, ''))) };
    });
};

/** Whether an edition is stored for offline use. */
export const isStored = async (id) => {
    return Boolean(await idbGet(`text-${id}@${CACHE_VERSION}`));
};

// ---- Navigation helpers -------------------------------------------------------------------

export const hizbOf = (hq) => Math.ceil(hq / 4);           // 1..60
export const quarterInHizb = (hq) => ((hq - 1) % 4) + 1;    // 1..4

/** Verses for a reading selection: { type: 'surah'|'juz'|'hizb'|'page', value } */
export const versesFor = (meta, sel) => {
    switch (sel.type) {
        case 'surah': return meta.verses.filter(v => v.s === sel.value);
        case 'juz': return meta.verses.filter(v => v.juz === sel.value);
        case 'hizb': return meta.verses.filter(v => hizbOf(v.hq) === sel.value);
        case 'page': return meta.verses.filter(v => v.page === sel.value);
        default: return [];
    }
};

export const SELECTION_LIMITS = { surah: 114, juz: 30, hizb: 60, page: 604 };

/** First verse of each juz / hizb (for the index lists). */
export const firstVerses = (meta, type) => {
    const seen = new Map();
    for (const v of meta.verses) {
        const key = type === 'juz' ? v.juz : hizbOf(v.hq);
        if (!seen.has(key)) seen.set(key, v);
    }
    return [...seen.entries()].map(([value, v]) => ({ value, verse: v }));
};

/** Human title for a selection. */
export const selectionTitle = (sel, meta, t, language) => {
    if (!sel || !meta) return '';
    if (sel.type === 'surah') {
        const s = meta.surahs[sel.value - 1];
        return language === 'ar' ? s.name : `${s.number}. ${s.englishName}`;
    }
    const label = { juz: t.qJuz, hizb: t.qHizb, page: t.qPage }[sel.type];
    return `${label} ${sel.value}`;
};

// ---- Search -------------------------------------------------------------------------------

export const normalizeArabic = (s) => String(s || '')
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿـ]/g, '')
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeLatin = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

let searchIndexPromise = null;
const getSearchIndex = () => {
    if (!searchIndexPromise) {
        searchIndexPromise = loadText('search').then(({ text }) => text.map(normalizeArabic));
        searchIndexPromise.catch(() => { searchIndexPromise = null; });
    }
    return searchIndexPromise;
};

/**
 * Searches verse text (Arabic, with or without diacritics) and, when given, a translation.
 * "2:255" or "2 255" jumps to a reference.
 * @returns {Promise<Array<{ n, s, a }>>} up to `limit` verses
 */
export const searchQuran = async (meta, query, { translation = null, limit = 100 } = {}) => {
    const q = query.trim();
    if (!q) return [];

    const ref = q.match(/^(\d{1,3})\s*[:\s.]\s*(\d{1,3})$/);
    if (ref) {
        const v = meta.verses.find(x => x.s === Number(ref[1]) && x.a === Number(ref[2]));
        return v ? [v] : [];
    }

    const isArabic = /[؀-ۿ]/.test(q);
    const results = [];
    if (isArabic) {
        const needle = normalizeArabic(q);
        if (needle.length < 2) return [];
        const index = await getSearchIndex();
        for (let i = 0; i < index.length && results.length < limit; i++) {
            if (index[i].includes(needle)) results.push(meta.verses[i]);
        }
    } else if (translation) {
        const needle = normalizeLatin(q);
        if (needle.length < 3) return [];
        const { text } = await loadText(translation);
        for (let i = 0; i < text.length && results.length < limit; i++) {
            if (normalizeLatin(text[i]).includes(needle)) results.push(meta.verses[i]);
        }
    }
    return results;
};
