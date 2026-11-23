// Official data published by the Moroccan Ministry of Habous and Islamic Affairs (habous.gov.ma).
//
// Prayer times: one file per month at /data/horaires-YYYY-MM.js, which does
//   (window.HORAIRES_MOIS = window.HORAIRES_MOIS || []).push({ annee, mois, cols, villes })
// where every ville is { c: cityId, n: arabicName, h: [[Fajr, Chorouq, Dhuhr, Asr, Maghrib, Ishae], ...one row per day] }.
// Only the current (and previous) month is online, so callers must fall back to another source.
//
// Hijri calendar: /data/hijri.js sets window.HIJRI = { mois: [{ debut: 'YYYY-MM-DD', mois, annee, duree }] }
// with the month starts announced by the ministry (crescent sighting). duree is null for the running month.
//
// The server sends no CORS headers, so the files cannot be fetch()ed; they are loaded as <script> tags.

const BASE_URL = 'https://www.habous.gov.ma/data';
const TIMEOUT_MS = 10000;
const COLS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const HIJRI_MONTHS_EN = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir', 'Jumada al-Ula', 'Jumada al-Akhirah',
    'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];
export const HIJRI_MONTHS_AR = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const scriptCache = new Map(); // url -> Promise<boolean>

/** Loads a script once. Failed loads are forgotten so a later call can retry (e.g. a file published later). */
const loadScript = (url) => {
    if (scriptCache.has(url)) return scriptCache.get(url);

    const promise = new Promise((resolve) => {
        const script = document.createElement('script');
        let timer;
        const done = (ok) => {
            clearTimeout(timer);
            script.remove();
            if (!ok) scriptCache.delete(url);
            resolve(ok);
        };
        script.src = url;
        script.async = true;
        script.onload = () => done(true);
        script.onerror = () => done(false);
        timer = setTimeout(() => done(false), TIMEOUT_MS);
        document.head.appendChild(script);
    });

    scriptCache.set(url, promise);
    return promise;
};

const findMonth = (year, month) =>
    (window.HORAIRES_MOIS || []).find(m => m.annee === year && m.mois === month) || null;

const loadMonth = async (year, month) => {
    if (findMonth(year, month)) return findMonth(year, month);
    const key = `${year}-${String(month).padStart(2, '0')}`;
    await loadScript(`${BASE_URL}/horaires-${key}.js`);
    return findMonth(year, month);
};

const rowToTimings = (row) =>
    row && row.length >= COLS.length ? Object.fromEntries(COLS.map((name, i) => [name, row[i]])) : null;

/**
 * Official timings for a Habous city on a date, shaped like Aladhan's `timings`
 * ({ Fajr: "05:34", Sunrise, Dhuhr, Asr, Maghrib, Isha }), or null when unavailable.
 */
export const getHabousTimings = async (cityId, date = new Date()) => {
    const data = await loadMonth(date.getFullYear(), date.getMonth() + 1);
    const city = data?.villes?.find(v => v.c === cityId);
    return rowToTimings(city?.h?.[date.getDate() - 1]);
};

/** All days of a month for a Habous city: [{ day, timings }], or null when the month is not published. */
export const getHabousMonth = async (cityId, year, month) => {
    const data = await loadMonth(year, month);
    const city = data?.villes?.find(v => v.c === cityId);
    if (!city) return null;
    return city.h.map((row, i) => ({ day: i + 1, timings: rowToTimings(row) }));
};

const toUtcDay = (y, m, d) => Date.UTC(y, m - 1, d) / 86400000;

/**
 * Official Hijri date for a Gregorian date, from the ministry's announced month starts.
 * Returns { day, month (1-12), year, monthEn, monthAr } or null when the date is not covered.
 */
export const getHabousHijri = async (date = new Date()) => {
    if (!window.HIJRI) await loadScript(`${BASE_URL}/hijri.js`);
    const months = window.HIJRI?.mois;
    if (!Array.isArray(months)) return null;

    const target = toUtcDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    for (const m of months) {
        const [y, mo, d] = m.debut.split('-').map(Number);
        const offset = target - toUtcDay(y, mo, d);
        // A running month (duree null) lasts at most 30 days.
        if (offset >= 0 && offset < (m.duree || 30)) {
            return {
                day: offset + 1,
                month: m.mois,
                year: m.annee,
                monthEn: HIJRI_MONTHS_EN[m.mois - 1],
                monthAr: HIJRI_MONTHS_AR[m.mois - 1],
            };
        }
    }
    return null;
};
