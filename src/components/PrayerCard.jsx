import { motion } from 'framer-motion';

const PrayerCard = ({ name, time, isNext, isPast }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className={`
                relative p-4 rounded-2xl border backdrop-blur-lg shadow-xl overflow-hidden transition-all duration-300
                ${isNext
                    ? 'bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/10 scale-105 z-10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'}
                ${isPast ? 'opacity-60' : 'opacity-100'}
            `}
        >
            {/* Glow effect for next prayer */}
            {isNext && (
                <div className="absolute inset-0 bg-emerald-400/10 blur-xl rounded-full -z-10 animate-pulse"></div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className={`text-sm uppercase tracking-wider font-semibold 
                        ${isNext ? 'text-emerald-300' : 'text-white/60'}`}>
                        {name}
                    </span>
                    <span className={`text-2xl font-bold tracking-tight mt-1
                        ${isNext ? 'text-white text-glow' : 'text-white/90'}`}>
                        {time}
                    </span>
                </div>

                {/* Visual Indicator */}
                <div className={`w-2 h-10 rounded-full ${isNext ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/10'}`}></div>
            </div>
        </motion.div>
    );
};

export default PrayerCard;
