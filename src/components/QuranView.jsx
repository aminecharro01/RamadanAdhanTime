import { useState, useEffect } from 'react';
import { useQuran } from '../hooks/useQuran';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronLeft, BookOpen } from 'lucide-react';
import Loader from './Loader';

const QuranView = ({ onClose, t, language }) => {
    const { surahs, getSurah, loading: hookLoading, error } = useQuran();
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [surahContent, setSurahContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [contentLoading, setContentLoading] = useState(false);
    const [fontSize, setFontSize] = useState(36); // Default font size

    // Zoom controls
    const handleZoomIn = () => setFontSize(prev => Math.min(prev + 4, 80));
    const handleZoomOut = () => setFontSize(prev => Math.max(prev - 4, 20));

    // Filter surahs based on search (still use English/Arabic names for search flexibility)
    const filteredSurahs = surahs.filter(s =>
        s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.includes(searchTerm) ||
        String(s.number).includes(searchTerm)
    );

    const handleSurahClick = async (surah) => {
        setSelectedSurah(surah);
        setContentLoading(true);
        const data = await getSurah(surah.number);
        setSurahContent(data);
        setContentLoading(false);
    };

    const handleBack = () => {
        setSelectedSurah(null);
        setSurahContent(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-3xl text-slate-100"
        >

            {/* Header - Full Width */}
            <div className="flex justify-between items-center p-6 md:px-12 border-b border-white/10 bg-black/20 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    {selectedSurah && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="p-3 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                            </button>
                            {/* Font Size Controls */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                                <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors text-xs font-bold w-10 h-10 flex items-center justify-center">A-</button>
                                <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors text-sm font-bold w-10 h-10 flex items-center justify-center">A+</button>
                            </div>
                        </div>
                    )}
                    <h2 className="text-3xl font-bold flex items-center gap-3 font-serif" style={{ fontFamily: 'Amiri, serif' }}>
                        <BookOpen className="text-emerald-400" size={28} />
                        {selectedSurah ? selectedSurah.name : t.quran}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 hover:bg-white/10 rounded-full transition-colors hover:rotate-90 duration-300"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Content Area - Full Width */}
            <div className="flex-1 overflow-hidden relative w-full max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {!selectedSurah ? (
                        /* Surah List View */
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col p-4 md:p-8"
                        >
                            {/* Search Bar */}
                            <div className="mb-8 max-w-2xl mx-auto w-full">
                                <div className="relative">
                                    <Search className={`absolute top-4 ${language === 'ar' ? 'right-5' : 'left-5'} text-white/50`} size={24} />
                                    <input
                                        type="text"
                                        placeholder={t.searchSurah}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-14 pl-6' : 'pl-14 pr-6'} text-white text-lg focus:outline-none focus:border-emerald-500/50 transition-colors shadow-lg`}
                                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                                {hookLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <Loader text="Loading Surahs..." />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
                                        {filteredSurahs.map(surah => (
                                            <div
                                                key={surah.number}
                                                onClick={() => handleSurahClick(surah)}
                                                className="p-5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all duration-300 group flex justify-between items-center shadow-md hover:shadow-xl hover:-translate-y-1"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-sm font-mono group-hover:bg-emerald-500 group-hover:text-black transition-colors font-bold border border-white/10">
                                                        {surah.number}
                                                    </span>
                                                    <div className="text-left">
                                                        <div className="text-sm text-white/40 uppercase tracking-widest">{surah.englishName}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right font-serif text-2xl text-emerald-300" style={{ fontFamily: 'Amiri, serif' }}>
                                                    {surah.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* Surah Reader View */
                        <motion.div
                            key="reader"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="h-full overflow-y-auto custom-scrollbar p-4 md:p-12 pb-32"
                        >
                            {contentLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader text="Loading Verses..." />
                                </div>
                            ) : surahContent ? (
                                <div className="max-w-4xl mx-auto bg-white/5 rounded-3xl p-8 md:p-16 border border-white/10 shadow-2xl relative">
                                    {/* Bismillah */}
                                    <div className="text-center mb-12 border-b border-white/10 pb-8">
                                        <h3 className="text-4xl md:text-5xl text-emerald-400 mb-4" style={{ fontFamily: 'Amiri, serif', lineHeight: '1.8' }}>
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </h3>
                                    </div>

                                    {/* Verses - Continuous Flow */}
                                    <div className="text-center" dir="rtl">
                                        <p className="font-light text-white/90 transition-all duration-300" style={{ fontFamily: 'Amiri, serif', fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
                                            {surahContent.arabic.ayahs.map((ayah, index) => (
                                                <span key={ayah.number} className="inline relative px-1">
                                                    {ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')}
                                                    <span className="inline-flex items-center justify-center w-10 h-10 mx-2 text-lg border border-emerald-500/40 rounded-full text-emerald-400 number-symbol align-middle">
                                                        {ayah.numberInSurah}
                                                    </span>
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-20 text-red-400">Error loading content</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default QuranView;
