import { useState, useEffect } from 'react';
import { calculateTimeLeft } from '../utils/dateUtils';
import { motion } from 'framer-motion';

const CountdownTimer = ({ nextPrayer, labels, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(nextPrayer?.time));

    useEffect(() => {
        if (!nextPrayer) return;

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft(nextPrayer.time);
            setTimeLeft(remaining);

            if (!remaining) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextPrayer, onComplete]);

    if (!timeLeft || !nextPrayer) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8"
        >
            <p className="text-white/60 text-sm uppercase tracking-widest mb-2 font-medium">
                {labels?.upcoming || 'Upcoming'}: {nextPrayer.name}
            </p>
            <div className="flex items-end space-x-2">
                <TimeUnit value={timeLeft.hours} label={labels?.hrs || "HRS"} />
                <span className="text-2xl text-white/40 mb-3">:</span>
                <TimeUnit value={timeLeft.minutes} label={labels?.min || "MIN"} />
                <span className="text-2xl text-white/40 mb-3">:</span>
                <TimeUnit value={timeLeft.seconds} label={labels?.sec || "SEC"} />
            </div>
        </motion.div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-4xl md:text-5xl font-mono font-bold text-white tracking-widest drop-shadow-2xl">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-white/40 font-bold mt-1 tracking-wider">{label}</span>
    </div>
);

export default CountdownTimer;
