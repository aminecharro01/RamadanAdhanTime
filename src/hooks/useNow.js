import { useState, useEffect } from 'react';

/**
 * Current time, refreshed every `intervalMs` and immediately when the tab becomes visible
 * again (timers are throttled in background tabs, so a page left open overnight catches up).
 */
export const useNow = (intervalMs = 15000) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const tick = () => setNow(new Date());
        const id = setInterval(tick, intervalMs);
        const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', tick);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', tick);
        };
    }, [intervalMs]);

    return now;
};
