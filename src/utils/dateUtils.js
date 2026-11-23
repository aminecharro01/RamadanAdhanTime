// Times are kept as "HH:MM" strings from the API and turned into Date objects on a given day.
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** "2026-11-23" + "05:34" -> Date (local time). */
export const timeOnDate = (dateStr, hhmm) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = String(hhmm).split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
};

/** "05:34" -> "5:34 AM" (12h) or "05:34" (24h). Digits always stay 0-9. */
export const formatTime = (hhmm, use24h = false) => {
    if (!hhmm) return '';
    const [h, m] = String(hhmm).split(' ')[0].split(':').map(Number);
    const mm = String(m).padStart(2, '0');
    if (use24h) return `${String(h).padStart(2, '0')}:${mm}`;
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${mm} ${suffix}`;
};

/**
 * Works out where `now` sits in the day.
 * @param today    { date: 'yyyy-MM-dd', timings }
 * @param tomorrow { date, timings } | null   (needed after Isha)
 * @returns {{ next: {name, time: Date, isTomorrow}|null, current: string|null, times: Record<string, Date> }}
 *   current = prayer whose time is running (Fajr ends at Sunrise; none between Sunrise and Dhuhr).
 */
export const getPrayerSchedule = (today, tomorrow, now = new Date()) => {
    if (!today?.timings) return { next: null, current: null, times: {} };

    const times = {};
    for (const key of [...PRAYERS, 'Sunrise']) {
        times[key] = timeOnDate(today.date, today.timings[key]);
    }

    let next = null;
    const upcoming = PRAYERS.find(p => times[p] > now);
    if (upcoming) {
        next = { name: upcoming, time: times[upcoming], isTomorrow: false };
    } else if (tomorrow?.timings) {
        next = { name: 'Fajr', time: timeOnDate(tomorrow.date, tomorrow.timings.Fajr), isTomorrow: true };
    }

    let current = null;
    const started = PRAYERS.filter(p => times[p] <= now);
    const last = started[started.length - 1];
    if (last && !(last === 'Fajr' && now >= times.Sunrise)) current = last;

    return { next, current, times };
};

/** Time left until a Date: { hours, minutes, seconds } or null once it has passed. */
export const calculateTimeLeft = (target) => {
    const difference = new Date(target) - new Date();
    if (!(difference > 0)) return null;
    return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

export const toDateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
