import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import 'katex/dist/katex.min.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { DarkModeProvider } from './contexts/DarkModeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
