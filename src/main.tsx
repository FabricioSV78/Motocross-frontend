import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initThemeMode } from 'flowbite-react/theme'
import './index.css'
import App from './App.tsx'

initThemeMode({ defaultMode: 'auto' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
