import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.tsx'
import ToastProvider from './hooks/ToastProvider.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router >
      <ToastProvider>
        <App />
      </ToastProvider>
      </Router >
    </Provider>
  </StrictMode>,
)
