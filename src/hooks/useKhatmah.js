import { useCallback } from 'react';
import { getProgressPercentage, getAbsoluteAyahNumber } from '../utils/quranUtils';
import { usePersistentState } from './usePersistentState';
import { toDateKey } from '../utils/dateUtils';

const PROGRESS_KEY = 'adhanTime_khatmah_v2';
const LOG_KEY = 'adhanTime_readingLog_v1';
const DEFAULT_PROGRESS = { sura: 1, ayah: 1, page: 1, hq: 1, timestamp: 0 };

/**
 * Reading position (shared by the reader and the tracker card) plus a daily reading log:
 * log[yyyy-MM-dd] = { startN, endN, startPage, endPage, startHq, endHq }.
 */
export const useKhatmah = () => {
    const [progress, setProgress] = usePersistentState(PROGRESS_KEY, DEFAULT_PROGRESS);
    const [log, setLog] = usePersistentState(LOG_KEY, {});

    /** Marks where the reader stopped. `extra` = { page, hq } when known (from Quran meta). */
    const saveProgress = useCallback((sura, ayah, extra = {}) => {
        const n = getAbsoluteAyahNumber(sura, ayah);
        setProgress(prev => {
            const prevN = getAbsoluteAyahNumber(prev.sura || 1, prev.ayah || 1);
            const today = toDateKey(new Date());
            setLog(l => {
                const entry = l[today] || {
                    startN: prevN,
                    startPage: prev.page || extra.page || 1,
                    startHq: prev.hq || extra.hq || 1,
                };
                const next = { ...l, [today]: { ...entry, endN: n, endPage: extra.page ?? entry.startPage, endHq: extra.hq ?? entry.startHq } };
                // keep the last 120 days
                const keys = Object.keys(next).sort();
                for (const k of keys.slice(0, Math.max(0, keys.length - 120))) delete next[k];
                return next;
            });
            return { sura, ayah, page: extra.page ?? prev.page, hq: extra.hq ?? prev.hq, timestamp: Date.now() };
        });
    }, [setProgress, setLog]);

    const percentage = getProgressPercentage(progress.sura, progress.ayah);

    // Pages read today (moving forward only)
    const todayEntry = log[toDateKey(new Date())];
    const pagesToday = todayEntry ? Math.max(0, (todayEntry.endPage || 0) - (todayEntry.startPage || 0)) : 0;

    // Streak: consecutive days with reading, counting back from today (or yesterday)
    let streak = 0;
    const d = new Date();
    if (!log[toDateKey(d)]) d.setDate(d.getDate() - 1);
    while (log[toDateKey(d)]) {
        streak += 1;
        d.setDate(d.getDate() - 1);
    }

    return { progress, saveProgress, percentage, log, pagesToday, streak };
};
