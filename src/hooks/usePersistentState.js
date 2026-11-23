import { useState, useEffect, useCallback } from 'react';

const EVENT = 'adhanTime:persistent';

const read = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        const value = JSON.parse(raw);
        return fallback && typeof fallback === 'object' && !Array.isArray(fallback) ? { ...fallback, ...value } : value;
    } catch {
        return fallback;
    }
};

/**
 * useState backed by localStorage and shared live between every component using the same key.
 * `set` accepts a value or an updater function.
 */
export const usePersistentState = (key, fallback) => {
    const [value, setValue] = useState(() => read(key, fallback));

    useEffect(() => {
        const sync = (e) => {
            if (e.type === 'storage' && e.key !== key) return;
            if (e.type === EVENT && e.detail !== key) return;
            setValue(read(key, fallback));
        };
        window.addEventListener(EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(EVENT, sync);
            window.removeEventListener('storage', sync);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback is a constant default
    }, [key]);

    const set = useCallback((next) => {
        const resolved = typeof next === 'function' ? next(read(key, fallback)) : next;
        try { localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* private mode */ }
        setValue(resolved);
        window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [value, set];
};
