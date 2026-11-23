import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'adhanTime_settings_v1';

export const DEFAULT_SETTINGS = {
    use24h: false,
    cityId: 0,                 // 0 = current GPS location
    recentCityIds: [],
    notificationsEnabled: false,
    notify: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    reminderMinutes: 0,        // extra reminder N minutes before each prayer (0 = off)
    sound: true,               // play adhan.mp3 (or a chime) with the notification
    khatmahDays: 30,           // goal: finish the Quran in N days
    khatmahStart: null,        // ISO date the current khatmah goal started
    khatmahReminder: { enabled: false, weekday: 5, time: '20:00' }, // weekday: 0 = Sunday
    wirdReminder: { enabled: false, time: '07:00' },                // daily Quran portion
};

const read = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const d = new Date();
        return {
            ...DEFAULT_SETTINGS,
            // the khatmah goal starts the first time the app is opened
            khatmahStart: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            ...saved,
            notify: { ...DEFAULT_SETTINGS.notify, ...saved.notify },
            khatmahReminder: { ...DEFAULT_SETTINGS.khatmahReminder, ...saved.khatmahReminder },
            wirdReminder: { ...DEFAULT_SETTINGS.wirdReminder, ...saved.wirdReminder },
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const useSettings = () => {
    const [settings, setSettings] = useState(read);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* private mode */ }
    }, [settings]);

    /** update({ use24h: true }) or update(prev => ({ ... })) */
    const update = useCallback((patch) => {
        setSettings(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
    }, []);

    return [settings, update];
};
