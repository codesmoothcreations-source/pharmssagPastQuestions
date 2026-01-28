// src/utils/testEndpoints.js - Test your backend
export async function testBackendEndpoints() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const endpoints = [
    '/courses',
    '/courses/levels',
    '/past-questions',
    '/videos/search?q=pharmacy',
    '/videos/trending',
    '/videos/playlists',
    '/users/count'
  ]

  console.log('🔍 Testing backend endpoints...')
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`)
      console.log(`${endpoint}: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response structure:', data)
      } else if (response.status === 401) {
        // Handle authentication errors gracefully
        console.warn(`${endpoint}: Authentication required (this is expected for protected endpoints)`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.warn(`${endpoint}: ${response.status} -`, errorData.message || 'Request failed')
      }
    } catch (error) {
      // Handle network errors gracefully
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        console.warn(`${endpoint}: Network error - Backend may not be running or internet connection issue`)
      } else {
        console.error(`${endpoint}: ERROR -`, error.message)
      }
    }
  }
}