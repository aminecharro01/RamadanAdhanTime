export const cities = [
    { name: "Local Location", nameAr: "موقعي الحالي", lat: null, lng: null }, // Special option for auto-geolocation
    { name: "Rabat", nameAr: "الرباط", lat: 34.020882, lng: -6.841650 },
    { name: "Casablanca", nameAr: "الدار البيضاء", lat: 33.573110, lng: -7.589843 },
    { name: "Fes", nameAr: "فاس", lat: 34.033130, lng: -5.000280 },
    { name: "Tangier", nameAr: "طنجة", lat: 35.759465, lng: -5.833954 },
    { name: "Marrakech", nameAr: "مراكش", lat: 31.629472, lng: -7.981084 },
    { name: "Agadir", nameAr: "أكادير", lat: 30.427755, lng: -9.598107 },
    { name: "Meknes", nameAr: "مكناس", lat: 33.893520, lng: -5.547270 },
    { name: "Oujda", nameAr: "وجدة", lat: 34.680000, lng: -1.900000 },
    { name: "Kenitra", nameAr: "القنيطرة", lat: 34.250000, lng: -6.583333 },
    { name: "Tetouan", nameAr: "تطوان", lat: 35.578450, lng: -5.368370 },
    { name: "Safi", nameAr: "آسفي", lat: 32.299390, lng: -9.237180 },
    { name: "El Jadida", nameAr: "الجديدة", lat: 33.256530, lng: -8.508540 },
    { name: "Nador", nameAr: "الناظور", lat: 35.166667, lng: -2.933333 },
    { name: "Beni Mellal", nameAr: "بني ملال", lat: 32.339444, lng: -6.360833 },
    { name: "Mohammedia", nameAr: "المحمدية", lat: 33.686070, lng: -7.382980 },
    { name: "Taza", nameAr: "تازة", lat: 34.210000, lng: -4.010000 },
    { name: "Khouribga", nameAr: "خريبكة", lat: 32.883333, lng: -6.916667 },
    { name: "Settat", nameAr: "سطات", lat: 33.000000, lng: -7.616667 },
    { name: "Errachidia", nameAr: "الرشيدية", lat: 31.931440, lng: -4.426640 },
    { name: "Larache", nameAr: "العرائش", lat: 35.183333, lng: -6.150000 },
    { name: "Khemisset", nameAr: "الخميسات", lat: 33.833333, lng: -6.066667 },
    { name: "Guelmim", nameAr: "كلميم", lat: 28.986960, lng: -10.057380 },
    { name: "Berrechid", nameAr: "برشيد", lat: 33.266667, lng: -7.583333 },
    { name: "Ouarzazate", nameAr: "ورزازات", lat: 30.916667, lng: -6.916667 },
    { name: "Laayoune", nameAr: "العيون", lat: 27.125287, lng: -13.162500 },
    { name: "Dakhla", nameAr: "الداخلة", lat: 23.704120, lng: -15.952980 }
].sort((a, b) => {
    // Keep "Local Location" at the top, sort others alphabetically
    if (a.lat === null) return -1;
    if (b.lat === null) return 1;
    return a.name.localeCompare(b.name);
});
