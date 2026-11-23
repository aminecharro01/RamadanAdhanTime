import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, BookOpen, CalendarRange, Compass, Sparkles, Settings } from 'lucide-react';

import { useGeolocation } from './hooks/useGeolocation';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useWeather } from './hooks/useWeather';
import { useLanguage } from './hooks/useLanguage';
import { useSettings } from './hooks/useSettings';
import { useNow } from './hooks/useNow';
import { useNotifications } from './hooks/useNotifications';
import { getPrayerSchedule, formatTime, toDateKey } from './utils/dateUtils';
import { getGradientClass } from './utils/gradientUtils';
import { cities, findNearestCity, LOCAL_LOCATION } from './data/cities';

import LocationHeader from './components/LocationHeader';
import PrayerCard from './components/PrayerCard';
import CountdownTimer from './components/CountdownTimer';
import DayTimeline from './components/DayTimeline';
import RamadanCard from './components/RamadanCard';
import WeatherCard from './components/WeatherCard';
import CalendarView from './components/CalendarView';
import QuranView from './components/QuranView';
import MonthTimetable from './components/MonthTimetable';
import QiblaView from './components/QiblaView';
import AdhkarView from './components/AdhkarView';
import SettingsView from './components/SettingsView';
import CityPicker from './components/CityPicker';
import Footer from './components/Footer';
import DailyDua from './components/DailyDua';
import KhatmTracker from './components/KhatmTracker';
import Loader from './components/Loader';
import AudioPlayerBar from './components/AudioPlayerBar';

