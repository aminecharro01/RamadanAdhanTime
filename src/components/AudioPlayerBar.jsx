import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, X, Repeat, Repeat1, Loader2 } from 'lucide-react';
import { useQuranAudio } from '../context/QuranAudio';

/** Mini player for Quran recitation; stays visible across the app while a queue is active. */
const AudioPlayerBar = ({ language }) => {
    const audio = useQuranAudio();
    const visible = audio.queue.length > 0;
    const isRTL = language === 'ar';

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-md"
                >
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl px-3 py-2 text-white">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{audio.current?.label}</p>
                            <p className="text-[11px] text-white/50 truncate flex items-center gap-1.5">
                                {isRTL ? audio.reciter.nameAr : audio.reciter.name}
                                {audio.repeatVerse !== 1 && <span className="flex items-center gap-0.5 text-emerald-300" dir="ltr"><Repeat1 size={11} />{audio.repeatVerse === 0 ? '∞' : `×${audio.repeatVerse}`}</span>}
                                {audio.loopQueue && <Repeat size={11} className="text-emerald-300" />}
                                {audio.error && <span className="text-red-300">⚠</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" dir="ltr">
                            <button onClick={audio.prev} className="p-2 rounded-full hover:bg-white/10" aria-label="Previous verse"><SkipBack size={18} /></button>
                            <button onClick={audio.toggle} className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600" aria-label={audio.playing ? 'Pause' : 'Play'}>
                                {audio.loading && audio.playing ? <Loader2 size={18} className="animate-spin" /> : audio.playing ? <Pause size={18} /> : <Play size={18} />}
                            </button>
                            <button onClick={audio.next} className="p-2 rounded-full hover:bg-white/10" aria-label="Next verse"><SkipForward size={18} /></button>
                            <button onClick={audio.stop} className="p-2 rounded-full hover:bg-white/10 text-white/60" aria-label="Stop"><X size={18} /></button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AudioPlayerBar;
