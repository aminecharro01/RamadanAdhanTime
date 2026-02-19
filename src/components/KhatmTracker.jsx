import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useQuran } from '../hooks/useQuran';

const KhatmTracker = ({ t, language }) => {
    // Total number of Surahs in Quran is 114
    const totalSurahs = 114;

    // State for Last Read Surah (stored in localStorage)
    // We store the index (0-113) or number (1-114)
    const [lastReadSurah, setLastReadSurah] = useState(() => {
        const saved = localStorage.getItem('adhanTime_n2_lastRead');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const percent = Math.round((lastReadSurah / totalSurahs) * 100);
        setPercentage(percent);
    }, [lastReadSurah]);

    const handleUpdateProgress = (e) => {
        const newValue = parseInt(e.target.value, 10);
        setLastReadSurah(newValue);
        localStorage.setItem('adhanTime_n2_lastRead', newValue);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-sm mt-8 mx-auto"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <BookOpen size={20} className="text-emerald-400" />
                        {language === 'ar' ? 'ختم القرآن' : 'Khatm Progress'}
                    </h3>
                    <span className="text-emerald-300 font-mono font-bold text-xl">{percentage}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-4 bg-black/20 rounded-full overflow-hidden mb-6 relative border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                    </motion.div>
                </div>

                {/* Input Slider */}
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs text-white/50">
                        <span>{language === 'ar' ? 'سورة الفاتحة' : 'Al-Fatiha'}</span>
                        <span>{language === 'ar' ? 'سورة الناس' : 'An-Nas'}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="114"
                        value={lastReadSurah}
                        onChange={handleUpdateProgress}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all"
                    />
                    <p className="text-center text-white/80 text-sm mt-2 font-medium">
                        {language === 'ar'
                            ? `وصلت إلى السورة رقم ${lastReadSurah}`
                            : `Last read: Surah #${lastReadSurah}`}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default KhatmTracker;
