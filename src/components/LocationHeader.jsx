import { BadgeCheck, Calculator } from 'lucide-react';

const LocationHeader = ({ gregorian, hijri, appTitle, source, t, language }) => {
    const hijriText = hijri
        ? `${hijri.day} ${language === 'ar' ? hijri.monthAr : hijri.monthEn} ${hijri.year}`
        : null;

    return (
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
                {appTitle}
            </h1>
            <p className="text-white/75 text-sm font-light">
                <span>{gregorian}</span>
                {hijriText && <> • <span>{hijriText}</span></>}
            </p>
            {source && (
                <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${source === 'habous'
                        ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                        : 'bg-white/10 border-white/15 text-white/70'}`}
                >
                    {source === 'habous' ? <BadgeCheck size={13} /> : <Calculator size={13} />}
                    {source === 'habous' ? t.sourceHabous : t.sourceAladhan}
                </span>
            )}
        </div>
    );
};

export default LocationHeader;
