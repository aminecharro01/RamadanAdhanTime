import { format, parse, isAfter, addDays, isBefore } from 'date-fns';

export const formatTime = (time24) => {
    if (!time24) return "";
    // Remove (EST) or timezone info if present
    const cleanTime = time24.split(' ')[0];
    const [hours, minutes] = cleanTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
};

export const getNextPrayer = (timings) => {
    if (!timings) return null;

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();

    // Convert timings to Date objects for today
    const prayerTimes = prayers.map(name => {
        const timeStr = timings[name].split(' ')[0];
        const [hours, minutes] = timeStr.split(':');
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes), 0);
        return { name, time };
    });

    // Find first prayer that is after now
    const next = prayerTimes.find(p => isAfter(p.time, now));

    if (next) {
        return next;
    } else {
        // If no prayer left today, next is Fajr tomorrow
        // For simplicity in this version, we just return Fajr of today as a placeholder 
        // or handle "Tomorrow" logic if we had tomorrow's data. 
        // We will return the first prayer (Fajr) and mark it as 'tomorrow' logic implicitly or explicitly.
        // Since we only fetched today's timings, using today's Fajr as 'next' is technically wrong time-wise,
        // but visually we might just show "Fajr" and let the countdown handle the negative logic or wrapped logic.
        // Ideally we need tomorrow's fajr.
        // For MVP, we'll return null or a specific flag.
        return { ...prayerTimes[0], isTomorrow: true };
    }
};

export const calculateTimeLeft = (targetTime) => {
    const now = new Date();
    let target = new Date(targetTime);

    // If target is before now (meaning it's for tomorrow), add 1 day
    if (isBefore(target, now)) {
        target = addDays(target, 1);
    }

    const difference = target - now;

    if (difference > 0) {
        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return null;
};
