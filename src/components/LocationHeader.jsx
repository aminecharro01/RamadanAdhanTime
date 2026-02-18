import { MapPin } from 'lucide-react';

const LocationHeader = ({ city, date, hijriRaw, appTitle }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-medium text-white/90 tracking-wide">
                    {city || "Locating..."}
                </span>
            </div>

            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
                    {appTitle || "AdhanTime"}
                </h1>
                <p className="text-white/70 text-sm mt-1 font-light">
                    {date} • {hijriRaw?.day} {hijriRaw?.month?.en} {hijriRaw?.year}
                </p>
            </div>
        </div>
    );
};

export default LocationHeader;
