import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import App from './App.tsx'

// Configure API Base URL from environment (Vercel) with dev fallback
const rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const apiBase = rawApiBase ? rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '') : ''
if (apiBase) {
  axios.defaults.baseURL = apiBase
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
