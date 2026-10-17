import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import axios from 'axios'
import App from './App.tsx'
import { LanguageProvider } from './language'

// Use Vite's /api proxy during local development. Production can use the
// configured remote API URL; static map fallbacks are fetched from this origin.
const rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

const apiBase = rawApiBase ? rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '') : ''
if (apiBase) {
  axios.defaults.baseURL = apiBase
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
