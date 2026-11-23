import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { duas } from '../data/duas';
import { Quote, X, ChevronLeft, ChevronRight, Share2, Copy, Check } from 'lucide-react';
import { toDateKey } from '../utils/dateUtils';

const StoryShare = lazy(() => import('./StoryShare'));

const HIDDEN_KEY = 'adhanTime_duaHiddenOn';

// Same dua for everyone on a given day, changing every day
const dayOfYear = () => {
    const now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};

const DailyDua = ({ language, t }) => {
    const today = toDateKey(new Date());
    const [offset, setOffset] = useState(0);
    const [hidden, setHidden] = useState(() => {
        try { return localStorage.getItem(HIDDEN_KEY) === today; } catch { return false; }
    });
    const [story, setStory] = useState(null);
    const [copied, setCopied] = useState(false);

    if (hidden) return null;

    const index = (((dayOfYear() + offset) % duas.length) + duas.length) % duas.length;
    const dua = duas[index];
    const isAr = language === 'ar';
    const source = isAr ? dua.sourceAr : dua.source;
    const isRTL = isAr;

    const hide = () => {
        setHidden(true);
        try { localStorage.setItem(HIDDEN_KEY, today); } catch { /* private mode */ }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(`${dua.arabic}\n${isAr ? '' : `${dua.english}\n`}— ${source}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard blocked */ }
    };

    const openStory = () => setStory({
        arabic: dua.arabic,
        translation: isAr ? null : dua.english,
        source,
        kicker: offset === 0 ? t.duaOfDay : t.dua,
        arabicFont: "'Amiri', serif",
        filename: `dua-${dua.id}.png`,
    });

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 mb-1"
            >
                <div className="bg-white/10 border border-white/15 rounded-2xl px-4 pt-3 pb-2 relative">
                    <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-emerald-200/80">
                            <Quote size={13} className="text-emerald-400 fill-current" />
                            {offset === 0 ? t.duaOfDay : t.dua}
                            <span dir="ltr" className="text-white/35 normal-case tracking-normal">{index + 1}/{duas.length}</span>
                        </span>
                        <button onClick={hide} className="p-1 text-white/40 hover:text-white rounded-full hover:bg-white/10" aria-label={t.close}>
                            <X size={14} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dua.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col items-center text-center gap-1.5"
                        >
                            <p dir="rtl" className="text-xl leading-loose text-white/95" style={{ fontFamily: 'Amiri, serif' }}>
                                {dua.arabic}
                            </p>
                            {!isAr && <p className="text-xs text-white/65 italic px-2">"{dua.english}"</p>}
                            <p className="text-[11px] text-amber-200/80 tracking-wide">{source}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Browse + actions */}
                    <div className="flex items-center justify-between mt-2" dir="ltr">
                        <button onClick={() => setOffset(o => o - 1)} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10" aria-label={t.previous}>
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                            <button onClick={openStory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs font-semibold">
                                <Share2 size={14} />{t.shareStory}
                            </button>
                            <button onClick={copy} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10" aria-label={t.copy}>
                                {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <button onClick={() => setOffset(o => o + 1)} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10" aria-label={t.next}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            <Suspense fallback={null}>
                <AnimatePresence>
                    {story && <StoryShare content={story} onClose={() => setStory(null)} t={t} />}
                </AnimatePresence>
            </Suspense>
        </>
    );
};

export default DailyDua;
