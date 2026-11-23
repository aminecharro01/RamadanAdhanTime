import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, BookOpen, Settings2, Play, Pause, Eye, EyeOff, Check } from 'lucide-react';
import Loader from './Loader';
import QuranIndex from './quran/QuranIndex';
import QuranReader from './quran/QuranReader';
import VerseSheet from './quran/VerseSheet';
import ReaderSettings from './quran/ReaderSettings';
import { useQuranData } from '../hooks/useQuranData';
import { useQuranPrefs, useBookmarks, useHifz, QURAN_FONTS, QURAN_THEMES, HIFZ_STATUSES } from '../hooks/useQuranStore';
import { useKhatmah } from '../hooks/useKhatmah';
import { useQuranAudio } from '../context/QuranAudio';
import { versesFor, selectionTitle } from '../services/quranData';
import { ensureQuranFonts } from '../utils/loadFonts';

ensureQuranFonts();

const STATUS_LABEL = { memorized: 'qMemorized', learning: 'qLearning', review: 'qReview' };

const QuranView = ({ onClose, t, language, resume = false }) => {
    const [prefs, updatePrefs] = useQuranPrefs();
    const { meta, text, translation, loading, error, retry } = useQuranData(prefs.riwaya, prefs.translation);
    const { progress, saveProgress, streak, pagesToday } = useKhatmah();
    const bookmarks = useBookmarks();
    const [hifz, setHifz] = useHifz();
    const audio = useQuranAudio();

    const [tab, setTab] = useState('surah');
    const [query, setQuery] = useState('');
    const [selection, setSelection] = useState(null);   // { type, value }
    const [focusN, setFocusN] = useState(null);
    const [sheetVerse, setSheetVerse] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [hideText, setHideText] = useState(false);
    const [revealed, setRevealed] = useState(() => new Set());
    const [toast, setToast] = useState(null);
    const [resumed, setResumed] = useState(false);

    const theme = QURAN_THEMES[prefs.theme] || QURAN_THEMES.dark;
    const fontCss = QURAN_FONTS[prefs.font]?.css || QURAN_FONTS.amiri.css;

    // Apply saved reciter / repeat options to the shared player
    useEffect(() => {
        audio.setOptions({ reciterId: prefs.reciterId, repeatVerse: prefs.repeatVerse });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the screen on while reading (Wake Lock API)
    useEffect(() => {
        if (!prefs.keepAwake || !selection || !('wakeLock' in navigator)) return;
        let lock = null;
        const acquire = () => navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => { });
        const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };
        acquire();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            lock?.release().catch(() => { });
        };
    }, [prefs.keepAwake, selection]);

    const progressN = meta && progress?.timestamp > 0 ? meta.surahs[progress.sura - 1].start + progress.ayah - 1 : null;

    const open = (sel, focus = null) => {
        setSelection(sel);
        setFocusN(focus);
        setRevealed(new Set());
        setQuery('');
    };

    const openContinue = () => {
        if (!meta || !progressN) return;
        open({ type: 'surah', value: progress.sura }, progressN);
    };

    // "Continue reading" from the home screen opens straight at the saved verse
    if (resume && meta && !resumed) {
        setResumed(true);
        if (progressN) open({ type: 'surah', value: progress.sura }, progressN);
    }

    // Mushaf layout always shows whole pages
    const effective = useMemo(() => {
        if (!selection || !meta) return selection;
        if (prefs.mode !== 'mushaf' || selection.type === 'page') return selection;
        const anchor = (focusN && meta.verses[focusN - 1]) || versesFor(meta, selection)[0];
        return { type: 'page', value: anchor.page };
    }, [selection, prefs.mode, focusN, meta]);

    const queueFrom = (verses) => verses.map(v => ({
        n: v.n, s: v.s, a: v.a,
        label: `${language === 'ar' ? meta.surahs[v.s - 1].name : meta.surahs[v.s - 1].englishName} ${v.s}:${v.a}`,
    }));

    const selVerses = useMemo(() => (effective && meta ? versesFor(meta, effective) : []), [effective, meta]);
    const playingHere = audio.current && selVerses.some(v => v.n === audio.current.n);

    const playSelection = () => {
        if (playingHere) { audio.toggle(); return; }
        const start = Math.max(0, selVerses.findIndex(v => v.n === focusN));
        audio.playQueue(queueFrom(selVerses), start, { loopQueue: false });
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 1800);
    };

    const sheetSurah = sheetVerse && meta.surahs[sheetVerse.s - 1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed inset-0 z-50 flex flex-col backdrop-blur-3xl ${theme.page}`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 sm:px-6 py-3 border-b border-current/10">
                {selection ? (
                    <button onClick={() => setSelection(null)} className="p-2 rounded-full hover:bg-current/10" aria-label="Back">
                        <ChevronLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                    </button>
                ) : (
                    <BookOpen className={theme.accent} size={24} />
                )}
                <h2 className="flex-1 min-w-0 text-lg sm:text-xl font-bold truncate" style={selection?.type === 'surah' && language === 'ar' ? { fontFamily: fontCss } : undefined}>
                    {selection && meta ? selectionTitle(effective, meta, t, language) : t.quran}
                </h2>

                {selection && meta && (
                    <>
                        <button
                            onClick={playSelection}
                            className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                            aria-label={audio.playing && playingHere ? t.qPause : t.qPlay}
                        >
                            {audio.playing && playingHere ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button
                            onClick={() => { setHideText(h => !h); setRevealed(new Set()); }}
                            className={`p-2 rounded-full hover:bg-current/10 ${hideText ? theme.accent : ''}`}
                            title={t.qHideText}
                            aria-pressed={hideText}
                        >
                            {hideText ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </>
                )}
                <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-current/10" aria-label={t.qSettings}>
                    <Settings2 size={20} />
                </button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-current/10" aria-label={t.close}>
                    <X size={24} />
                </button>
            </div>

            {/* Hifz bar for a surah */}
            {selection?.type === 'surah' && effective?.type === 'surah' && (
                <div className="flex items-center gap-2 px-3 sm:px-6 py-2 text-xs border-b border-current/10 overflow-x-auto">
                    <span className={theme.muted}>{t.qSetStatus}:</span>
                    {HIFZ_STATUSES.map(st => (
                        <button
                            key={st}
                            onClick={() => setHifz(selection.value, st)}
                            className={`px-2.5 py-1 rounded-full border whitespace-nowrap ${hifz[selection.value] === st ? 'bg-emerald-500 text-white border-emerald-500' : 'border-current/20'}`}
                        >
                            {t[STATUS_LABEL[st]]}
                        </button>
                    ))}
                    {hideText && (
                        <>
                            <span className={`ms-auto whitespace-nowrap ${theme.muted}`}>{t.qTapToReveal}</span>
                            <button onClick={() => setRevealed(new Set(selVerses.map(v => v.n)))} className="px-2.5 py-1 rounded-full border border-current/20 whitespace-nowrap">{t.qRevealAll}</button>
                        </>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-hidden relative">
                {!meta || !text ? (
                    error ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                            <p>{t.qLoadError}</p>
                            <button onClick={retry} className="px-4 py-2 rounded-full bg-emerald-500 text-white">{t.qRetry}</button>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center"><Loader text={t.qLoadingQuran} /></div>
                    )
                ) : selection ? (
                    <QuranReader
                        meta={meta}
                        text={text}
                        translation={translation}
                        selection={effective}
                        onNavigate={(sel) => open(sel)}
                        prefs={prefs}
                        theme={theme}
                        fontCss={fontCss}
                        playingN={audio.current?.n}
                        progress={progress?.timestamp > 0 ? progress : null}
                        bookmarks={bookmarks}
                        hideText={hideText}
                        revealed={revealed}
                        onReveal={(n) => setRevealed(r => new Set(r).add(n))}
                        onVerseTap={setSheetVerse}
                        focusN={focusN}
                        t={t}
                        language={language}
                    />
                ) : (
                    <QuranIndex
                        meta={meta}
                        text={text}
                        translationId={prefs.translation}
                        tab={tab}
                        setTab={setTab}
                        query={query}
                        setQuery={setQuery}
                        onOpen={open}
                        progress={progress}
                        onContinue={openContinue}
                        bookmarks={bookmarks}
                        hifz={hifz}
                        setHifz={setHifz}
                        streak={streak}
                        pagesToday={pagesToday}
                        theme={theme}
                        fontCss={fontCss}
                        t={t}
                        language={language}
                    />
                )}
                {loading && meta && <div className="absolute top-2 end-3 text-xs opacity-60">…</div>}
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 z-[80] pointer-events-none"
                    >
                        <Check size={18} /><span className="font-semibold text-sm">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sheetVerse && (
                    <VerseSheet
                        key={sheetVerse.n}
                        verse={sheetVerse}
                        surah={sheetSurah}
                        arabic={text[sheetVerse.n - 1]}
                        translation={translation?.[sheetVerse.n - 1]}
                        fontCss={fontCss}
                        bookmarks={bookmarks}
                        onPlayFromHere={() => {
                            const start = selVerses.findIndex(v => v.n === sheetVerse.n);
                            audio.playQueue(queueFrom(selVerses), Math.max(0, start), { loopQueue: false });
                            setSheetVerse(null);
                        }}
                        onLoop={(endAyah) => {
                            const range = meta.verses.filter(v => v.s === sheetVerse.s && v.a >= sheetVerse.a && v.a <= endAyah);
                            audio.playQueue(queueFrom(range), 0, { loopQueue: true });
                            setSheetVerse(null);
                        }}
                        onMarkRead={() => {
                            saveProgress(sheetVerse.s, sheetVerse.a, { page: sheetVerse.page, hq: sheetVerse.hq });
                            showToast(t.qSaved);
                            setSheetVerse(null);
                        }}
                        onClose={() => setSheetVerse(null)}
                        t={t}
                        language={language}
                    />
                )}
                {showSettings && (
                    <ReaderSettings
                        key="settings"
                        onClose={() => setShowSettings(false)}
                        prefs={prefs}
                        update={updatePrefs}
                        audio={audio}
                        t={t}
                        language={language}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QuranView;
