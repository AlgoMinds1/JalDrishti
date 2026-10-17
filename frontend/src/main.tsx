import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import axios from 'axios'
import App from './App.tsx'
import { LanguageProvider } from './language'

// Keep production API requests same-origin so Vercel can proxy /api to Render
// without triggering browser CORS checks. Local development can still point at
// a configured backend, or use Vite's /api proxy by leaving this unset.
const rawApiBase = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
  : ''

const apiBase = rawApiBase ? rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '') : ''
if (apiBase) {
  axios.defaults.baseURL = apiBase
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
