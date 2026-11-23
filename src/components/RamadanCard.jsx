import { Moon, Star, Utensils, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';
import { timeOnDate, formatTime, calculateTimeLeft } from '../utils/dateUtils';

const RAMADAN = 9;

/**
 * Shown during Ramadan only: suhoor/iftar times with a countdown to the next one, and the
 * current night during the last ten nights (the Islamic night starts at Maghrib).
 */
const RamadanCard = ({ today, tomorrow, now, use24h, t }) => {
    const hijri = today?.hijri;
    if (!hijri || hijri.month !== RAMADAN || !today.timings) return null;

    const fajr = timeOnDate(today.date, today.timings.Fajr);
    const maghrib = timeOnDate(today.date, today.timings.Maghrib);

    // Next event: suhoor ends at Fajr, iftar at Maghrib; after Maghrib -> tomorrow's Fajr.
    let next;
    if (now < fajr) next = { label: t.suhoorEnds, at: fajr };
    else if (now < maghrib) next = { label: t.iftar, at: maghrib };
    else if (tomorrow?.timings) next = { label: t.suhoorEnds, at: timeOnDate(tomorrow.date, tomorrow.timings.Fajr) };

    const left = next ? calculateTimeLeft(next.at) : null;

    // Night n is the night before day n; after Maghrib we are in the next night.
    const night = now >= maghrib ? hijri.day + 1 : hijri.day;
    const inLastTen = night >= 21 && night <= 30;
    const isOdd = night % 2 === 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 mb-2 rounded-3xl p-5 border border-amber-300/30 bg-gradient-to-br from-amber-500/20 via-purple-600/15 to-slate-900/30 backdrop-blur-lg shadow-xl"
        >
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <Moon className="text-amber-200" size={20} />
                    <span className="font-bold text-white">{t.ramadanMubarak}</span>
                </div>
                <span className="text-xs text-amber-100/80">{t.dayOfRamadan.replace('{n}', hijri.day)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-3">
                    <p className="text-[11px] text-white/60 flex items-center gap-1"><Sunrise size={12} />{t.suhoorEnds}</p>
                    <p dir="ltr" className="text-xl font-bold text-white tabular-nums text-start">{formatTime(today.timings.Fajr, use24h)}</p>
                </div>
                <div className="rounded-2xl bg-black/20 p-3">
                    <p className="text-[11px] text-white/60 flex items-center gap-1"><Utensils size={12} />{t.iftar}</p>
                    <p dir="ltr" className="text-xl font-bold text-white tabular-nums text-start">{formatTime(today.timings.Maghrib, use24h)}</p>
                </div>
            </div>

            {next && left && (
                <p className="mt-3 text-sm text-amber-50/90 text-center">
                    {next.label}: <span dir="ltr" className="font-mono font-bold">{`${String(left.hours).padStart(2, '0')}:${String(left.minutes).padStart(2, '0')}`}</span>
                </p>
            )}

            {inLastTen && (
                <div className={`mt-3 rounded-2xl px-3 py-2 text-sm flex items-center gap-2 ${isOdd ? 'bg-amber-300/20 text-amber-50 border border-amber-200/30' : 'bg-white/5 text-white/70'}`}>
                    <Star size={16} className={isOdd ? 'text-amber-200 fill-amber-200' : 'text-white/50'} />
                    <span>{t.lastTenNights} · {t.nightOf.replace('{n}', night)}</span>
                    {isOdd && <span className="ms-auto text-xs">{t.oddNight}</span>}
                </div>
            )}
        </motion.div>
    );
};

export default RamadanCard;
