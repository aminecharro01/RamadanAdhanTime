import { useState, useEffect } from 'react';
import axios from 'axios';
import { addDays } from 'date-fns';
import { getDayTimes } from '../services/prayerTimes';

const CACHE_KEY = 'adhanTime_lastTimes_v1';

const readCache = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; } catch { return null; }
};

const writeCache = (value) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch { /* private mode */ }
};

/** Cached days for this location, re-based on `dateKey` (yesterday's "tomorrow" is today's "today"). */
const fromCache = (locationKey, dateKey) => {
    const c = readCache();
    if (!c || c.locationKey !== locationKey) return null;
    if (c.today?.date === dateKey) return { today: c.today, tomorrow: c.tomorrow };
    if (c.tomorrow?.date === dateKey) return { today: c.tomorrow, tomorrow: null };
    return null;
};

/**
 * Prayer times for today and tomorrow (tomorrow is needed for the countdown after Isha).
 * Re-fetches whenever `dateKey` changes, so a page left open past midnight moves to the new day.
 * Shows the last saved times for this place immediately while fresh data loads.
 *
 * @param coordinates  { lat, lng }
 * @param habousCityId official Habous city id, or null to use calculated times only
 * @param dateKey      'yyyy-MM-dd' of the current local day
 */
export const usePrayerTimes = (coordinates, habousCityId, dateKey) => {
    const hasLocation = Boolean(coordinates.lat && coordinates.lng);
    const locationKey = `${coordinates.lat},${coordinates.lng},${habousCityId ?? ''}`;
    const requestKey = `${locationKey}|${dateKey}`;

    const [result, setResult] = useState(null); // { requestKey, today, tomorrow, error }

    useEffect(() => {
        if (!hasLocation) return;
        const controller = new AbortController();
        const [y, m, d] = dateKey.split('-').map(Number);
        const todayDate = new Date(y, m - 1, d);
        const args = { coordinates, habousCityId, signal: controller.signal };

        Promise.allSettled([
            getDayTimes({ ...args, date: todayDate }),
            getDayTimes({ ...args, date: addDays(todayDate, 1) }),
        ]).then(([today, tomorrow]) => {
            if (controller.signal.aborted) return;
            if (today.status === 'rejected') {
                if (axios.isCancel(today.reason)) return;
                setResult({ requestKey, today: null, tomorrow: null, error: today.reason });
                return;
            }
            const value = {
                requestKey,
                today: today.value,
                tomorrow: tomorrow.status === 'fulfilled' ? tomorrow.value : null,
                error: null,
            };
            setResult(value);
            writeCache({ locationKey, today: value.today, tomorrow: value.tomorrow });
        });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey captures coordinates/city/date
    }, [requestKey, hasLocation]);

    const fresh = result?.requestKey === requestKey ? result : null;
    const cached = fresh ? null : fromCache(locationKey, dateKey);
    const shown = fresh?.today ? fresh : cached;

    return {
        today: shown?.today ?? null,
        tomorrow: shown?.tomorrow ?? null,
        loading: hasLocation && !fresh,
        error: fresh?.error ?? null,
    };
};
