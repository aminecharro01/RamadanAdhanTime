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
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="fixed left-6 top-1/2 -translate-y-1/2 z-20 hidden xl:block w-80"
            >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl relative group">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex justify-center mb-4 text-emerald-400">
                        <Quote size={24} className="fill-current" />
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-xl leading-loose font-serif text-white/95" style={{ fontFamily: 'Amiri, serif' }}>
                            {dailyDua.arabic}
                        </p>

                        <div className="w-12 h-px bg-white/20 mx-auto"></div>

                        <p className="text-sm text-white/80 font-light italic">
                            "{dailyDua.english}"
                        </p>

                        <p className="text-xs text-white/50 uppercase tracking-widest mt-2">
                            {dailyDua.source}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DailyDua;
