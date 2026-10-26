import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.jsx'
import { store } from './store'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-toastify/dist/ReactToastify.css'

// Must stay last. index.css holds the design tokens and the Bootstrap
// overrides, and CSS of equal specificity is won by whatever loads later.
import './index.css'

// Start waking the free-tier API as soon as the site opens, so it is
// already booting by the time the first real request is made.
try {
  if (import.meta.env.VITE_API_URL && !sessionStorage.getItem('api-warmed')) {
    sessionStorage.setItem('api-warmed', '1')
    fetch(`${import.meta.env.VITE_API_URL}/health`, { mode: 'no-cors' }).catch(() => {})
  }
} catch (e) {
  // sessionStorage can throw in private windows; warm-up is best effort
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
