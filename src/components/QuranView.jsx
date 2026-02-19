import { useState, useEffect, useRef } from 'react';
import { useQuran } from '../hooks/useQuran';
import { useKhatmah } from '../hooks/useKhatmah'; // [NEW]
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronLeft, ChevronRight, BookOpen, Save, Bookmark } from 'lucide-react';
import Loader from './Loader';

const QuranView = ({ onClose, t, language }) => {
    const { surahs, getSurah, loading: hookLoading, error } = useQuran();
    const { progress, saveProgress } = useKhatmah(); // [NEW]
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [surahContent, setSurahContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [contentLoading, setContentLoading] = useState(false);
    const [fontSize, setFontSize] = useState(36);
    const [savedPopup, setSavedPopup] = useState(false); // [NEW] Feedback state

    const verseRefs = useRef({}); // [NEW] Refs for scrolling

    // Auto-scroll to saved verse when content loads
    useEffect(() => {
        if (surahContent && selectedSurah && progress.sura === selectedSurah.number) {
            const savedAyah = progress.ayah;
            const element = verseRefs.current[savedAyah];
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500); // Small delay to ensure rendering
            }
        }
    }, [surahContent, selectedSurah, progress]);

    const handleZoomIn = () => setFontSize(prev => Math.min(prev + 4, 80));
    const handleZoomOut = () => setFontSize(prev => Math.max(prev - 4, 20));

    // Filter surahs
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

    const handleSaveProgress = (ayahNumber) => {
        saveProgress(selectedSurah.number, ayahNumber);
        setSavedPopup(ayahNumber);
        setTimeout(() => setSavedPopup(false), 2000);
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
                            <div className="mb-8 max-w-2xl mx-auto w-full space-y-4">
                                {/* Resume Button */}
                                {progress.sura > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between group transition-all"
                                        onClick={() => {
                                            const savedSurah = surahs.find(s => s.number === progress.sura);
                                            if (savedSurah) handleSurahClick(savedSurah);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                                                <Bookmark size={20} fill="currentColor" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-emerald-400 font-bold text-sm uppercase tracking-wide">
                                                    {language === 'ar' ? 'تابع القراءة' : 'Continue Reading'}
                                                </div>
                                                <div className="text-white text-lg font-serif">
                                                    {language === 'ar' ? `سورة ${progress.sura} : آية ${progress.ayah}` : `Surah ${progress.sura} : Ayah ${progress.ayah}`}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={24} className={`text-emerald-400 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                    </motion.button>
                                )}

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
                            {/* Toast Notification */}
                            <AnimatePresence>
                                {savedPopup && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 50 }}
                                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 pointer-events-none"
                                    >
                                        <Save size={18} />
                                        <span className="font-bold">Saved Ayah {savedPopup}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                                            {surahContent.arabic.ayahs.map((ayah) => (
                                                <span
                                                    key={ayah.number}
                                                    id={`ayah-${ayah.numberInSurah}`}
                                                    ref={el => verseRefs.current[ayah.numberInSurah] = el}
                                                    className={`inline relative px-1 group/ayah rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer ${progress.sura === selectedSurah.number && progress.ayah === ayah.numberInSurah ? 'bg-emerald-500/20' : ''}`}
                                                    onClick={() => handleSaveProgress(ayah.numberInSurah)}
                                                    title="Click to save progress"
                                                >
                                                    {ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')}
                                                    <span className="inline-flex items-center justify-center w-10 h-10 mx-2 text-lg border border-emerald-500/40 rounded-full text-emerald-400 number-symbol align-middle relative">
                                                        {ayah.numberInSurah}
                                                        {progress.sura === selectedSurah.number && progress.ayah === ayah.numberInSurah && (
                                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1 rounded-full shadow-lg animate-bounce">
                                                                <Bookmark size={10} fill="currentColor" />
                                                            </div>
                                                        )}
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
