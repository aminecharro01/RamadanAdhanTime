import axios from 'axios';

const date = '19-02-2026';
const coordinates = { lat: 33.5731, lng: -7.5898 }; // Casablanca

async function checkAdjustment(adj) {
    try {
        const timestamp = Date.now();
        const response = await axios.get(`https://api.aladhan.com/v1/timings/${date}?latitude=${coordinates.lat}&longitude=${coordinates.lng}&method=21&adjustment=${adj}&v=${timestamp}`);
        const hijri = response.data.data.date.hijri;
        console.log(`Adjustment ${adj}: ${hijri.day} ${hijri.month.en} (${hijri.date})`);
    } catch (err) {
        console.error(`Error for adjustment ${adj}:`, err.message);
    }
}

async function run() {
    console.log(`Checking date: ${date}`);
    await checkAdjustment(0);
    await checkAdjustment(-1);
    await checkAdjustment(-2);
    await checkAdjustment(-10);
    await checkAdjustment(10);
}

run();
