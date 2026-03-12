import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Storage shim: window.storage API (mirrors the Claude artifact API)
// Uses localStorage so data persists across sessions in the browser
window.storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(key)
      if (val === null) throw new Error('not found')
      return { key, value: val }
    } catch {
      throw new Error('not found')
    }
  },
  async set(key, value) {
    localStorage.setItem(key, value)
    return { key, value }
  },
  async delete(key) {
    localStorage.removeItem(key)
    return { key, deleted: true }
  },
  async list(prefix = '') {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    return { keys, prefix }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
