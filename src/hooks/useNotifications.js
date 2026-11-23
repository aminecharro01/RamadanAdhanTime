import { useEffect } from 'react';
import { timeOnDate } from '../utils/dateUtils';
import { markSent, showNotification, playAdhan, playChime } from '../services/notifications';
import { useKhatmah } from './useKhatmah';
import { todaysWird, wirdLabel } from '../utils/quranUtils';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const LATE_LIMIT_MS = 5 * 60 * 1000; // skip a notification that would fire more than 5 min late
const HORIZON_MS = 2 * 86400000;

/** Next occurrence of a weekday ("0" = Sunday) at "HH:MM". */
const nextWeekly = (weekday, hhmm, now) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
    if (d <= now) d.setDate(d.getDate() + 7);
    return d;
};

/**
 * Schedules prayer notifications (and the weekly khatmah reminder) for today and tomorrow.
 */
export const useNotifications = ({ settings, today, tomorrow, t, cityName }) => {
    const { progress } = useKhatmah();
    const wirdText = wirdLabel(todaysWird(progress, settings.khatmahDays), t);

    useEffect(() => {
        if (!settings.notificationsEnabled) return;
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const now = new Date();
        const events = [];

        for (const day of [today, tomorrow]) {
            if (!day?.timings) continue;
            for (const p of PRAYERS) {
                if (!settings.notify[p]) continue;
                const at = timeOnDate(day.date, day.timings[p]);
                const name = t[p.toLowerCase()];
                events.push({
                    id: `prayer-${day.date}-${p}`,
                    at,
                    title: `${t.prayerTimeTitle} ${name}`,
                    body: `${name} · ${day.timings[p]}${cityName ? ` · ${cityName}` : ''}`,
                    sound: settings.sound ? playAdhan : null,
                });
                if (settings.reminderMinutes > 0) {
                    events.push({
                        id: `reminder-${day.date}-${p}-${settings.reminderMinutes}`,
                        at: new Date(at.getTime() - settings.reminderMinutes * 60000),
                        title: `${name} ${t.inMinutes.replace('{n}', settings.reminderMinutes)}`,
                        body: `${name} · ${day.timings[p]}`,
                        sound: settings.sound ? playChime : null,
                    });
                }
            }
        }

        const kr = settings.khatmahReminder;
        if (kr?.enabled) {
            const at = nextWeekly(Number(kr.weekday), kr.time, now);
            events.push({
                id: `khatmah-${at.toDateString()}`,
                at,
                title: t.khatmahReminderTitle,
                body: t.khatmahReminderBody,
                sound: settings.sound ? playChime : null,
            });
        }

        const wr = settings.wirdReminder;
        if (wr?.enabled) {
            const [h, m] = wr.time.split(':').map(Number);
            for (const offset of [0, 1]) {
                const at = new Date(now);
                at.setDate(at.getDate() + offset);
                at.setHours(h, m, 0, 0);
                events.push({
                    id: `wird-${at.toDateString()}`,
                    at,
                    title: t.qWirdReminderTitle,
                    body: t.qWirdReminderBody.replace('{wird}', wirdText),
                    sound: settings.sound ? playChime : null,
                });
            }
        }

        const timers = events
            .filter(e => e.at - now > -LATE_LIMIT_MS && e.at - now < HORIZON_MS)
            .map(e => setTimeout(() => {
                if (Date.now() - e.at.getTime() > LATE_LIMIT_MS) return;
                if (!markSent(e.id)) return;
                showNotification(e.title, e.body, e.id);
                e.sound?.();
            }, Math.max(0, e.at - now)));

        return () => timers.forEach(clearTimeout);
    }, [settings, today, tomorrow, t, cityName, wirdText]);
};
