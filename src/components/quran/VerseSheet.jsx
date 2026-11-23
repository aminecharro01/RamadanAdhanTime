import { useState, useEffect } from 'react';
import { BookOpenText, Play, Repeat, BookmarkPlus, BookmarkCheck, Heart, Copy, Share2, Check, Flag } from 'lucide-react';
import Modal from '../Modal';
import { loadText } from '../../services/quranData';

const Action = ({ icon: Icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[11px] transition-colors ${active ? 'bg-emerald-500/25 text-emerald-100' : 'bg-white/5 hover:bg-white/10 text-white/80'}`}
    >
        <Icon size={18} className={active ? 'text-emerald-300' : ''} />
        <span className="leading-tight text-center">{label}</span>
    </button>
);

const VerseSheet = ({ verse, surah, arabic, translation, fontCss, bookmarks, onPlayFromHere, onLoop, onMarkRead, onClose, t, language }) => {
    const [tafsir, setTafsir] = useState({ n: null, text: null, error: false });
    const [loopEnd, setLoopEnd] = useState(Math.min(surah.count, verse.a + 4));
    const [copied, setCopied] = useState(false);
    const bookmark = bookmarks.find('bookmark', verse.s, verse.a);
    const favorite = bookmarks.find('favorite', verse.s, verse.a);
    const [note, setNote] = useState(bookmark?.note || '');

    useEffect(() => {
        let cancelled = false;
        loadText('tafsir')
            .then(({ text }) => !cancelled && setTafsir({ n: verse.n, text: text[verse.n - 1], error: false }))
            .catch(() => !cancelled && setTafsir({ n: verse.n, text: null, error: true }));
        return () => { cancelled = true; };
    }, [verse.n]);

    const ref = `${language === 'ar' ? surah.name : surah.englishName} ${verse.s}:${verse.a}`;
    const shareText = `${arabic}\n${translation ? `${translation}\n` : ''}— ${ref}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard blocked */ }
    };

    const share = () => navigator.share?.({ text: shareText }).catch(() => { });

    const saveNote = () => {
        if (note.trim() || bookmark) bookmarks.setNote('bookmark', verse.s, verse.a, note.trim());
    };

    return (
        <Modal title={ref} icon={BookOpenText} onClose={() => { saveNote(); onClose(); }}>
            <div className="space-y-4 pb-2">
                <p dir="rtl" className="text-2xl leading-loose text-right text-white/95" style={{ fontFamily: fontCss }}>
                    {arabic}
                </p>
                {translation && <p className="text-sm text-white/70 leading-relaxed" dir={language === 'ar' ? 'ltr' : undefined}>{translation}</p>}

                <div className="grid grid-cols-4 gap-2">
                    <Action icon={Play} label={t.qPlayFromHere} onClick={onPlayFromHere} />
                    <Action icon={Flag} label={t.qMarkRead} onClick={onMarkRead} />
                    <Action
                        icon={bookmark ? BookmarkCheck : BookmarkPlus}
                        label={t.qBookmark}
                        active={Boolean(bookmark)}
                        onClick={() => bookmarks.toggle('bookmark', verse.s, verse.a)}
                    />
                    <Action icon={Heart} label={t.qFavorite} active={Boolean(favorite)} onClick={() => bookmarks.toggle('favorite', verse.s, verse.a)} />
                    <Action icon={copied ? Check : Copy} label={copied ? t.qCopied : t.qCopy} onClick={copy} />
                    {typeof navigator !== 'undefined' && navigator.share && <Action icon={Share2} label={t.qShare} onClick={share} />}
                </div>

                <div className="rounded-xl bg-white/5 p-3 space-y-2">
                    <p className="text-sm text-white/70 flex items-center gap-2"><Repeat size={15} />{t.qLoopRange}</p>
                    <div className="flex items-center gap-2" dir="ltr">
                        <span className="text-sm text-white/60">{verse.a} →</span>
                        <input
                            type="number"
                            min={verse.a}
                            max={surah.count}
                            value={loopEnd}
                            onChange={(e) => setLoopEnd(Math.max(verse.a, Math.min(surah.count, Number(e.target.value) || verse.a)))}
                            className="w-20 bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-sm"
                        />
                        <button onClick={() => onLoop(loopEnd)} className="ms-auto px-3 py-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-sm font-medium">
                            {t.qStartLoop}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <p className="text-sm text-white/70">{t.qNote}</p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={saveNote}
                        rows={2}
                        placeholder={t.qNotePlaceholder}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-sm font-semibold text-emerald-300 mb-2">{t.qTafsir}</p>
                    {tafsir.n !== verse.n ? (
                        <p className="text-sm text-white/50">{t.qTafsirLoading}</p>
                    ) : tafsir.error ? (
                        <p className="text-sm text-white/50">{t.qLoadError}</p>
                    ) : (
                        <p dir="rtl" className="text-right text-white/85 leading-loose" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>{tafsir.text}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default VerseSheet;
