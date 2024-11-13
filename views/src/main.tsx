import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import ToastProvider from './context/ToastProvider.tsx'
import { store } from './redux/store.tsx'
import { AuthProvider } from './context/AuthenticateContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router >
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </Router >
    </Provider>
  </StrictMode>,
)
