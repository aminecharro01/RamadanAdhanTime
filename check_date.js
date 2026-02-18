import axios from 'axios';

const checkDate = async () => {
    try {
        const response = await axios.get('http://api.aladhan.com/v1/gToHCalendar/2/2026?method=21');
        const day = response.data.data.find(d => d.gregorian.day == '19');
        console.log(`With method 21: 19 Feb 2026 is Hijri: ${day.hijri.day} ${day.hijri.month.en} ${day.hijri.year}`);
    } catch (e) {
        console.error(e);
    }
};

checkDate();
