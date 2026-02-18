import { useState, useEffect } from 'react';
import axios from 'axios';

export const useHijriCalendar = (month, year, adjustment = -1) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            setLoading(true);
            setError(null);
            try {
                // Calculate previous and next months/years
                const prevMonth = month === 1 ? 12 : month - 1;
                const prevYear = month === 1 ? year - 1 : year;

                const nextMonth = month === 12 ? 1 : month + 1;
                const nextYear = month === 12 ? year + 1 : year;

                // Fetch current, previous, and next months to handle day shifts
                const [prevRes, currRes, nextRes] = await Promise.all([
                    axios.get(`https://api.aladhan.com/v1/gToHCalendar/${prevMonth}/${prevYear}`),
                    axios.get(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`),
                    axios.get(`https://api.aladhan.com/v1/gToHCalendar/${nextMonth}/${nextYear}`)
                ]);

                const prevData = prevRes.data.data;
                const currData = currRes.data.data;
                const nextData = nextRes.data.data;

                // Flatten the data into a continuous timeline
                const combinedData = [...prevData, ...currData, ...nextData];

                // The start index of the current month in the combined array
                const startIndex = prevData.length;

                // Map the current month's gregorian dates to the adjusted Hijri dates
                const adjustedData = currData.map((day, index) => {
                    // Calculate the index in combined array we want to pull Hijri data from
                    // If adjustment is -1, we pull from index - 1 (yesterday)
                    const sourceIndex = startIndex + index + adjustment;

                    if (sourceIndex >= 0 && sourceIndex < combinedData.length) {
                        return {
                            ...day,
                            hijri: combinedData[sourceIndex].hijri
                        };
                    }
                    return day; // Fallback if out of bounds (shouldn't happen with +/- 1 month buffer)
                });

                setData(adjustedData);
                setLoading(false);
            } catch (err) {
                console.error("Calendar Sync Error:", err);
                setError(err);
                setLoading(false);
            }
        };

        if (month && year) {
            fetchCalendar();
        }
    }, [month, year, adjustment]);

    return { data, loading, error };
};
