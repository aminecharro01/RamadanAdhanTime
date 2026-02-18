import { useState, useEffect } from 'react';
import axios from 'axios';

export const useQuran = () => {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch list of Surahs only once
    useEffect(() => {
        const fetchSurahs = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://api.alquran.cloud/v1/surah');
                setSurahs(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch surahs", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Function to fetch specific Surah details (Arabic + English)
    const getSurah = async (id) => {
        setLoading(true);
        try {
            // Fetch Arabic (Uthmani) only
            const response = await axios.get(`http://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani`);
            setLoading(false);
            return {
                arabic: response.data.data[0]
            };
        } catch (err) {
            console.error("Failed to fetch surah details", err);
            setError(err);
            setLoading(false);
            return null;
        }
    };

    return { surahs, getSurah, loading, error };
};
