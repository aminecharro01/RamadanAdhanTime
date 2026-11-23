// Local notifications for prayer times.
//
// Web pages cannot schedule notifications for when they are closed (that needs a push server),
// so these fire while the app is open, including as an installed PWA or a background tab.

const SENT_KEY = 'adhanTime_sentNotifications_v1';

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const requestPermission = async () => {
    if (!notificationsSupported()) return 'unsupported';
    if (Notification.permission !== 'default') return Notification.permission;
    return Notification.requestPermission();
};

/** Remembers which notifications were shown so a reload does not repeat them. */
export const markSent = (id) => {
    try {
        const sent = JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
        if (sent[id]) return false;
        const cutoff = Date.now() - 3 * 86400000;
        for (const [k, ts] of Object.entries(sent)) if (ts < cutoff) delete sent[k];
        sent[id] = Date.now();
        localStorage.setItem(SENT_KEY, JSON.stringify(sent));
        return true;
    } catch {
        return true;
    }
};

export const showNotification = async (title, body, tag) => {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;
    const options = { body, tag, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png' };
    try {
        // Android Chrome only allows notifications from the service worker.
        const reg = await navigator.serviceWorker?.getRegistration?.();
        if (reg) return reg.showNotification(title, options);
    } catch { /* fall through */ }
    try { new Notification(title, options); } catch { /* not allowed in this context */ }
};

// A soft two-tone chime made with Web Audio (used when no adhan file is available).
export const playChime = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [[660, 0], [880, 0.35], [660, 0.7]].forEach(([freq, start]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 1.2);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + 1.3);
        });
        setTimeout(() => ctx.close(), 2500);
    } catch { /* audio blocked */ }
};

let currentAdhan = null;

/** Plays /adhan.mp3 when the project provides one (public/adhan.mp3), otherwise a chime. */
export const playAdhan = () => {
    try {
        currentAdhan?.pause();
        currentAdhan = new Audio('/adhan.mp3');
        currentAdhan.addEventListener('error', playChime, { once: true });
        currentAdhan.play().catch(playChime);
    } catch {
        playChime();
    }
};

export const stopAdhan = () => {
    currentAdhan?.pause();
    currentAdhan = null;
};
