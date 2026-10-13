import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import App from './App.tsx'

const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
if (apiBase) {
  axios.defaults.baseURL = apiBase.replace(/\/+$/, '')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
