// Common authentic adhkar. `count` = recommended repetitions (used by the tasbih counter).
const ayatAlKursi = {
    id: 'kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    english: 'Ayat al-Kursi (Al-Baqarah 2:255).',
    count: 1,
    source: 'Quran 2:255',
};

const threeQuls = {
    id: 'quls',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    english: 'Recite Surat Al-Ikhlas, Al-Falaq and An-Nas.',
    count: 3,
    source: 'Abu Dawud, Tirmidhi',
};

const bismillah = {
    id: 'bismillah',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    english: 'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
    count: 3,
    source: 'Abu Dawud, Tirmidhi',
};

const sayyidIstighfar = {
    id: 'sayyid',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    english: 'Sayyid al-Istighfar: O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant... so forgive me, for none forgives sins but You.',
    count: 1,
    source: 'Bukhari',
};

const subhanAllahWaBihamdihi = {
    id: 'subhan-bihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    english: 'Glory be to Allah and praise be to Him.',
    count: 100,
    source: 'Muslim',
};

export const adhkar = {
    morning: [
        {
            id: 'asbahna',
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            english: 'We have entered the morning and the dominion belongs to Allah. Praise be to Allah; none has the right to be worshipped but Allah alone, without partner. His is the dominion and His the praise, and He is over all things capable.',
            count: 1,
            source: 'Muslim',
        },
        {
            id: 'bika-asbahna',
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
            english: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.',
            count: 1,
            source: 'Tirmidhi',
        },
        ayatAlKursi,
        sayyidIstighfar,
        bismillah,
        threeQuls,
        subhanAllahWaBihamdihi,
    ],
    evening: [
        {
            id: 'amsayna',
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            english: 'We have entered the evening and the dominion belongs to Allah. Praise be to Allah; none has the right to be worshipped but Allah alone, without partner. His is the dominion and His the praise, and He is over all things capable.',
            count: 1,
            source: 'Muslim',
        },
        {
            id: 'bika-amsayna',
            arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
            english: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the return.',
            count: 1,
            source: 'Tirmidhi',
        },
        ayatAlKursi,
        sayyidIstighfar,
        {
            id: 'kalimat',
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            english: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
            count: 3,
            source: 'Muslim',
        },
        bismillah,
        threeQuls,
        subhanAllahWaBihamdihi,
    ],
    afterPrayer: [
        {
            id: 'istighfar',
            arabic: 'أَسْتَغْفِرُ اللَّهَ',
            english: 'I seek the forgiveness of Allah.',
            count: 3,
            source: 'Muslim',
        },
        {
            id: 'salam',
            arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
            english: 'O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honour.',
            count: 1,
            source: 'Muslim',
        },
        { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', english: 'Glory be to Allah.', count: 33, source: 'Muslim' },
        { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', english: 'Praise be to Allah.', count: 33, source: 'Muslim' },
        { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', english: 'Allah is the Greatest.', count: 33, source: 'Muslim' },
        {
            id: 'tahlil',
            arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            english: 'None has the right to be worshipped but Allah alone, without partner. His is the dominion and His the praise, and He is over all things capable. (Completes the hundred.)',
            count: 1,
            source: 'Muslim',
        },
        { ...ayatAlKursi, id: 'kursi-after' },
    ],
};
