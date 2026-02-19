import { motion } from 'framer-motion';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { useKhatmah } from '../hooks/useKhatmah';
import { getProgressPercentage } from '../utils/quranUtils';

// Helper to calculate estimated completion
const getEstimatedCompletion = (percentage) => {
    if (percentage === 0) return "Start reading to see estimate";
    if (percentage >= 100) return "Alhamdulillah! Completed";

    // Simple projection: Assume 1 month for completion if just started, or project based on rate
    // For now, let's keep it motivating but static until we track daily velocity
    const daysLeft = Math.round((100 - percentage) * 0.3); // Rough mapping (30 days total)
    return `${daysLeft} days to finish`;
};

const KhatmTracker = ({ t, language }) => {
    const { progress, percentage } = useKhatmah();

    // Circular Progress Props
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-sm mt-8 mx-auto"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:bg-white/15 transition-all">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
                            <BookOpen size={20} className="text-emerald-400" />
                            {language === 'ar' ? 'ختم القرآن' : 'Khatmah Progress'}
                        </h3>
                        <p className="text-white/60 text-xs flex items-center gap-1">
                            <Calendar size={12} />
                            {getEstimatedCompletion(percentage)}
                        </p>
                    </div>

                    {/* Radial Progress */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-white/10"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 - (percentage / 100) * 2 * Math.PI * 28}
                                className="text-emerald-400 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-xs font-bold text-white">{Math.round(percentage)}%</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-white/40 text-xs uppercase tracking-wider">
                            {language === 'ar' ? 'آخر قراءة' : 'Last Read'}
                        </span>
                        <span className="text-white font-medium text-sm mt-1">
                            {language === 'ar' ? `سورة ${progress.sura} : آية ${progress.ayah}` : `Surah ${progress.sura} : Ayah ${progress.ayah}`}
                        </span>
                    </div>

                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-emerald-500 hover:text-white transition-all">
                        <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default KhatmTracker;
