import React from 'react'
import ReactDOM from 'react-dom/client'
// Global CSS (tokens, base, shared components) first, so screen/component styles imported by App can override it.
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
