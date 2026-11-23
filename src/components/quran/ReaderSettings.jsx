import { useState, useEffect } from 'react';
import { Settings2, Download, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '../Modal';
import { QURAN_FONTS } from '../../hooks/useQuranStore';
import { RECITERS, defaultReciterFor } from '../../services/reciters';
import { TEXT_EDITIONS, isStored, loadText, loadMeta } from '../../services/quranData';

const Row = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <p className="text-sm text-white/70">{label}</p>
        {children}
        {hint && <p className="text-xs text-white/45">{hint}</p>}
    </div>
);

const Choice = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-1 bg-black/20 p-1 rounded-xl">
        {options.map(o => (
            <button
                key={String(o.value)}
                onClick={() => onChange(o.value)}
                className={`flex-1 min-w-[3rem] py-1.5 px-2 rounded-lg text-sm transition-colors ${value === o.value ? 'bg-emerald-500/80 text-white' : 'text-white/60 hover:bg-white/10'}`}
                style={o.style}
            >
                {o.label}
            </button>
        ))}
    </div>
);

const OFFLINE_ITEMS = ['hafs', 'warsh', 'search', 'en', 'fr', 'tafsir'];

const OfflineDownloads = ({ t }) => {
    const [status, setStatus] = useState({}); // id -> 'saved' | 'loading' | 'error'

    useEffect(() => {
        let cancelled = false;
        Promise.all(OFFLINE_ITEMS.map(async id => [id, await isStored(id)])).then(entries => {
            if (!cancelled) setStatus(Object.fromEntries(entries.filter(([, ok]) => ok).map(([id]) => [id, 'saved'])));
        });
        return () => { cancelled = true; };
    }, []);

    const download = async (id) => {
        setStatus(s => ({ ...s, [id]: 'loading' }));
        try {
            if (id === 'hafs') await loadMeta();
            await loadText(id);
            setStatus(s => ({ ...s, [id]: 'saved' }));
        } catch {
            setStatus(s => ({ ...s, [id]: 'error' }));
        }
    };

    const downloadAll = () => OFFLINE_ITEMS.filter(id => status[id] !== 'saved').reduce((p, id) => p.then(() => download(id)), Promise.resolve());

    return (
        <div className="space-y-2">
            {OFFLINE_ITEMS.map(id => (
                <div key={id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-white/80 truncate">{TEXT_EDITIONS[id].label}</span>
                    <span className="flex items-center gap-2 shrink-0">
                        <span className="text-white/40 text-xs" dir="ltr">~{TEXT_EDITIONS[id].sizeKb} KB</span>
                        {status[id] === 'saved' ? (
                            <span className="flex items-center gap-1 text-emerald-300 text-xs"><CheckCircle2 size={14} />{t.qDownloaded}</span>
                        ) : status[id] === 'loading' ? (
                            <Loader2 size={16} className="animate-spin text-white/60" />
                        ) : (
                            <button onClick={() => download(id)} className={`p-1.5 rounded-lg hover:bg-white/10 ${status[id] === 'error' ? 'text-red-300' : 'text-white/70'}`} aria-label={t.qDownload}>
                                <Download size={16} />
                            </button>
                        )}
                    </span>
                </div>
            ))}
            <button onClick={downloadAll} className="w-full mt-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm flex items-center justify-center gap-2">
                <Download size={15} />{t.qDownload} · <span dir="ltr">~2.4 MB</span>
            </button>
        </div>
    );
};

const ReaderSettings = ({ onClose, prefs, update, audio, t, language }) => {
    const reciters = RECITERS.filter(r => r.riwaya === prefs.riwaya);

    const setRiwaya = (riwaya) => {
        const reciterId = defaultReciterFor(riwaya).id;
        update({ riwaya, reciterId, font: riwaya === 'warsh' && prefs.font === 'amiri-quran' ? 'scheherazade' : prefs.font });
        audio.setOptions({ reciterId });
    };

    const setReciter = (reciterId) => {
        update({ reciterId });
        audio.setOptions({ reciterId });
    };

    const setRepeat = (repeatVerse) => {
        update({ repeatVerse });
        audio.setOptions({ repeatVerse });
    };

    return (
        <Modal title={t.qSettings} icon={Settings2} onClose={onClose}>
            <div className="space-y-5 pb-2">
                <Row label={t.qRiwaya} hint={prefs.riwaya === 'warsh' ? t.qWarshNote : null}>
                    <Choice value={prefs.riwaya} onChange={setRiwaya} options={[{ value: 'hafs', label: t.qHafs }, { value: 'warsh', label: t.qWarsh }]} />
                </Row>

                <Row label={t.qLayout}>
                    <Choice value={prefs.mode} onChange={(mode) => update({ mode })} options={[{ value: 'flow', label: t.qFlow }, { value: 'mushaf', label: t.qMushaf }]} />
                </Row>

                <Row label={t.qFont}>
                    <Choice
                        value={prefs.font}
                        onChange={(font) => update({ font })}
                        options={Object.entries(QURAN_FONTS).map(([value, f]) => ({ value, label: 'بسم الله', style: { fontFamily: f.css, fontSize: '1.05rem' } }))}
                    />
                    <p className="text-xs text-white/45">{QURAN_FONTS[prefs.font]?.label}</p>
                </Row>

                <Row label={t.qTheme}>
                    <Choice value={prefs.theme} onChange={(theme) => update({ theme })} options={[{ value: 'dark', label: t.qDark }, { value: 'sepia', label: t.qSepia }, { value: 'light', label: t.qLight }]} />
                </Row>

                <Row label={t.qFontSize}>
                    <div className="flex items-center gap-3" dir="ltr">
                        <span className="text-xs">A</span>
                        <input type="range" min="20" max="64" step="2" value={prefs.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="flex-1 accent-emerald-400" />
                        <span className="text-lg">A</span>
                        <span className="text-xs text-white/50 w-8 text-end">{prefs.fontSize}</span>
                    </div>
                </Row>

                <Row label={t.qTranslation}>
                    <Choice value={prefs.translation} onChange={(translation) => update({ translation })} options={[{ value: 'none', label: t.qNone }, { value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }]} />
                </Row>

                <Row label={t.qReciter}>
                    <select
                        value={prefs.reciterId}
                        onChange={(e) => setReciter(e.target.value)}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-sm"
                    >
                        {reciters.map(r => <option key={r.id} value={r.id} className="bg-slate-800">{language === 'ar' ? r.nameAr : r.name}</option>)}
                    </select>
                </Row>

                <Row label={t.qRepeatVerse}>
                    <Choice value={prefs.repeatVerse} onChange={setRepeat} options={[1, 2, 3, 5, 10, 0].map(n => ({ value: n, label: <span dir="ltr">{n === 0 ? t.qForever : `×${n}`}</span> }))} />
                </Row>

                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                    <span className="text-white/85">{t.qKeepAwake}</span>
                    <input type="checkbox" checked={prefs.keepAwake} onChange={(e) => update({ keepAwake: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
                </label>

                <Row label={t.qOffline} hint={t.qOfflineHint}>
                    <OfflineDownloads t={t} />
                </Row>
            </div>
        </Modal>
    );
};

export default ReaderSettings;
