// Combines the official Habous timetable with the Aladhan API.
// Habous wins whenever it has the city/day; Aladhan (method 21 = Morocco) is the fallback for
// unpublished months and for locations outside Morocco.
import axios from 'axios';
import { format } from 'date-fns';
import { getHabousTimings, getHabousMonth, getHabousHijri, HIJRI_MONTHS_EN, HIJRI_MONTHS_AR } from './habous';

const ALADHAN = 'https://api.aladhan.com/v1';
export const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const pickTimings = (t) =>
    Object.fromEntries(PRAYER_KEYS.map(k => [k, String(t[k] || '').split(' ')[0]]));

// Aladhan's Hijri date runs one day ahead of the Moroccan calendar; shift it back.
const aladhanHijri = (h) => {
    if (!h) return null;
    const month = Number(h.month?.number);
    const day = Number(h.day) - 1;
    if (!month || day < 1) return null; // day 1 would roll into the previous month: unknown length
    return { day, month, year: Number(h.year), monthEn: HIJRI_MONTHS_EN[month - 1], monthAr: HIJRI_MONTHS_AR[month - 1] };
};

/**
 * Timings + Hijri date for one day.
 * @returns {Promise<{ date: string, timings: object, hijri: object|null, source: 'habous'|'aladhan' }>}
 */
export const getDayTimes = async ({ date, coordinates, habousCityId, signal }) => {
    const [aladhan, habous, hijri] = await Promise.allSettled([
        axios.get(`${ALADHAN}/timings/${format(date, 'dd-MM-yyyy')}`, {
            params: { latitude: coordinates.lat, longitude: coordinates.lng, method: 21 },
            signal,
        }),
        habousCityId ? getHabousTimings(habousCityId, date) : Promise.resolve(null),
        getHabousHijri(date),
    ]);

    const habousTimings = habous.status === 'fulfilled' ? habous.value : null;
    const aladhanData = aladhan.status === 'fulfilled' ? aladhan.value.data.data : null;
    if (!habousTimings && !aladhanData) throw aladhan.reason || new Error('No prayer times available');

    return {
        date: format(date, 'yyyy-MM-dd'),
        timings: habousTimings || pickTimings(aladhanData.timings),
        hijri: (hijri.status === 'fulfilled' && hijri.value) || aladhanHijri(aladhanData?.date?.hijri),
        source: habousTimings ? 'habous' : 'aladhan',
    };
};

/**
 * Timings for every day of a month: { days: [{ day, timings }], source }.
 */
export const getMonthTimes = async ({ year, month, coordinates, habousCityId }) => {
    if (habousCityId) {
        const days = await getHabousMonth(habousCityId, year, month).catch(() => null);
        if (days) return { days, source: 'habous' };
    }
    const res = await axios.get(`${ALADHAN}/calendar/${year}/${month}`, {
        params: { latitude: coordinates.lat, longitude: coordinates.lng, method: 21 },
    });
    return {
        days: res.data.data.map((d, i) => ({ day: i + 1, timings: pickTimings(d.timings) })),
        source: 'aladhan',
    };
};
