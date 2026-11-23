// Renders a 1080x1920 (9:16) story image for a dua or a verse, ready for Instagram/WhatsApp stories.

const W = 1080;
const H = 1920;
const PAD = 110;

const THEMES = {
    emerald: ['#022c22', '#064e3b', '#0f172a'],
    night: ['#0b1026', '#1e1b4b', '#020617'],
    sunset: ['#3b0d2e', '#7c2d12', '#1c1917'],
};

/** Splits text into lines that fit `maxWidth` with the current ctx font. */
const wrap = (ctx, text, maxWidth) => {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
};

/** Largest font size (from `max` down to `min`) whose wrapped text fits in `maxHeight`. */
const fit = (ctx, text, { family, weight = 400, max, min, maxWidth, maxHeight, lineHeight }) => {
    for (let size = max; size >= min; size -= 2) {
        ctx.font = `${weight} ${size}px ${family}`;
        const lines = wrap(ctx, text, maxWidth);
        if (lines.length * size * lineHeight <= maxHeight) return { size, lines };
    }
    ctx.font = `${weight} ${min}px ${family}`;
    return { size: min, lines: wrap(ctx, text, maxWidth) };
};

/** Faint eight-pointed stars, a classic Islamic geometric motif. */
const drawPattern = (ctx) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    const step = 180;
    for (let y = -step / 2; y < H + step; y += step) {
        for (let x = ((y / step) % 2 ? step / 2 : 0) - step / 2; x < W + step; x += step) {
            const r = 46;
            for (const rot of [0, Math.PI / 4]) {
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const a = rot + (i * Math.PI) / 2;
                    const px = x + r * Math.cos(a);
                    const py = y + r * Math.sin(a);
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
    ctx.restore();
};

const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

/**
 * @param {object} o
 * @param {string} o.arabic       main Arabic text
 * @param {string} [o.translation]
 * @param {string} o.source       e.g. "Quran 2:201" / "Muslim"
 * @param {string} o.kicker       small title, e.g. "Dua of the day"
 * @param {string} [o.arabicFont] CSS font family for the Arabic text
 * @param {string} [o.footer]     app name / link shown at the bottom
 * @param {'emerald'|'night'|'sunset'} [o.theme]
 * @returns {Promise<Blob>} PNG image
 */
export const createStoryImage = async ({ arabic, translation, source, kicker, arabicFont = "'Amiri', serif", footer = '', theme = 'emerald' }) => {
    const family = arabicFont;
    // Make sure the web fonts are ready before drawing (canvas does not wait for them)
    try {
        await Promise.all([
            document.fonts.load(`700 80px ${family}`, arabic.slice(0, 30)),
            document.fonts.load(`400 40px ${family}`, arabic.slice(0, 30)),
            document.fonts.load(`600 40px "Amiri"`),
        ]);
    } catch { /* draw with fallback fonts */ }

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    const [c1, c2, c3] = THEMES[theme] || THEMES.emerald;
    const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
    bg.addColorStop(0, c1);
    bg.addColorStop(0.55, c2);
    bg.addColorStop(1, c3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.42, W * 0.9);
    glow.addColorStop(0, 'rgba(52,211,153,0.18)');
    glow.addColorStop(1, 'rgba(52,211,153,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    drawPattern(ctx);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Kicker
    ctx.fillStyle = 'rgba(167,243,208,0.95)';
    ctx.font = `600 40px "Amiri", system-ui, sans-serif`;
    ctx.fillText(kicker, W / 2, 230);
    ctx.fillStyle = 'rgba(251,191,36,0.9)';
    ctx.font = `400 46px serif`;
    ctx.fillText('۞', W / 2, 300);

    // Card
    const cardX = PAD - 30;
    const cardY = 380;
    const cardW = W - 2 * cardX;
    const cardH = 1240;
    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 56);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    const innerW = cardW - 140;
    const arabicMaxH = translation ? 690 : 1000;
    ctx.direction = 'rtl';
    const ar = fit(ctx, arabic, { family, weight: 400, max: 84, min: 40, maxWidth: innerW, maxHeight: arabicMaxH, lineHeight: 1.75 });

    let tr = null;
    if (translation) {
        ctx.direction = 'ltr';
        tr = fit(ctx, translation, { family: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', weight: 400, max: 40, min: 26, maxWidth: innerW, maxHeight: 1060 - ar.lines.length * ar.size * 1.75, lineHeight: 1.45 });
    }

    const arH = ar.lines.length * ar.size * 1.75;
    const trH = tr ? 60 + tr.lines.length * tr.size * 1.45 : 0;
    const sourceH = 110;
    let y = cardY + (cardH - (arH + trH + sourceH)) / 2;

    ctx.direction = 'rtl';
    ctx.fillStyle = '#ffffff';
    ctx.font = `400 ${ar.size}px ${family}`;
    for (const line of ar.lines) {
        ctx.fillText(line, W / 2, y + (ar.size * 1.75) / 2);
        y += ar.size * 1.75;
    }

    if (tr) {
        y += 30;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(W / 2 - 80, y, 160, 3);
        y += 30;
        ctx.direction = 'ltr';
        ctx.fillStyle = 'rgba(226,232,240,0.88)';
        ctx.font = `400 ${tr.size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
        for (const line of tr.lines) {
            ctx.fillText(line, W / 2, y + (tr.size * 1.45) / 2);
            y += tr.size * 1.45;
        }
    }

    // Source
    y += 60;
    ctx.direction = /[؀-ۿ]/.test(source) ? 'rtl' : 'ltr';
    ctx.fillStyle = 'rgba(251,191,36,0.95)';
    ctx.font = `600 38px "Amiri", system-ui, sans-serif`;
    ctx.fillText(source, W / 2, y);

    // Footer
    ctx.direction = 'ltr';
    if (footer) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = `600 36px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(footer, W / 2, H - 170);
    }

    return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
};

/**
 * Shares the image with the native share sheet (Instagram, WhatsApp...) when supported,
 * otherwise downloads it. Returns 'shared' | 'downloaded' | 'cancelled'.
 */
export const shareOrDownload = async (blob, filename, title) => {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title });
            return 'shared';
        } catch (e) {
            if (e?.name === 'AbortError') return 'cancelled';
        }
    }
    downloadBlob(blob, filename);
    return 'downloaded';
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
};
