import { useState } from 'react';
import { useHijriCalendar } from '../hooks/useHijriCalendar';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Loader from './Loader';

const CalendarView = ({ onClose, t, language }) => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const { data: calendarData, loading, error } = useHijriCalendar(month, year);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const isToday = (day) => {
        return (
            day.gregorian.day === String(today.getDate()).padStart(2, '0') &&
            month === today.getMonth() + 1 &&
            year === today.getFullYear()
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {t.hijri} {t.calendar}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-4 bg-black/20 p-2 rounded-xl">
                    <button onClick={handlePrevMonth} className="p-2 text-white hover:text-emerald-400 transition-colors">
                        <ChevronLeft size={24} className={language === 'ar' ? "rotate-180" : ""} />
                    </button>

                    <div className="text-center">
                        <span className="text-lg font-semibold text-white block">
                            {new Date(year, month - 1).toLocaleString(language === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    <button onClick={handleNextMonth} className="p-2 text-white hover:text-emerald-400 transition-colors">
                        <ChevronRight size={24} className={language === 'ar' ? "rotate-180" : ""} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-white/60 text-xs font-medium uppercase tracking-wider pr-1 pl-1">
                    {(language === 'ar'
                        ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
                        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    ).map((day, i) => (
                        <div key={i}>{day}</div>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader text="Loading Calendar..." />
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center py-10">Failed to load calendar data.</div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {/* Empty cells directly mapped not supported by API simple list, 
                                but API returns days in order 1..30/31. 
                                We might need to offset start based on weekday of the 1st. */}

                            {/* Calculate offset for the 1st day of the month */}
                            {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {calendarData?.map((day, index) => (
                                <div
                                    key={index}
                                    className={`
                                        aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative cursor-default border border-transparent
                                        ${isToday(day) ? 'bg-emerald-500/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <span className="text-lg font-bold text-white">
                                        {language === 'ar' ? day.hijri.day : day.hijri.day}
                                    </span>
                                    <span className="text-[10px] text-white/50">
                                        {language === 'ar' ? day.hijri.month.ar : day.hijri.month.en.slice(0, 3)}
                                    </span>
                                    {/* Gregorian tiny date */}
                                    <span className="absolute top-1 right-1 text-[8px] text-white/30">
                                        {day.gregorian.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center text-xs text-white/40">
                    {t.gregorian}: {month}/{year}
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarView;
