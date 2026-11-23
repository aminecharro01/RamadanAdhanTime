// Verse-by-verse recitations. Hafs files are numbered by absolute verse (1..6236),
// everyayah.com Warsh files by surah+verse (SSSAAA.mp3). All URLs were checked to exist.
const pad3 = (x) => String(x).padStart(3, '0');
const islamicNetwork = (bitrate, id) => (v) => `https://cdn.islamic.network/quran/audio/${bitrate}/${id}/${v.n}.mp3`;
const everyAyah = (folder) => (v) => `https://everyayah.com/data/${folder}/${pad3(v.s)}${pad3(v.a)}.mp3`;

export const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Alafasy', nameAr: 'مشاري العفاسي', riwaya: 'hafs', url: islamicNetwork(128, 'ar.alafasy') },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', riwaya: 'hafs', url: islamicNetwork(128, 'ar.husary') },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', nameAr: 'محمد صديق المنشاوي', riwaya: 'hafs', url: islamicNetwork(128, 'ar.minshawi') },
    { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', nameAr: 'عبد الباسط عبد الصمد', riwaya: 'hafs', url: islamicNetwork(192, 'ar.abdulbasitmurattal') },
    { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', nameAr: 'ماهر المعيقلي', riwaya: 'hafs', url: islamicNetwork(128, 'ar.mahermuaiqly') },
    { id: 'warsh.aldosary', name: 'Ibrahim Al-Dosary (Warsh)', nameAr: 'إبراهيم الدوسري (ورش)', riwaya: 'warsh', url: everyAyah('warsh/warsh_ibrahim_aldosary_128kbps') },
    { id: 'warsh.jazaery', name: 'Yassin Al-Jazaery (Warsh)', nameAr: 'ياسين الجزائري (ورش)', riwaya: 'warsh', url: everyAyah('warsh/warsh_yassin_al_jazaery_64kbps') },
];

export const getReciter = (id) => RECITERS.find(r => r.id === id) || RECITERS[0];

/** Default reciter matching a riwaya. */
export const defaultReciterFor = (riwaya) => RECITERS.find(r => r.riwaya === riwaya) || RECITERS[0];
