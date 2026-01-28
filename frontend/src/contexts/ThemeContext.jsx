// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext({})

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  })

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme)
    
    // Update data-theme attribute on html element
    document.documentElement.setAttribute('data-theme', theme)
    
    // Update CSS variables based on theme
    const root = document.documentElement
    if (theme === 'dark') {
      root.style.setProperty('--color-bg', '#121826')
      root.style.setProperty('--color-card', '#1e293b')
      root.style.setProperty('--color-text', '#f1f5f9')
      root.style.setProperty('--color-text-light', '#94a3b8')
      root.style.setProperty('--color-border', '#334155')
    } else {
      root.style.setProperty('--color-bg', '#f8f9fa')
      root.style.setProperty('--color-card', '#ffffff')
      root.style.setProperty('--color-text', '#212529')
      root.style.setProperty('--color-text-light', '#6c757d')
      root.style.setProperty('--color-border', '#dee2e6')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}