import { useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Heart, Flag } from 'lucide-react';
import { versesFor, hizbOf, quarterInHizb, SELECTION_LIMITS } from '../../services/quranData';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

const VerseNumber = ({ a, className }) => (
    <span
        dir="ltr"
        className={`inline-flex items-center justify-center min-w-[1.9em] h-[1.9em] mx-1 px-1 text-[0.5em] rounded-full border align-middle tabular-nums ${className}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
        {a}
    </span>
);

const QuranReader = ({
    meta, text, translation, selection, onNavigate, prefs, theme, fontCss,
    playingN, progress, bookmarks, hideText, revealed, onReveal, onVerseTap, focusN, t, language,
}) => {
    const scrollRef = useRef(null);
    const verseRefs = useRef({});
    const verses = useMemo(() => versesFor(meta, selection), [meta, selection]);
    const selKey = `${selection.type}-${selection.value}`;

    // Scroll to the focused verse (resume / search result) or to the top on navigation
    useEffect(() => {
        const el = focusN && verseRefs.current[focusN];
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        else scrollRef.current?.scrollTo({ top: 0 });
    }, [selKey, focusN]);

    // Follow the recitation
    useEffect(() => {
        const el = playingN && verseRefs.current[playingN];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [playingN]);

    // Mushaf: arrow keys and swipe to turn pages (Arabic mushaf: next page is to the left)
    const max = SELECTION_LIMITS[selection.type];
    const go = (delta) => {
        const value = selection.value + delta;
        if (value >= 1 && value <= max) onNavigate({ type: selection.type, value });
    };
    useEffect(() => {
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea, select')) return;
            if (e.key === 'ArrowLeft') go(1);
            if (e.key === 'ArrowRight') go(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });
    const touch = useRef(null);
    const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchEnd = (e) => {
        if (prefs.mode !== 'mushaf' || !touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx > 0 ? 1 : -1);
        touch.current = null;
    };

    // Group consecutive verses by surah (for headers inside juz / hizb / page views)
    const groups = useMemo(() => {
        const out = [];
        for (const v of verses) {
            if (!out.length || out[out.length - 1].s !== v.s) out.push({ s: v.s, verses: [] });
            out[out.length - 1].verses.push(v);
        }
        return out;
    }, [verses]);

    const first = verses[0];
    const progressN = progress ? meta.surahs[progress.sura - 1]?.start + progress.ayah - 1 : null;

    const verseClasses = (v) => {
        if (v.n === playingN) return 'bg-amber-400/30 rounded-lg';
        if (v.n === focusN) return 'bg-emerald-500/15 rounded-lg';
        return 'hover:bg-emerald-500/10 rounded-lg';
    };

    const renderVerseText = (v) => {
        const hidden = hideText && !revealed.has(v.n);
        return (
            <span className={hidden ? 'blur-md select-none opacity-60' : ''}>
                {text[v.n - 1]}
            </span>
        );
    };

    const markers = (v) => (
        <>
            {v.sajda && <span className={`mx-1 ${theme.accent}`} title={t.qSajda}>۩</span>}
            {v.n === progressN && <Flag size={14} className="inline mx-0.5 text-emerald-400 fill-emerald-400 align-middle" />}
            {bookmarks.find('bookmark', v.s, v.a) && <Bookmark size={14} className="inline mx-0.5 text-amber-400 fill-amber-400 align-middle" />}
            {bookmarks.find('favorite', v.s, v.a) && <Heart size={14} className="inline mx-0.5 text-rose-400 fill-rose-400 align-middle" />}
        </>
    );

    // A hizb-quarter marker (۞) where a new quarter starts, as in Moroccan mushafs
    const quarterMark = (v, i, arr) => {
        const prev = i > 0 ? arr[i - 1] : meta.verses[v.n - 2];
        if (!prev || prev.hq === v.hq) return null;
        return (
            <span className={`inline-flex items-center gap-1 mx-2 text-[0.45em] align-middle ${theme.accent}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                ۞ <span dir="ltr">{t.qHizb} {hizbOf(v.hq)}{quarterInHizb(v.hq) > 1 ? ` · ${quarterInHizb(v.hq) - 1}/4` : ''}</span>
            </span>
        );
    };

    const onTapVerse = (v) => {
        if (hideText && !revealed.has(v.n)) onReveal(v.n);
        else onVerseTap(v);
    };

    return (
        <div ref={scrollRef} className="h-full overflow-y-auto px-3 sm:px-8 pt-4 pb-40" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="max-w-3xl mx-auto">
                {/* Position info */}
                <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs mb-4 ${theme.muted}`} dir="ltr">
                    <span>{t.qJuz} {first?.juz}</span>·<span>{t.qHizb} {first && hizbOf(first.hq)}</span>·<span>{t.qPage} {first?.page}</span>
                </div>

                {groups.map(group => {
                    const surah = meta.surahs[group.s - 1];
                    const startsSurah = group.verses[0].a === 1;
                    return (
                        <section key={group.s} className={`rounded-3xl border p-5 sm:p-10 mb-6 shadow-xl ${theme.card}`}>
                            {startsSurah && (
                                <div className="text-center mb-6 pb-6 border-b border-current/10">
                                    <h3 className={`text-3xl ${theme.accent}`} style={{ fontFamily: fontCss }}>{surah.name}</h3>
                                    <p className={`text-xs mt-1 ${theme.muted}`}>
                                        {surah.englishName} · {surah.revelationType === 'Meccan' ? t.qMeccan : t.qMedinan} · <span dir="ltr">{surah.count}</span> {t.qVerses}
                                    </p>
                                    {surah.number !== 1 && surah.number !== 9 && (
                                        <p className={`mt-5 text-3xl ${theme.accent}`} style={{ fontFamily: fontCss, lineHeight: 1.9 }}>{BASMALA}</p>
                                    )}
                                </div>
                            )}

                            {translation ? (
                                // Verse-by-verse with translation
                                <div className="space-y-5">
                                    {group.verses.map((v, i, arr) => (
                                        <div key={v.n} ref={el => { verseRefs.current[v.n] = el; }} className={`p-2 cursor-pointer transition-colors ${verseClasses(v)}`} onClick={() => onTapVerse(v)}>
                                            <p dir="rtl" className="text-right" style={{ fontFamily: fontCss, fontSize: prefs.fontSize, lineHeight: 2 }}>
                                                {quarterMark(v, i, arr)}
                                                {renderVerseText(v)}
                                                <VerseNumber a={v.a} className={`border-current/30 ${theme.accent}`} />
                                                {markers(v)}
                                            </p>
                                            <p dir="ltr" className={`mt-2 text-sm leading-relaxed text-left ${theme.muted}`}>
                                                <span className="font-semibold">{v.a}.</span> {translation[v.n - 1]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Continuous mushaf-like flow
                                <p dir="rtl" className="text-justify [text-align-last:center]" style={{ fontFamily: fontCss, fontSize: prefs.fontSize, lineHeight: 2.1 }}>
                                    {group.verses.map((v, i, arr) => (
                                        <span
                                            key={v.n}
                                            ref={el => { verseRefs.current[v.n] = el; }}
                                            onClick={() => onTapVerse(v)}
                                            className={`cursor-pointer transition-colors px-0.5 ${verseClasses(v)}`}
                                        >
                                            {quarterMark(v, i, arr)}
                                            {renderVerseText(v)}
                                            <VerseNumber a={v.a} className={`border-current/30 ${theme.accent}`} />
                                            {markers(v)}
                                        </span>
                                    ))}
                                </p>
                            )}
                        </section>
                    );
                })}

                {/* Previous / next */}
                <div className="flex items-center justify-between gap-3 mt-2" dir="ltr">
                    <button
                        onClick={() => go(language === 'ar' || prefs.mode === 'mushaf' ? 1 : -1)}
                        disabled={language === 'ar' || prefs.mode === 'mushaf' ? selection.value >= max : selection.value <= 1}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm disabled:opacity-30 ${theme.card}`}
                    >
                        <ChevronLeft size={18} />
                        {language === 'ar' || prefs.mode === 'mushaf' ? t.qNext : t.qPrev}
                    </button>
                    <span className={`text-xs ${theme.muted}`}>{selection.value} / {max}</span>
                    <button
                        onClick={() => go(language === 'ar' || prefs.mode === 'mushaf' ? -1 : 1)}
                        disabled={language === 'ar' || prefs.mode === 'mushaf' ? selection.value <= 1 : selection.value >= max}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm disabled:opacity-30 ${theme.card}`}
                    >
                        {language === 'ar' || prefs.mode === 'mushaf' ? t.qPrev : t.qNext}
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuranReader;
