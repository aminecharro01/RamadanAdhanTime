import { Cloud, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

const WeatherCard = ({ weather, bgLabel }) => {
    if (!weather) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 glass-card p-6 flex items-center justify-between w-full max-w-sm mx-auto"
        >
            <div className="flex flex-col">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
                    {bgLabel || "Current Weather"}
                </span>
                <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-white">
                        {Math.round(weather.temp)}°
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm text-white/90 font-medium capitalize">
                            {weather.description}
                        </span>
                        <span className="text-xs text-white/50">
                            {weather.city}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-1 p-1.5 bg-white/5 rounded-lg border border-white/5">
                    <Droplets className="w-3 h-3 text-blue-300" />
                    <span className="text-xs text-white/80 font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-1 p-1.5 bg-white/5 rounded-lg border border-white/5">
                    <Wind className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-white/80 font-medium">{weather.wind} <span className="text-[9px]">km/h</span></span>
                </div>
            </div>
        </motion.div>
    );
};

export default WeatherCard;
