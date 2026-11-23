import { useState, useEffect } from 'react';
import { calculateTimeLeft } from '../utils/dateUtils';
import { motion } from 'framer-motion';

/** Counts down to `target` (a Date). Calls onComplete once it is reached. */
const CountdownTimer = ({ title, target, labels, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(target));

    useEffect(() => {
        if (!target) return;
        const tick = () => {
            const remaining = calculateTimeLeft(target);
            setTimeLeft(remaining);
            if (!remaining) {
                clearInterval(timer);
                onComplete?.();
            }
        };
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [target, onComplete]);

    if (!timeLeft) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-6"
        >
            <p className="text-white/60 text-sm uppercase tracking-widest mb-2 font-medium text-center">
                {title}
            </p>
            {/* Clock digits stay left-to-right in both languages */}
            <div dir="ltr" className="flex items-end gap-2">
                <TimeUnit value={timeLeft.hours} label={labels.hrs} />
                <span className="text-2xl text-white/40 mb-5">:</span>
                <TimeUnit value={timeLeft.minutes} label={labels.min} />
                <span className="text-2xl text-white/40 mb-5">:</span>
                <TimeUnit value={timeLeft.seconds} label={labels.sec} />
            </div>
        </motion.div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-4xl md:text-5xl font-mono font-bold text-white tracking-widest drop-shadow-2xl tabular-nums">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-white/40 font-bold mt-1 tracking-wider">{label}</span>
    </div>
);

export default CountdownTimer;
