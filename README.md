# AdhanTime

AdhanTime is a modern, responsive web application that displays Islamic prayer times and weather conditions based on your real-time geolocation. It features a beautiful glassmorphism UI, 3D effects, and smooth animations.

## Features

- 📍 **Auto-Geolocation**: Automatically detects your city and coordinates.
- 🕌 **Accurate Prayer Times**: Fetches Fajr, Dhuhr, Asr, Maghrib, and Isha times from the Aladhan API.
- ⏳ **Live Countdown**: Shows time remaining for the next prayer.
- 🌤 **Weather Integration**: Displays current temperature and conditions (uses OpenWeatherMap or Open-Meteo fallback).
- 🎨 **Modern UI**: Glassmorphism design with dynamic backgrounds based on time of day.
- 🌓 **Theme Support**: Toggle between Light and Dark modes (persists in local storage).
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop.

## distinct Tech Stack

- **React** (Vite)
- **Tailwind CSS**
- **Framer Motion** (Animations)
- **Axios** (API Requests)
- **Lucide React** (Icons)
- **Date-fns** (Time Formatting)

## Setup & Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    - Copy `.env.example` to `.env`.
    - (Optional) Add your OpenWeatherMap API key:
      ```
      VITE_OPENWEATHER_API_KEY=your_key_here
      ```
    - *Note: If no key is provided, the app falls back to Open-Meteo (free, no key required).*
4.  **Run Locally**:
    ```bash
    npm run dev
    ```
5.  **Build for Production**:
    ```bash
    npm run build
    ```

## APIs Used

- [Aladhan API](https://aladhan.com/prayer-times-api) for Prayer Times.
- [OpenWeatherMap](https://openweathermap.org/) (Primary) or [Open-Meteo](https://open-meteo.com/) (Fallback) for Weather.

## License

MIT
