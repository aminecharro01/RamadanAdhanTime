import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useWeather } from './hooks/useWeather';
import { useLanguage } from './hooks/useLanguage';
import { getNextPrayer, formatTime } from './utils/dateUtils';
import LocationHeader from './components/LocationHeader';
import PrayerCard from './components/PrayerCard';
import CountdownTimer from './components/CountdownTimer';
import WeatherCard from './components/WeatherCard';
import CalendarView from './components/CalendarView';
import QuranView from './components/QuranView';
import Footer from './components/Footer';
import DailyDua from './components/DailyDua';
import KhatmTracker from './components/KhatmTracker'; // [NEW]
import Loader from './components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { cities } from './data/cities';
import { MapPin, CalendarDays, BookOpen } from 'lucide-react';
import { getGradientClass } from './utils/gradientUtils'; // [NEW]

function App() {
  const geo = useGeolocation();
  const { toggleLanguage, t, isRTL, language } = useLanguage();

  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showQuran, setShowQuran] = useState(false); // [NEW]

  // Determine which coordinates to use
  const coordinates = selectedCity.lat
    ? { lat: selectedCity.lat, lng: selectedCity.lng }
    : geo.coordinates;

  const { data: prayerData, loading: prayerLoading, error: prayerError } = usePrayerTimes(coordinates);
  const { weather, loading: weatherLoading } = useWeather(coordinates);

  const [nextPrayer, setNextPrayer] = useState(null);
  const [todayPrayers, setTodayPrayers] = useState([]);

  useEffect(() => {
    if (prayerData) {
      const timings = prayerData.timings;
      const next = getNextPrayer(timings);
      setNextPrayer(next);

      setTodayPrayers([
        { id: 'Fajr', name: t.fajr, time: formatTime(timings.Fajr) },
        { id: 'Sunrise', name: t.sunrise, time: formatTime(timings.Sunrise), isSolar: true },
        { id: 'Dhuhr', name: t.dhuhr, time: formatTime(timings.Dhuhr) },
        { id: 'Asr', name: t.asr, time: formatTime(timings.Asr) },
        { id: 'Maghrib', name: t.maghrib, time: formatTime(timings.Maghrib) },
        { id: 'Isha', name: t.isha, time: formatTime(timings.Isha) }
      ]);
    }
  }, [prayerData, t]); // Re-run when language changes

  // Handle city change
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    // Find based on English name for Logic, but display might need handling
    // The value of option is still the English name key from cities array
    const city = cities.find(c => c.name === cityName);
    setSelectedCity(city);
  };

  // Derived loading state
  // Only show full page loader if we have NO data to show yet
  const isInitialLoading = !selectedCity.lat && !geo.loaded && !geo.error;
  const isFirstLoad = !prayerData && prayerLoading;

  const showFullLoader = isInitialLoading || (prayerLoading && !prayerData && !prayerError);

  // Valid city name to display
  const displayCity = selectedCity.lat
    ? (language === 'ar' && selectedCity.nameAr ? selectedCity.nameAr : selectedCity.name)
    : (weather?.city || t.locating);

  const [bgGradient, setBgGradient] = useState(getGradientClass());

  useEffect(() => {
    // Update gradient every minute
    const interval = setInterval(() => {
      setBgGradient(getGradientClass());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen w-full flex flex-col items-center p-6 sm:p-12 font-sans relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-1000 ${bgGradient}`}
    >
      {/* Dark Overlay for readability (optional, adjusted opacity) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>

      {/* Ambient Animated Background Elements (Optional - keeping subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Top Bar: settings & city select */}
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none">
        {/* City Select Dropdown */}
        <div className="pointer-events-auto relative group">
          <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <MapPin className="h-4 w-4 text-white/70" />
          </div>
          <select
            value={selectedCity.name}
            onChange={handleCityChange}
            className={`bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm rounded-full ${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none cursor-pointer hover:bg-white/20 transition-all`}
          >
            {cities.map(city => (
              <option key={city.name} value={city.name} className="bg-slate-800 text-white">
                {language === 'ar' && city.nameAr ? city.nameAr : city.name}
              </option>
            ))}
          </select>
          {/* Custom arrow for select */}
          <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowQuran(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 text-white"
            title={t.quran}
          >
            <BookOpen size={20} />
            <span className="font-medium hidden sm:inline">{t.quran}</span>
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 text-white"
            title={t.calendar}
          >
            <CalendarDays size={20} />
            <span className="font-medium hidden sm:inline">{t.calendar}</span>
          </button>
          <button
            onClick={toggleLanguage}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 text-white font-bold"
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showQuran && (
          <QuranView
            onClose={() => setShowQuran(false)}
            t={t}
            language={language}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <CalendarView
            onClose={() => setShowCalendar(false)}
            t={t}
            language={language}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showFullLoader ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            {(!selectedCity.lat && geo.error) ? (
              <div className="text-center text-white p-6 glass-card">
                <p className="text-xl font-bold mb-2">{t.locationRequired}</p>
                <p className="opacity-80 mb-4">{geo.error.message}</p>
                <p className="text-sm mb-4 opacity-60">{t.enableLocation}</p>
              </div>
            ) : (
              <Loader text={t.locating} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md z-10 flex flex-col flex-1 mt-12 transition-opacity duration-300 ${prayerLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            <LocationHeader
              city={displayCity}
              date={prayerData?.date?.gregorian?.date}
              hijriRaw={prayerData?.date?.hijri}
              appTitle={t.appTitle}
            />

            {nextPrayer && (
              <CountdownTimer
                nextPrayer={nextPrayer}
                labels={{ upcoming: t.upcoming, hrs: t.hrs, min: t.min, sec: t.sec }}
                onComplete={() => window.location.reload()}
              />
            )}

            <div className="grid grid-cols-1 gap-3 mt-4">
              {todayPrayers.map((prayer) => {
                const isNext = nextPrayer?.name === prayer.id;
                return (
                  <PrayerCard
                    key={prayer.id}
                    name={prayer.name}
                    time={prayer.time}
                    isNext={isNext}
                    isPast={false}
                  />
                );
              })}
            </div>

            {!weatherLoading && weather && <WeatherCard weather={{ ...weather, city: displayCity }} bgLabel={t.currentWeather} />}

            <KhatmTracker t={t} language={language} />

          </motion.div>
        )}
      </AnimatePresence>

      <DailyDua language={language} t={t} />
      <Footer t={t} />
    </div>
  );
}

export default App;
