import { useState, useEffect, useRef } from 'react';
import { Compass, Navigation } from 'lucide-react';
import Modal from './Modal';

const KAABA = { lat: 21.422487, lng: 39.826206 };
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** Initial great-circle bearing from a point to the Kaaba, degrees clockwise from true North. */
const qiblaBearing = (lat, lng) => {
    const φ1 = rad(lat), φ2 = rad(KAABA.lat), Δλ = rad(KAABA.lng - lng);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (deg(Math.atan2(y, x)) + 360) % 360;
};

const distanceKm = (lat, lng) => {
    const dφ = rad(KAABA.lat - lat), dλ = rad(KAABA.lng - lng);
    const a = Math.sin(dφ / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dλ / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
};

const QiblaView = ({ onClose, coordinates, t }) => {
    const hasLocation = Boolean(coordinates.lat && coordinates.lng);
    const bearing = hasLocation ? qiblaBearing(Number(coordinates.lat), Number(coordinates.lng)) : null;
    const [heading, setHeading] = useState(null);       // smoothed device heading (unwrapped degrees), or null
    const [status, setStatus] = useState('idle');       // idle | active | unsupported
    const [accuracy, setAccuracy] = useState(null);     // iOS compass accuracy in degrees (lower is better)
    const cleanup = useRef(null);

    useEffect(() => () => cleanup.current?.(), []);

    const startCompass = async () => {
        // iOS (and recent Chrome versions) expose requestPermission. Its answer is not reliable on
        // every browser, so we always listen and let the 3-second timeout decide if a compass exists.
        try {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                await DeviceOrientationEvent.requestPermission();
            }
        } catch { /* permission prompt unavailable: keep listening anyway */ }
        cleanup.current?.();

        let got = false;
        let smooth = null;
        const onOrient = (e) => {
            let h = null;
            if (typeof e.webkitCompassHeading === 'number') {
                h = e.webkitCompassHeading;                                   // iOS: already a compass heading
                setAccuracy(typeof e.webkitCompassAccuracy === 'number' ? e.webkitCompassAccuracy : null);
            } else if (e.absolute && typeof e.alpha === 'number') {
                h = 360 - e.alpha;                                            // Android: alpha is counter-clockwise from North
                // alpha is relative to the device's natural orientation: compensate for landscape
                h += (screen.orientation?.angle ?? window.orientation ?? 0);
            }
            if (h === null || Number.isNaN(h)) return;
            h = ((h % 360) + 360) % 360;
            // Low-pass filter on the circle so the dial does not jitter (and wraps 359 -> 0 correctly)
            // `smooth` is kept unwrapped (can go past 360) so the dial never spins the long way round
            if (smooth === null) smooth = h;
            else {
                const delta = ((h - (((smooth % 360) + 360) % 360) + 540) % 360) - 180;
                smooth += delta * 0.25;
            }
            got = true;
            setHeading(smooth);
            setStatus('active');
        };
        const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        window.addEventListener(evt, onOrient, true);
        const timer = setTimeout(() => { if (!got) setStatus('unsupported'); }, 3000);
        cleanup.current = () => { window.removeEventListener(evt, onOrient, true); clearTimeout(timer); };
    };

    const dialRotation = heading === null ? 0 : -heading;                 // unwrapped: smooth CSS transition
    const headingDeg = heading === null ? null : ((heading % 360) + 360) % 360;
    const diff = headingDeg === null || bearing === null ? null : Math.abs(((bearing - headingDeg + 540) % 360) - 180);
    const facing = diff !== null && diff < 5;
    const wasFacing = useRef(false);
    useEffect(() => {
        if (facing && !wasFacing.current) navigator.vibrate?.(60);
        wasFacing.current = facing;
    }, [facing]);

    return (
        <Modal title={t.qibla} icon={Compass} onClose={onClose}>
            {!hasLocation ? (
                <p className="text-center text-white/60 py-10">{t.needLocation}</p>
            ) : (
                <div className="flex flex-col items-center gap-5 py-2">
                    <div dir="ltr" className="relative w-64 h-64">
                        {/* Dial: rotates so N points to real North when the compass is active */}
                        <div
                            className={`absolute inset-0 rounded-full border-4 transition-colors ${facing ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]' : 'border-white/20'} bg-white/5`}
                            style={{ transform: `rotate(${dialRotation}deg)`, transition: 'transform 0.2s linear' }}
                        >
                            {['N', 'E', 'S', 'W'].map((d, i) => (
                                <span
                                    key={d}
                                    className={`absolute left-1/2 top-1/2 text-sm font-bold ${d === 'N' ? 'text-red-400' : 'text-white/60'}`}
                                    style={{ transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-112px) rotate(${-i * 90}deg)` }}
                                >
                                    {d}
                                </span>
                            ))}
                            {/* Qibla arrow at its bearing on the dial */}
                            <div className="absolute left-1/2 top-1/2 w-0 h-0" style={{ transform: `rotate(${bearing}deg)` }}>
                                <div className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center" style={{ top: 0 }}>
                                    <span className="text-2xl -mb-1">🕋</span>
                                    <div className={`w-1.5 h-20 rounded-full ${facing ? 'bg-emerald-400' : 'bg-amber-300'}`} />
                                </div>
                            </div>
                        </div>
                        {/* Fixed marker = top of the phone */}
                        <Navigation className="absolute left-1/2 -top-4 -translate-x-1/2 text-white fill-white" size={22} />
                    </div>

                    <div className="text-center">
                        <p className="text-white/60 text-sm">{t.qiblaDirection}</p>
                        <p className="text-3xl font-bold" dir="ltr">{bearing.toFixed(1)}°</p>
                        <p className="text-white/50 text-xs">{t.fromNorth}</p>
                        <p className="text-white/50 text-xs mt-2">
                            {t.distanceToKaaba}: <span dir="ltr">{Math.round(distanceKm(Number(coordinates.lat), Number(coordinates.lng))).toLocaleString('en')} km</span>
                        </p>
                    </div>

                    {facing && <p className="text-emerald-300 font-semibold">{t.facingQibla}</p>}

                    {(status === 'idle' || status === 'unsupported') && (
                        <button onClick={startCompass} className="px-5 py-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 font-semibold">
                            {t.enableCompass}
                        </button>
                    )}
                    {status === 'active' && <p className="text-xs text-white/50 text-center">{t.compassHint}</p>}
                    {status === 'active' && (accuracy === null ? false : accuracy < 0 || accuracy > 25) && (
                        <p className="text-xs text-amber-200 text-center max-w-xs">{t.calibrateHint}</p>
                    )}
                    {status === 'unsupported' && <p className="text-xs text-white/60 text-center max-w-xs">{t.compassUnsupported}</p>}
                </div>
            )}
        </Modal>
    );
};

export default QiblaView;
