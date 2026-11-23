import { motion } from 'framer-motion';
import { BookOpen, Target, ChevronRight, Bell, Flame, CalendarCheck } from 'lucide-react';
import { useKhatmah } from '../hooks/useKhatmah';
import { todaysWird, wirdLabel } from '../utils/quranUtils';

const DAY_MS = 86400000;

/** Where the reader should be today to finish in `goalDays` days from `goalStart`. */
const expectedPercent = (goalStart, goalDays, now) => {
    if (!goalStart) return 0;
    const [y, m, d] = goalStart.split('-').map(Number);
    const elapsedDays = Math.floor((now - new Date(y, m - 1, d)) / DAY_MS) + 1; // today counts
    return Math.min(100, Math.max(0, (elapsedDays / goalDays) * 100));
};

const KhatmTracker = ({ t, language, goalDays, goalStart, reminder, onContinue }) => {
    const { progress, percentage, streak, pagesToday } = useKhatmah();
    const wird = todaysWird(progress, goalDays);
    const expected = expectedPercent(goalStart, goalDays, new Date());
    const behind = Math.round(expected - percentage);

    let status;
    if (percentage >= 100) status = t.completed;
    else if (progress.sura === 1 && progress.ayah === 1) status = t.startReading;
    else status = behind > 0 ? t.behind.replace('{n}', behind) : t.onTrack;

    const r = 28;
    const c = 2 * Math.PI * r;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-6 mx-auto"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="ambient-corner absolute top-0 end-0 w-48 h-48 -me-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
                            <BookOpen size={20} className="text-emerald-400" />
                            {t.khatmahProgress}
                        </h3>
                        <p className={`text-xs ${behind > 0 && percentage < 100 && percentage > 0 ? 'text-amber-200' : 'text-white/60'}`}>
                            {status}
                        </p>
                        <p className="text-white/50 text-[11px] flex items-center gap-1 mt-1">
                            <Target size={12} />
                            {t.targetToday}: <span dir="ltr">{Math.round(expected)}%</span>
                            <span className="text-white/30">·</span>
                            <span dir="ltr">{goalDays}</span> {t.days}
                            {reminder?.enabled && <Bell size={11} className="text-emerald-300 ms-1" />}
                        </p>
                    </div>

                    {/* Radial progress, with a tick at today's target */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0" dir="ltr">
                        <svg className="transform -rotate-90 w-16 h-16">
                            <circle cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                            <circle
                                cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="6" fill="transparent"
                                strokeDasharray={c}
                                strokeDashoffset={c - (percentage / 100) * c}
                                className="text-emerald-400 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                            <circle
                                cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={`1.5 ${c}`}
                                strokeDashoffset={-(expected / 100) * c}
                                className="text-amber-300"
                            />
                        </svg>
                        <span className="absolute text-xs font-bold text-white">{Math.round(percentage)}%</span>
                    </div>
                </div>

                {/* Today's wird + streak */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                        <CalendarCheck size={13} />{t.qWirdToday}: {wirdLabel(wird, t)}
                    </span>
                    {streak > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-100 border border-amber-300/30">
                            <Flame size={13} />{t.qStreak.replace('{n}', streak)}
                        </span>
                    )}
                    {pagesToday > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/80">{t.qPagesToday.replace('{n}', pagesToday)}</span>
                    )}
                </div>

                <button
                    onClick={onContinue}
                    className="mt-4 w-full flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5 hover:bg-black/30 transition-colors text-start group"
                >
                    <div className="flex flex-col">
                        <span className="text-white/40 text-xs uppercase tracking-wider">{t.lastRead}</span>
                        <span className="text-white font-medium text-sm mt-1">
                            {language === 'ar'
                                ? <>سورة <span dir="ltr">{progress.sura}</span> : آية <span dir="ltr">{progress.ayah}</span></>
                                : `Surah ${progress.sura} : Ayah ${progress.ayah}`}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-white/70 group-hover:text-emerald-300">
                        {t.continueReading}
                        <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                    </span>
                </button>
            </div>
        </motion.div>
    );
};

export default KhatmTracker;
