import { useState, useEffect, useMemo } from 'react';
import { Search, Bookmark, Heart, Trash2, ChevronRight, Loader2, Flame } from 'lucide-react';
import { firstVerses, searchQuran, hizbOf } from '../../services/quranData';
import { HIFZ_STATUSES } from '../../hooks/useQuranStore';

const TABS = ['surah', 'juz', 'hizb', 'page', 'bookmarks', 'hifz'];
const TAB_LABEL = { surah: 'qSurah', juz: 'qJuz', hizb: 'qHizb', page: 'qPage', bookmarks: 'qBookmarks', hifz: 'qHifz' };
const STATUS_STYLE = {
    memorized: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    learning: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    review: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
};
const STATUS_LABEL = { memorized: 'qMemorized', learning: 'qLearning', review: 'qReview' };

const normalizeLatin = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const stripArabic = (s) => String(s || '').replace(/[ً-ٰٟۖ-ۭ]/g, '').replace(/[ٱأإآ]/g, 'ا');

const snippet = (s, n = 90) => (s && s.length > n ? `${s.slice(0, n)}…` : s);

const QuranIndex = ({ meta, text, translationId, tab, setTab, query, setQuery, onOpen, progress, onContinue, bookmarks, hifz, setHifz, streak, pagesToday, theme, fontCss, t, language }) => {
    const [verseResults, setVerseResults] = useState({ q: '', items: [], loading: false });

    // Verse search (debounced)
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) return;
        let cancelled = false;
        const timer = setTimeout(() => {
            setVerseResults({ q, items: [], loading: true });
            searchQuran(meta, q, { translation: translationId !== 'none' ? translationId : (language === 'ar' ? null : 'en') })
                .then(items => !cancelled && setVerseResults({ q, items, loading: false }))
                .catch(() => !cancelled && setVerseResults({ q, items: [], loading: false }));
        }, 300);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [query, meta, translationId, language]);

    const surahMatches = useMemo(() => {
        const q = query.trim();
        if (!q) return meta.surahs;
        const ql = normalizeLatin(q);
        const qa = stripArabic(q);
        return meta.surahs.filter(s =>
            (ql && normalizeLatin(s.englishName).includes(ql)) ||
            (ql && normalizeLatin(s.englishNameTranslation).includes(ql)) ||
            stripArabic(s.name).includes(qa) ||
            String(s.number) === q.trim());
    }, [query, meta]);

    const surahName = (s) => (language === 'ar' ? meta.surahs[s - 1].name : meta.surahs[s - 1].englishName);
    const searching = query.trim().length >= 2;
    const resultsForQuery = verseResults.q === query.trim() ? verseResults : { items: [], loading: true };

    const renderSurahRow = (s) => {
        const status = hifz[s.number];
        return (
            <button
                key={s.number}
                onClick={() => onOpen({ type: 'surah', value: s.number })}
                className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 text-start transition-all hover:-translate-y-0.5 ${theme.card}`}
            >
                <span dir="ltr" className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-current/20 text-sm font-bold tabular-nums">{s.number}</span>
                <span className="flex-1 min-w-0">
                    <span className="block font-medium truncate">{s.englishName}</span>
                    <span className={`block text-xs truncate ${theme.muted}`}>
                        {s.revelationType === 'Meccan' ? t.qMeccan : t.qMedinan} · <span dir="ltr">{s.count}</span> {t.qVerses}
                        {status && <span className={`ms-2 px-1.5 rounded border text-[10px] ${STATUS_STYLE[status]}`}>{t[STATUS_LABEL[status]]}</span>}
                    </span>
                </span>
                <span className={`text-2xl shrink-0 ${theme.accent}`} style={{ fontFamily: fontCss }}>{s.name.replace(/^سُورَةُ\s*/, '')}</span>
            </button>
        );
    };

    const renderBookmarks = (type) => {
        const list = bookmarks.items.filter(b => b.type === type);
        if (!list.length) return null;
        return (
            <div className="space-y-2">
                <p className={`text-xs uppercase tracking-wider px-1 flex items-center gap-1.5 ${theme.muted}`}>
                    {type === 'favorite' ? <Heart size={13} /> : <Bookmark size={13} />}{type === 'favorite' ? t.qFavorites : t.qBookmarks}
                </p>
                {list.map(b => {
                    const v = meta.verses.find(x => x.s === b.s && x.a === b.a);
                    return (
                        <div key={b.id} className={`rounded-2xl border p-3 flex gap-3 ${theme.card}`}>
                            <button className="flex-1 text-start min-w-0" onClick={() => onOpen({ type: 'surah', value: b.s }, v?.n)}>
                                <span className="text-sm font-semibold">{surahName(b.s)} <span dir="ltr">{b.s}:{b.a}</span></span>
                                <span dir="rtl" className="block text-right mt-1 truncate" style={{ fontFamily: fontCss }}>{v && snippet(text[v.n - 1])}</span>
                                {b.note && <span className={`block text-xs mt-1 ${theme.muted}`}>📝 {b.note}</span>}
                            </button>
                            <button onClick={() => bookmarks.remove(b.id)} className={`p-2 self-start rounded-lg hover:bg-red-500/20 ${theme.muted}`} aria-label={t.qDelete}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const hifzCounts = HIFZ_STATUSES.reduce((acc, st) => ({ ...acc, [st]: Object.values(hifz).filter(x => x === st).length }), {});

    return (
        <div className="h-full flex flex-col">
            <div className="px-3 sm:px-8 pt-3 space-y-3 max-w-4xl w-full mx-auto">
                {/* Continue + reading stats */}
                {progress?.timestamp > 0 && (
                    <button onClick={onContinue} className="w-full rounded-2xl p-3.5 flex items-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-start">
                        <Bookmark size={20} className="text-emerald-400 fill-emerald-400 shrink-0" />
                        <span className="flex-1 min-w-0">
                            <span className="block text-emerald-400 font-bold text-xs uppercase tracking-wide">{t.qContinue}</span>
                            <span className="block truncate">{surahName(progress.sura)} <span dir="ltr">{progress.sura}:{progress.ayah}</span></span>
                        </span>
                        {streak > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-300 shrink-0"><Flame size={14} />{t.qStreak.replace('{n}', streak)}</span>
                        )}
                        {pagesToday > 0 && <span className={`text-xs shrink-0 ${theme.muted}`}>{t.qPagesToday.replace('{n}', pagesToday)}</span>}
                        <ChevronRight size={18} className={`shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                )}

                <div className="relative">
                    <Search size={18} className={`absolute top-1/2 -translate-y-1/2 start-3.5 ${theme.muted}`} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.qSearchPlaceholder}
                        className={`w-full rounded-2xl border ps-10 pe-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${theme.card}`}
                    />
                </div>

                {!searching && (
                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                        {TABS.map(k => (
                            <button
                                key={k}
                                onClick={() => setTab(k)}
                                className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${tab === k ? 'bg-emerald-500 text-white border-emerald-500' : `${theme.card} ${theme.muted}`}`}
                            >
                                {t[TAB_LABEL[k]]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 sm:px-8 pt-3 pb-40">
                <div className="max-w-4xl mx-auto">
                    {searching ? (
                        <div className="space-y-5">
                            {surahMatches.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{surahMatches.slice(0, 10).map(renderSurahRow)}</div>
                            )}
                            <div className="space-y-2">
                                <p className={`text-xs uppercase tracking-wider px-1 flex items-center gap-2 ${theme.muted}`}>
                                    {t.qSearchVerses}
                                    {resultsForQuery.loading ? <Loader2 size={13} className="animate-spin" /> : <span dir="ltr">({resultsForQuery.items.length})</span>}
                                </p>
                                {!resultsForQuery.loading && !resultsForQuery.items.length && !surahMatches.length && (
                                    <p className={`text-center py-8 ${theme.muted}`}>{t.qNoResults}</p>
                                )}
                                {resultsForQuery.items.map(v => (
                                    <button key={v.n} onClick={() => onOpen({ type: 'surah', value: v.s }, v.n)} className={`w-full rounded-2xl border p-3 text-start ${theme.card}`}>
                                        <span className="text-sm font-semibold">{surahName(v.s)} <span dir="ltr">{v.s}:{v.a}</span></span>
                                        <span dir="rtl" className="block text-right text-lg mt-1" style={{ fontFamily: fontCss }}>{snippet(text[v.n - 1], 160)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : tab === 'surah' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{meta.surahs.map(renderSurahRow)}</div>
                    ) : tab === 'juz' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {firstVerses(meta, 'juz').map(({ value, verse }) => (
                                <button key={value} onClick={() => onOpen({ type: 'juz', value })} className={`rounded-2xl border p-3.5 text-start flex items-center gap-3 ${theme.card}`}>
                                    <span dir="ltr" className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${theme.accent} border border-current/30`}>{value}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium">{t.qJuz} {value}</span>
                                        <span className={`block text-xs truncate ${theme.muted}`}>{surahName(verse.s)} <span dir="ltr">{verse.s}:{verse.a}</span></span>
                                    </span>
                                    <span dir="rtl" className="text-sm truncate max-w-[45%]" style={{ fontFamily: fontCss }}>{snippet(text[verse.n - 1], 30)}</span>
                                </button>
                            ))}
                        </div>
                    ) : tab === 'hizb' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {firstVerses(meta, 'hizb').map(({ value, verse }) => (
                                <button key={value} onClick={() => onOpen({ type: 'hizb', value })} className={`rounded-2xl border p-3 text-start flex items-center gap-3 ${theme.card} ${progress?.hq && hizbOf(progress.hq) === value ? 'ring-2 ring-emerald-400/60' : ''}`}>
                                    <span dir="ltr" className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold ${theme.accent} border border-current/30`}>{value}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium">{t.qHizb} {value} <span className={`text-xs ${theme.muted}`}>· {t.qJuz} {verse.juz}</span></span>
                                        <span className={`block text-xs truncate ${theme.muted}`}>{surahName(verse.s)} <span dir="ltr">{verse.s}:{verse.a}</span></span>
                                    </span>
                                    <span dir="rtl" className="text-sm truncate max-w-[40%]" style={{ fontFamily: fontCss }}>{snippet(text[verse.n - 1], 26)}</span>
                                </button>
                            ))}
                        </div>
                    ) : tab === 'page' ? (
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5" dir="ltr">
                            {Array.from({ length: 604 }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => onOpen({ type: 'page', value: p })}
                                    className={`aspect-square rounded-lg border text-sm tabular-nums ${theme.card} ${progress?.page === p ? 'ring-2 ring-emerald-400' : ''}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    ) : tab === 'bookmarks' ? (
                        <div className="space-y-5">
                            {renderBookmarks('favorite')}
                            {renderBookmarks('bookmark')}
                            {!bookmarks.items.length && <p className={`text-center py-10 ${theme.muted}`}>{t.qNoBookmarks}</p>}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className={`text-sm text-center ${theme.muted}`}>
                                {t.qHifzSummary.replace('{m}', hifzCounts.memorized).replace('{l}', hifzCounts.learning).replace('{r}', hifzCounts.review)}
                            </p>
                            <div className="h-2 rounded-full bg-current/10 overflow-hidden flex" dir="ltr">
                                <div className="bg-emerald-500" style={{ width: `${(hifzCounts.memorized / 114) * 100}%` }} />
                                <div className="bg-sky-500" style={{ width: `${(hifzCounts.learning / 114) * 100}%` }} />
                                <div className="bg-amber-500" style={{ width: `${(hifzCounts.review / 114) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {meta.surahs.map(s => (
                                    <div key={s.number} className={`rounded-2xl border p-3 flex items-center gap-2 ${theme.card}`}>
                                        <button className="flex-1 min-w-0 text-start" onClick={() => onOpen({ type: 'surah', value: s.number })}>
                                            <span className="font-medium"><span dir="ltr">{s.number}.</span> {language === 'ar' ? s.name : s.englishName}</span>
                                        </button>
                                        <div className="flex gap-1 shrink-0">
                                            {HIFZ_STATUSES.map(st => (
                                                <button
                                                    key={st}
                                                    onClick={() => setHifz(s.number, st)}
                                                    className={`text-[10px] px-2 py-1 rounded-lg border ${hifz[s.number] === st ? STATUS_STYLE[st] : `border-current/15 ${theme.muted}`}`}
                                                >
                                                    {t[STATUS_LABEL[st]]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuranIndex;
