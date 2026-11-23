import { useState, useEffect } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Printer, BadgeCheck } from 'lucide-react';
import Modal from './Modal';
import Loader from './Loader';
import { getMonthTimes, PRAYER_KEYS } from '../services/prayerTimes';
import { formatTime } from '../utils/dateUtils';

const MonthTimetable = ({ onClose, coordinates, habousCityId, cityName, use24h, t, language }) => {
    const now = new Date();
    const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
    const requestKey = `${ym.year}-${ym.month}-${habousCityId}-${coordinates.lat},${coordinates.lng}`;
    const [result, setResult] = useState(null); // { requestKey, data, error }

    useEffect(() => {
        if (!coordinates.lat) return;
        let cancelled = false;
        getMonthTimes({ ...ym, coordinates, habousCityId })
            .then(data => !cancelled && setResult({ requestKey, data, error: null }))
            .catch(error => !cancelled && setResult({ requestKey, data: null, error }));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey covers the inputs
    }, [requestKey]);

    const current = result?.requestKey === requestKey ? result : null;
    const shift = (delta) => setYm(({ year, month }) => {
        const d = new Date(year, month - 1 + delta, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const isToday = (day) => day === now.getDate() && ym.month === now.getMonth() + 1 && ym.year === now.getFullYear();
    const isRTL = language === 'ar';

    return (
        <Modal
            title={`${t.timetable} · ${cityName || ''}`}
            icon={CalendarRange}
            onClose={onClose}
            wide
            className="print-area"
            actions={
                <button
                    onClick={() => window.print()}
                    disabled={!current?.data}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm disabled:opacity-40"
                >
                    <Printer size={16} />
                    <span className="hidden sm:inline">{t.print}</span>
                </button>
            }
        >
            <div className="flex justify-between items-center mb-3 bg-black/20 p-2 rounded-xl no-print">
                <button onClick={() => shift(-1)} className="p-2 hover:text-emerald-400" aria-label="Previous month">
                    <ChevronLeft size={22} className={isRTL ? 'rotate-180' : ''} />
                </button>
                <span className="font-semibold">
                    {t.monthNames[ym.month - 1]} <span dir="ltr">{ym.year}</span>
                </span>
                <button onClick={() => shift(1)} className="p-2 hover:text-emerald-400" aria-label="Next month">
                    <ChevronRight size={22} className={isRTL ? 'rotate-180' : ''} />
                </button>
            </div>

            <h3 className="print-only text-lg font-bold mb-2">
                {t.timetable} · {cityName} · {t.monthNames[ym.month - 1]} {ym.year}
            </h3>

            {!current ? (
                <div className="h-64"><Loader text="" /></div>
            ) : current.error ? (
                <p className="text-center text-white/60 py-10">{t.notPublished}</p>
            ) : (
                <>
                    {current.data.source === 'habous' && (
                        <p className="text-xs text-emerald-200/80 flex items-center gap-1 mb-2"><BadgeCheck size={13} />{t.sourceHabous}</p>
                    )}
                    <table className="w-full text-sm tabular-nums">
                        <thead className="sticky top-0 bg-slate-900/95">
                            <tr className="text-white/50 text-[11px] uppercase tracking-wider">
                                <th className="py-2 text-start">{t.day}</th>
                                {PRAYER_KEYS.map(k => <th key={k} className="py-2 text-center">{t[k.toLowerCase()]}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {current.data.days.map(({ day, timings }) => (
                                <tr key={day} className={`border-t border-white/5 ${isToday(day) ? 'bg-emerald-500/20 font-semibold' : ''}`}>
                                    <td className="py-1.5 ps-1 text-white/70" dir="ltr">{day}</td>
                                    {PRAYER_KEYS.map(k => (
                                        <td key={k} className="py-1.5 text-center" dir="ltr">
                                            {timings ? formatTime(timings[k], use24h).replace(/ (AM|PM)$/, (m) => m.toLowerCase()) : '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </Modal>
    );
};

export default MonthTimetable;
