/* eslint-disable react-refresh/only-export-components -- provider + hook live together */
import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getReciter } from '../services/reciters';

// Quran recitation player shared by the whole app, so playback continues after the reader is
// closed (mini player bar) and can be controlled from the lock screen (Media Session API).

const QuranAudioContext = createContext(null);

export const QuranAudioProvider = ({ children }) => {
    const audioRef = useRef(null);
    const preloadRef = useRef(null);
    const [state, setState] = useState({
        queue: [],          // [{ n, s, a, label }]
        index: 0,
        playing: false,
        loading: false,
        reciterId: 'ar.alafasy',
        repeatVerse: 1,     // times each verse is played (0 = forever)
        loopQueue: false,   // start again at the end of the queue / range
        error: null,
    });
    const stateRef = useRef(state);
    stateRef.current = state;
    const repeatsDone = useRef(0);

    const current = state.queue[state.index] || null;
    const reciter = getReciter(state.reciterId);

    // One <audio> element for the app's lifetime
    if (!audioRef.current && typeof Audio !== 'undefined') {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
    }

    const playIndex = useCallback((index, queue = stateRef.current.queue) => {
        const verse = queue[index];
        const audio = audioRef.current;
        if (!verse || !audio) return;
        const r = getReciter(stateRef.current.reciterId);
        audio.src = r.url(verse);
        audio.play().catch(() => setState(s => ({ ...s, playing: false, loading: false })));
        setState(s => ({ ...s, queue, index, playing: true, loading: true, error: null }));

        // Warm up the next verse so playback is gapless
        const next = queue[index + 1];
        if (next) {
            preloadRef.current = new Audio();
            preloadRef.current.preload = 'auto';
            preloadRef.current.src = r.url(next);
        }
    }, []);

    const advance = useCallback(() => {
        const s = stateRef.current;
        if (s.repeatVerse === 0 || repeatsDone.current + 1 < s.repeatVerse) {
            repeatsDone.current += 1;
            playIndex(s.index);
            return;
        }
        repeatsDone.current = 0;
        if (s.index + 1 < s.queue.length) playIndex(s.index + 1);
        else if (s.loopQueue && s.queue.length) playIndex(0);
        else setState(prev => ({ ...prev, playing: false }));
    }, [playIndex]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onEnded = () => advance();
        const onPlaying = () => setState(s => ({ ...s, playing: true, loading: false }));
        const onPause = () => setState(s => ({ ...s, playing: false }));
        const onWaiting = () => setState(s => ({ ...s, loading: true }));
        const onError = () => setState(s => ({ ...s, playing: false, loading: false, error: 'audio' }));
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('error', onError);
        return () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('error', onError);
        };
    }, [advance]);

    /** Play `verses` starting at `startIndex`. */
    const playQueue = useCallback((verses, startIndex = 0, opts = {}) => {
        repeatsDone.current = 0;
        setState(s => ({ ...s, ...opts }));
        stateRef.current = { ...stateRef.current, ...opts };
        playIndex(startIndex, verses);
    }, [playIndex]);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !stateRef.current.queue.length) return;
        if (audio.paused) {
            if (!audio.src) playIndex(stateRef.current.index);
            else audio.play().catch(() => { });
        } else audio.pause();
    }, [playIndex]);

    const next = useCallback(() => {
        const s = stateRef.current;
        repeatsDone.current = 0;
        if (s.index + 1 < s.queue.length) playIndex(s.index + 1);
    }, [playIndex]);

    const prev = useCallback(() => {
        const s = stateRef.current;
        repeatsDone.current = 0;
        playIndex(Math.max(0, s.index - 1));
    }, [playIndex]);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
        setState(s => ({ ...s, queue: [], index: 0, playing: false, loading: false }));
    }, []);

    const setOptions = useCallback((opts) => {
        const changedReciter = opts.reciterId && opts.reciterId !== stateRef.current.reciterId;
        stateRef.current = { ...stateRef.current, ...opts };
        setState(s => ({ ...s, ...opts }));
        if (changedReciter && !audioRef.current?.paused) playIndex(stateRef.current.index);
    }, [playIndex]);

    // Lock-screen / headset controls
    useEffect(() => {
        if (!('mediaSession' in navigator) || !current) return;
        try {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: current.label,
                artist: reciter.name,
                album: 'Quran',
                artwork: [{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }],
            });
            navigator.mediaSession.setActionHandler('play', toggle);
            navigator.mediaSession.setActionHandler('pause', toggle);
            navigator.mediaSession.setActionHandler('nexttrack', next);
            navigator.mediaSession.setActionHandler('previoustrack', prev);
            navigator.mediaSession.setActionHandler('stop', stop);
        } catch { /* not supported */ }
    }, [current, reciter, toggle, next, prev, stop]);

    const value = useMemo(() => ({
        ...state, current, reciter, playQueue, toggle, next, prev, stop, setOptions,
    }), [state, current, reciter, playQueue, toggle, next, prev, stop, setOptions]);

    return <QuranAudioContext.Provider value={value}>{children}</QuranAudioContext.Provider>;
};

export const useQuranAudio = () => useContext(QuranAudioContext);
