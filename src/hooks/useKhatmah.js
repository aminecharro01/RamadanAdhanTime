import { useState, useEffect } from 'react';
import { getProgressPercentage } from '../utils/quranUtils';

const STORAGE_KEY = 'adhanTime_khatmah_v2';

export const useKhatmah = () => {
    const [progress, setProgress] = useState({
        sura: 1,
        ayah: 1,
        timestamp: Date.now()
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved khatmah progress", e);
            }
        }
    }, []);

    const saveProgress = (sura, ayah) => {
        const newProgress = {
            sura,
            ayah,
            timestamp: Date.now()
        };
        setProgress(newProgress);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    };

    const percentage = getProgressPercentage(progress.sura, progress.ayah);

    return {
        progress,
        saveProgress,
        percentage
    };
};
