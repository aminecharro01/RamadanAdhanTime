import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { duas } from '../data/duas';
import { Quote, X } from 'lucide-react';

const DailyDua = ({ language, t }) => {
    const [dailyDua, setDailyDua] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Select dua based on the day of the year to ensure consistency for the whole day
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const duaIndex = dayOfYear % duas.length;
        setDailyDua(duas[duaIndex]);
    }, []);

    if (!dailyDua || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-sm mx-auto mt-6 mb-2"
            >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group hover:bg-white/10 transition-colors">
                    {/* Optional Close Button - kept for user control */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1 text-white/30 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={14} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-2">
                        <Quote size={16} className="text-emerald-400 fill-current mb-1" />

                        <p className="text-lg leading-relaxed font-serif text-white/90" style={{ fontFamily: 'Amiri, serif' }}>
                            {dailyDua.arabic}
                        </p>

                        <p className="text-xs text-white/60 italic font-light px-4">
                            "{dailyDua.english}"
                        </p>

                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            {dailyDua.source}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DailyDua;
