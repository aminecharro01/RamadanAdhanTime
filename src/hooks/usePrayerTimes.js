import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export const usePrayerTimes = (coordinates) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!coordinates.lat || !coordinates.lng) return;

        const controller = new AbortController();

        const fetchPrayerTimes = async () => {
            setLoading(true);
            try {
                // Get current date in DD-MM-YYYY format
                const date = format(new Date(), 'dd-MM-yyyy');
                const response = await axios.get(`https://api.aladhan.com/v1/timings/${date}`, {
                    params: {
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        method: 21, // Morocco (Ministry of Habous and Islamic Affairs)
                        adjustment: -2, // Adjust Hijri date by -2 days for Morocco
                    },
                    signal: controller.signal
                });
                setData(response.data.data);
                setError(null);
            } catch (err) {
                if (axios.isCancel(err)) return;
                setError(err);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchPrayerTimes();

        return () => controller.abort();
    }, [coordinates.lat, coordinates.lng]);

    return { data, loading, error };
};
