import { useState, useEffect } from 'react';
import { Share2, Download, ImageIcon, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { createStoryImage, shareOrDownload, downloadBlob } from '../services/storyImage';

const THEMES = [
    { id: 'emerald', swatch: 'from-emerald-950 via-emerald-800 to-slate-900' },
    { id: 'night', swatch: 'from-indigo-950 via-indigo-800 to-slate-950' },
    { id: 'sunset', swatch: 'from-rose-950 via-orange-900 to-stone-900' },
];

/**
 * Preview + share of a 9:16 story image.
 * content = { arabic, translation, source, kicker, arabicFont, filename }
 */
const StoryShare = ({ content, onClose, t }) => {
    const [theme, setTheme] = useState('emerald');
    const [image, setImage] = useState(null); // { theme, blob, url }
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let url = null;
        createStoryImage({ ...content, theme, footer: `${t.appTitle} · ${window.location.host}` })
            .then(blob => {
                if (cancelled) return;
                url = URL.createObjectURL(blob);
                setImage({ theme, blob, url });
            })
            .catch(() => { });
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [content, theme, t.appTitle]);

    const ready = image?.theme === theme ? image : null;
    const filename = content.filename || 'adhantime-story.png';

    const share = async () => {
        if (!ready) return;
        setBusy(true);
        await shareOrDownload(ready.blob, filename, content.kicker);
        setBusy(false);
    };

    return (
        <Modal title={t.shareStory} icon={ImageIcon} onClose={onClose}>
            <div className="flex flex-col items-center gap-4 pb-2">
                <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/15 bg-slate-800 shadow-2xl">
                    {ready ? (
                        <img src={ready.url} alt={t.shareStory} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/60">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {THEMES.map(th => (
                        <button
                            key={th.id}
                            onClick={() => setTheme(th.id)}
                            aria-label={th.id}
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${th.swatch} border-2 ${theme === th.id ? 'border-emerald-300 scale-110' : 'border-white/20'} transition-transform`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                        onClick={share}
                        disabled={!ready || busy}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                        {t.share}
                    </button>
                    <button
                        onClick={() => ready && downloadBlob(ready.blob, filename)}
                        disabled={!ready}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold disabled:opacity-50"
                    >
                        <Download size={18} />
                        {t.download}
                    </button>
                </div>
                <p className="text-xs text-white/45 text-center">{t.storyHint}</p>
            </div>
        </Modal>
    );
};

export default StoryShare;
