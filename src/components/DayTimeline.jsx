// A thin bar from Fajr to Isha with a dot per prayer and a marker for the current time.
const KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const DayTimeline = ({ times, now, labels }) => {
    if (!times?.Fajr || !times?.Isha) return null;
    const start = times.Fajr.getTime();
    const end = times.Isha.getTime();
    const span = end - start;
    if (span <= 0) return null;

    const pos = (d) => Math.min(100, Math.max(0, ((d.getTime() - start) / span) * 100));
    const nowPos = pos(now);
    const inDay = now >= times.Fajr && now <= times.Isha;

    return (
        // Always drawn left-to-right like a clock, in both languages
        <div dir="ltr" className="w-full px-4 pt-6 pb-6" aria-hidden="true">
            <div className="relative h-1.5 rounded-full bg-white/10">
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400/70 via-amber-300/70 to-orange-400/70"
                    style={{ width: `${nowPos}%` }}
                />
                {KEYS.map((k, i) => (
                    <div key={k} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pos(times[k])}%` }}>
                        <div className={`w-2.5 h-2.5 rounded-full border border-white/40 ${now >= times[k] ? 'bg-white' : 'bg-slate-800'}`} />
                        <span className={`absolute ${i % 2 ? 'bottom-3' : 'top-3'} left-1/2 -translate-x-1/2 text-[9px] text-white/50 whitespace-nowrap`}>
                            {labels[k]}
                        </span>
                    </div>
                ))}
                {inDay && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)] border-2 border-white"
                        style={{ left: `${nowPos}%` }}
                    />
                )}
            </div>
        </div>
    );
};

export default DayTimeline;
