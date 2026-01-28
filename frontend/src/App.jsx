// src/App.jsx - Add error boundary
import React, { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/ui/Loader/Loader'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './index.css'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<Loader fullScreen />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App