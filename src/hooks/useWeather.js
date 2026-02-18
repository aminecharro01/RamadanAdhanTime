import { useState, useEffect } from 'react';
import axios from 'axios';

export const useWeather = (coordinates) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!coordinates.lat || !coordinates.lng) return;

        const controller = new AbortController();

        const fetchWeather = async () => {
            setLoading(true);
            try {
                const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

                if (apiKey) {
                    // Use OpenWeatherMap if key exists
                    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                        params: {
                            lat: coordinates.lat,
                            lon: coordinates.lng,
                            appid: apiKey,
                            units: 'metric',
                        },
                        signal: controller.signal
                    });
                    setWeather({
                        temp: response.data.main.temp,
                        description: response.data.weather[0].description,
                        icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
                        humidity: response.data.main.humidity,
                        wind: response.data.wind.speed,
                        city: response.data.name,
                    });
                } else {
                    // Fallback to Open-Meteo (No key required)
                    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
                        params: {
                            latitude: coordinates.lat,
                            longitude: coordinates.lng,
                            current_weather: true,
                        },
                        signal: controller.signal
                    });

                    const { current_weather } = response.data;

                    // Simple WMO code mapping for icon/description
                    // This is a simplified fallback
                    setWeather({
                        temp: current_weather.temperature,
                        description: "Current Condition", // OpenMeteo returns codes, would need mapping
                        icon: null, // OpenMeteo doesn't provide icons directly
                        humidity: "N/A", // Basic current_weather endpoint doesn't have humidity
                        wind: current_weather.windspeed,
                        city: "Local Area",
                    });
                }
                setError(null);
            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Weather fetch error:", err);
                setError(err);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchWeather();

        return () => controller.abort();
    }, [coordinates.lat, coordinates.lng]);

    return { weather, loading, error };
};
