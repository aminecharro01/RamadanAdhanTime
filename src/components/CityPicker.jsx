import { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MapPin, Search, LocateFixed, Clock, Check, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import { cities, LOCAL_LOCATION } from '../data/cities';

// Lowercase, strip Latin accents and Arabic diacritics, unify Arabic letter variants.
const normalize = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^a-z0-9؀-ۿ]+/g, ' ')
    .trim();

const searchIndex = cities
    .filter(c => c.id !== LOCAL_LOCATION.id)
    .map(c => ({ city: c, key: `${normalize(c.name)} ${normalize(c.nameAr)}` }));

const CityPicker = ({ selectedCity, displayName, recentIds, onSelect, t, language }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const label = (c) => (language === 'ar' && c.nameAr ? c.nameAr : c.name);

    const results = useMemo(() => {
        const q = normalize(query);
        if (!q) return null;
        const words = q.split(' ');
        return searchIndex
            .filter(({ key }) => words.every(w => key.includes(w)))
            .sort((a, b) => {
                // names starting with the query first
                const as = a.key.startsWith(q) || normalize(a.city.nameAr).startsWith(q) ? 0 : 1;
                const bs = b.key.startsWith(q) || normalize(b.city.nameAr).startsWith(q) ? 0 : 1;
                return as - bs;
            })
            .map(r => r.city);
    }, [query]);

    const recent = recentIds.map(id => cities.find(c => c.id === id)).filter(Boolean);
    const sortedAll = useMemo(
        () => [...searchIndex.map(s => s.city)].sort((a, b) => label(a).localeCompare(label(b), language)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [language]
    );

    const choose = (city) => {
        onSelect(city);
        setOpen(false);
        setQuery('');
    };

    const renderRow = (city, Icon = MapPin) => (
        <button
            key={city.id}
            onClick={() => choose(city)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-colors ${selectedCity.id === city.id ? 'bg-emerald-500/20 text-emerald-200' : 'hover:bg-white/10'}`}
        >
            <Icon size={16} className="text-white/50 shrink-0" />
            <span className="flex-1 truncate">{label(city)}</span>
            {city.id !== LOCAL_LOCATION.id && (
                <span className="text-xs text-white/40 truncate">{language === 'ar' ? city.name : city.nameAr}</span>
            )}
            {selectedCity.id === city.id && <Check size={16} className="text-emerald-400 shrink-0" />}
        </button>
    );

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 max-w-[55vw] sm:max-w-xs bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm rounded-full ps-3 pe-3 py-2 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                aria-haspopup="dialog"
            >
                {selectedCity.id === LOCAL_LOCATION.id
                    ? <LocateFixed className="h-4 w-4 text-emerald-300 shrink-0" />
                    : <MapPin className="h-4 w-4 text-white/70 shrink-0" />}
                <span className="truncate">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-white/70 shrink-0" />
            </button>

            <AnimatePresence>
                {open && (
                    <Modal title={t.allCities} icon={MapPin} onClose={() => setOpen(false)}>
                        <div className="relative mb-3">
                            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-white/40" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t.searchCity}
                                className="w-full bg-white/10 border border-white/15 rounded-xl ps-9 pe-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                            />
                        </div>

                        {results ? (
                            results.length ? (
                                <div className="space-y-1">{results.map(c => renderRow(c))}</div>
                            ) : (
                                <p className="text-center text-white/50 py-8">{t.noResults}</p>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    {renderRow(LOCAL_LOCATION, LocateFixed)}
                                </div>
                                {recent.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-white/40 px-3 mb-1">{t.recent}</p>
                                        <div className="space-y-1">{recent.map(c => renderRow(c, Clock))}</div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-white/40 px-3 mb-1">{t.allCities}</p>
                                    <div className="space-y-1">{sortedAll.map(c => renderRow(c))}</div>
                                </div>
                            </div>
                        )}
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
};

export default CityPicker;
