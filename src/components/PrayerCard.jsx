import { motion } from 'framer-motion';
import { Sunrise } from 'lucide-react';

const PrayerCard = ({ name, time, isNext, isCurrent, isPast, isSolar, nowLabel }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className={`
                relative px-4 py-3 rounded-2xl border backdrop-blur-lg shadow-xl overflow-hidden transition-all duration-300
                ${isNext
                    ? 'bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/10 scale-[1.03] z-10'
                    : isCurrent
                        ? 'bg-amber-400/15 border-amber-300/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'}
                ${isPast && !isCurrent ? 'opacity-55' : 'opacity-100'}
            `}
        >
            {isNext && (
                <div className="absolute inset-0 bg-emerald-400/10 blur-xl rounded-full -z-10 animate-pulse"></div>
            )}

            <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    {isSolar && <Sunrise size={16} className="text-amber-200/70 shrink-0" />}
                    <span className={`text-sm uppercase tracking-wider font-semibold truncate
                        ${isNext ? 'text-emerald-300' : isCurrent ? 'text-amber-200' : 'text-white/60'}`}>
                        {name}
                    </span>
                    {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-300/20 text-amber-100">
                            {nowLabel}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Times always read left-to-right, also in Arabic */}
                    <span
                        dir="ltr"
                        className={`text-2xl font-bold tracking-tight tabular-nums
                        ${isNext ? 'text-white text-glow' : 'text-white/90'}`}
                    >
                        {time}
                    </span>
                    <div className={`w-1.5 h-8 rounded-full ${isNext ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : isCurrent ? 'bg-amber-300/70' : 'bg-white/10'}`}></div>
                </div>
            </div>
        </motion.div>
    );
};

export default PrayerCard;
