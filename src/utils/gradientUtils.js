export const getGradientClass = (prayerTimes) => {
    const hour = new Date().getHours();

    // Default Night/Late Night (Isha - Fajr)
    let gradient = "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900";

    if (hour >= 5 && hour < 7) {
        // Fajr / Dawn
        gradient = "bg-gradient-to-br from-indigo-900 via-purple-800 to-orange-300";
    } else if (hour >= 7 && hour < 12) {
        // Morning / Sunrise
        gradient = "bg-gradient-to-br from-blue-400 via-sky-300 to-orange-100";
    } else if (hour >= 12 && hour < 16) {
        // Dhuhr / Noon
        gradient = "bg-gradient-to-br from-blue-600 via-sky-400 to-blue-300";
    } else if (hour >= 16 && hour < 18) {
        // Asr / Afternoon
        gradient = "bg-gradient-to-br from-orange-300 via-amber-200 to-blue-400";
    } else if (hour >= 18 && hour < 20) {
        // Maghrib / Sunset (Specific request: orange to purple)
        gradient = "bg-gradient-to-br from-orange-400 via-red-500 to-purple-900";
    } else if (hour >= 20 || hour < 5) {
        // Isha / Night
        gradient = "bg-gradient-to-br from-slate-900 via-blue-900 to-black";
    }

    return gradient;
};
