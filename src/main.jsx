import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QuranAudioProvider } from './context/QuranAudio.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuranAudioProvider>
      <App />
    </QuranAudioProvider>
  </StrictMode>,
)
