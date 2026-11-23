import { useState, useEffect } from 'react';
import { loadMeta, loadText } from '../services/quranData';

/**
 * Quran structure + the selected riwaya text + optional translation.
 * Everything comes from IndexedDB after the first download.
 */
export const useQuranData = (riwaya, translation) => {
    const [attempt, setAttempt] = useState(0);
    const key = `${riwaya}|${translation}|${attempt}`;
    const [result, setResult] = useState(null); // { key, meta, text, translation, error }

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            loadMeta(),
            loadText(riwaya),
            translation && translation !== 'none' ? loadText(translation).catch(() => null) : Promise.resolve(null),
        ])
            .then(([meta, text, tr]) => {
                if (!cancelled) setResult({ key, meta, text: text.text, translation: tr?.text || null, error: null });
            })
            .catch((error) => { if (!cancelled) setResult({ key, error }); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- key covers the inputs
    }, [key]);

    const fresh = result?.key === key ? result : null;
    // Keep showing the previous data while switching riwaya/translation
    const shown = fresh?.meta ? fresh : (result?.meta ? result : null);

    return {
        meta: shown?.meta || null,
        text: shown?.text || null,
        translation: shown?.translation || null,
        loading: !fresh,
        error: fresh?.error || null,
        retry: () => setAttempt(a => a + 1),
    };
};