const PRAYER_ROWS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function App() {
  const geo = useGeolocation();
  const { toggleLanguage, t, isRTL, language } = useLanguage();
  const [settings, updateSettings] = useSettings();
  const now = useNow(10000);
  const dateKey = toDateKey(now);

  const [openView, setOpenView] = useState(null); // 'quran' | 'calendar' | 'timetable' | 'qibla' | 'adhkar' | 'settings'
  const closeView = () => setOpenView(null);

  // Location: a chosen city, or GPS matched to the nearest Habous city (if any within 50 km)
  const selectedCity = cities.find(c => c.id === settings.cityId) || LOCAL_LOCATION;
  const isLocal = selectedCity.id === LOCAL_LOCATION.id;
  const coordinates = isLocal ? geo.coordinates : { lat: selectedCity.lat, lng: selectedCity.lng };
  const nearestCity = isLocal ? findNearestCity(coordinates.lat, coordinates.lng) : selectedCity;
  const habousCityId = nearestCity?.id ?? null;

  const { today, tomorrow, loading: prayerLoading, error: prayerError } = usePrayerTimes(coordinates, habousCityId, dateKey);
  const { weather, loading: weatherLoading } = useWeather(coordinates);

  const cityLabel = (c) => (language === 'ar' && c?.nameAr ? c.nameAr : c?.name);
  const displayCity = !isLocal
    ? cityLabel(selectedCity)
    : nearestCity ? cityLabel(nearestCity) : (weather?.city || t.locating);

  const schedule = useMemo(() => getPrayerSchedule(today, tomorrow, now), [today, tomorrow, now]);

  useNotifications({ settings, today, tomorrow, t, cityName: displayCity });

  const selectCity = (city) => {
    updateSettings(prev => ({
      cityId: city.id,
      recentCityIds: city.id === LOCAL_LOCATION.id
        ? prev.recentCityIds
        : [city.id, ...prev.recentCityIds.filter(id => id !== city.id)].slice(0, 5),
    }));
  };

  // Gregorian date with Latin digits in both languages, e.g. "Monday 23 November 2026"
  const gregorianText = useMemo(() => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${t.weekdays[date.getDay()]} ${d} ${t.monthNames[m - 1]} ${y}`;
  }, [dateKey, t]);

  const [bgGradient, setBgGradient] = useState(getGradientClass());
  useEffect(() => {
    const interval = setInterval(() => setBgGradient(getGradientClass()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Full-page loader only while there is nothing to show yet
  const waitingForGeo = isLocal && !geo.loaded;
  const showFullLoader = !today && (waitingForGeo || prayerLoading);
  const showGeoError = isLocal && geo.error && !today;

  const prayerName = (key) => t[key.toLowerCase()];
  const countdownTitle = schedule.next
    ? `${t.upcoming}: ${prayerName(schedule.next.name)}${schedule.next.isTomorrow ? ` · ${t.tomorrow}` : ''}`
    : '';

  const tools = [
    { id: 'quran', icon: BookOpen, label: t.quran },
    { id: 'adhkar', icon: Sparkles, label: t.adhkar },
    { id: 'qibla', icon: Compass, label: t.qibla },
    { id: 'timetable', icon: CalendarRange, label: t.timetable },
    { id: 'calendar', icon: CalendarDays, label: t.calendar },
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen w-full flex flex-col items-center px-4 pt-20 pb-28 sm:px-12 font-sans relative overflow-x-hidden text-slate-900 dark:text-white transition-colors duration-1000 ${bgGradient}`}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Top bar: city picker, settings, language */}
      <div className="fixed top-0 left-0 right-0 px-4 sm:px-6 py-4 z-50 flex justify-between items-center gap-2 bg-gradient-to-b from-black/25 to-transparent">
        <CityPicker
          selectedCity={selectedCity}
          displayName={displayCity}
          recentIds={settings.recentCityIds}
          onSelect={selectCity}
          t={t}
          language={language}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenView('settings')}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all text-white"
            title={t.settings}
            aria-label={t.settings}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={toggleLanguage}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all text-white font-bold"
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(openView === 'quran' || openView === 'quran-resume') && (
          <QuranView key="quran" onClose={closeView} t={t} language={language} resume={openView === 'quran-resume'} />
        )}
        {openView === 'calendar' && <CalendarView key="calendar" onClose={closeView} t={t} language={language} />}
        {openView === 'timetable' && (
          <MonthTimetable
            key="timetable"
            onClose={closeView}
            coordinates={coordinates}
            habousCityId={habousCityId}
            cityName={displayCity}
            use24h={settings.use24h}
            t={t}
            language={language}
          />
        )}
        {openView === 'qibla' && <QiblaView key="qibla" onClose={closeView} coordinates={coordinates} t={t} />}
        {openView === 'adhkar' && <AdhkarView key="adhkar" onClose={closeView} t={t} language={language} />}
        {openView === 'settings' && (
          <SettingsView key="settings" onClose={closeView} settings={settings} update={updateSettings} t={t} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showGeoError ? (
          <motion.div key="geo-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center z-10">
            <div className="text-center text-white p-6 glass-card max-w-sm">
              <p className="text-xl font-bold mb-2">{t.locationRequired}</p>
              <p className="opacity-80 mb-4">{geo.error.message}</p>
              <p className="text-sm opacity-60">{t.enableLocation}</p>
            </div>
          </motion.div>
        ) : showFullLoader ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
            <Loader text={t.locating} />
          </motion.div>
        ) : !today ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center z-10">
            <div className="text-center text-white p-6 glass-card max-w-sm">
              <p className="opacity-80">{prayerError ? t.loadError : t.enableLocation}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md z-10 flex flex-col flex-1"
          >
            <LocationHeader
              gregorian={gregorianText}
              hijri={today.hijri}
              appTitle={t.appTitle}
              source={today.source}
              t={t}
              language={language}
            />

            <DailyDua language={language} t={t} />

            {schedule.next && (
              <CountdownTimer
                title={countdownTitle}
                target={schedule.next.time}
                labels={{ hrs: t.hrs, min: t.min, sec: t.sec }}
              />
            )}

            <RamadanCard today={today} tomorrow={tomorrow} now={now} use24h={settings.use24h} t={t} />

            <DayTimeline
              times={schedule.times}
              now={now}
              labels={Object.fromEntries(PRAYER_ROWS.map(k => [k, prayerName(k)]))}
            />

            <div className="grid grid-cols-1 gap-2.5">
              {PRAYER_ROWS.map((key) => {
                const time = schedule.times[key];
                return (
                  <PrayerCard
                    key={key}
                    name={prayerName(key)}
                    time={formatTime(today.timings[key], settings.use24h)}
                    isSolar={key === 'Sunrise'}
                    isNext={!schedule.next?.isTomorrow && schedule.next?.name === key}
                    isCurrent={schedule.current === key}
                    isPast={time ? time <= now : false}
                    nowLabel={t.now}
                  />
                );
              })}
            </div>

            {/* Tools */}
            <div className="grid grid-cols-5 gap-2 mt-6">
              {tools.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setOpenView(id)}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/20 transition-all text-white"
                >
                  <Icon size={22} className="text-emerald-300" />
                  <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>

            {!weatherLoading && weather && <WeatherCard weather={{ ...weather, city: displayCity }} bgLabel={t.currentWeather} />}

            <KhatmTracker
              t={t}
              language={language}
              goalDays={settings.khatmahDays}
              goalStart={settings.khatmahStart}
              reminder={settings.khatmahReminder}
              onContinue={() => setOpenView('quran-resume')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AudioPlayerBar language={language} />
      <Footer t={t} />
    </div>
  );
}

export default App;
