import { useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { adhkar } from '../data/adhkar';

const TABS = ['morning', 'evening', 'afterPrayer'];
const defaultTab = () => (new Date().getHours() < 14 ? 'morning' : 'evening');

const AdhkarView = ({ onClose, t, language }) => {
    const [tab, setTab] = useState(defaultTab);
    const [counts, setCounts] = useState({}); // `${tab}:${id}` -> taps

    const items = adhkar[tab];
    const doneCount = items.filter(d => (counts[`${tab}:${d.id}`] || 0) >= d.count).length;

    const tap = (d) => {
        const key = `${tab}:${d.id}`;
        setCounts(c => ({ ...c, [key]: Math.min(d.count, (c[key] || 0) + 1) }));
        navigator.vibrate?.(15);
    };

    const reset = () => setCounts(c => Object.fromEntries(Object.entries(c).filter(([k]) => !k.startsWith(`${tab}:`))));

    return (
        <Modal
            title={t.adhkar}
            icon={Sparkles}
            onClose={onClose}
            actions={
                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm">
                    <RotateCcw size={15} /><span className="hidden sm:inline">{t.reset}</span>
                </button>
            }
        >
            <div className="flex gap-2 mb-3 bg-black/20 p-1 rounded-xl">
                {TABS.map(k => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? 'bg-emerald-500/80 text-white' : 'text-white/60 hover:bg-white/10'}`}
                    >
                        {t[k]}
                    </button>
                ))}
            </div>

            <p className="text-xs text-white/50 mb-3 text-center">
                {t.tapToCount} · <span dir="ltr">{doneCount}/{items.length}</span>
            </p>

            <div className="space-y-3 pb-2">
                {items.map(d => {
                    const n = counts[`${tab}:${d.id}`] || 0;
                    const done = n >= d.count;
                    return (
                        <button
                            key={d.id}
                            onClick={() => tap(d)}
                            className={`w-full text-start rounded-2xl p-4 border transition-all active:scale-[0.99] ${done ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <p dir="rtl" className="text-lg leading-loose text-white/95 text-right" style={{ fontFamily: 'Amiri, serif' }}>
                                {d.arabic}
                            </p>
                            {language !== 'ar' && <p className="text-xs text-white/60 mt-2">{d.english}</p>}
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] uppercase tracking-wider text-white/40">{d.source}</span>
                                <span dir="ltr" className={`flex items-center gap-1 text-sm font-bold tabular-nums px-3 py-1 rounded-full ${done ? 'bg-emerald-500/30 text-emerald-100' : 'bg-white/10 text-white/80'}`}>
                                    {done && <CheckCircle2 size={14} />}
                                    {n}/{d.count}
                                </span>
                            </div>
                            {d.count > 1 && (
                                <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden" dir="ltr">
                                    <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(n / d.count) * 100}%` }} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </Modal>
    );
};

export default AdhkarView;
