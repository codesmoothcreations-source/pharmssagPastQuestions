// src/api/axiosClient.js
import axios from 'axios'
import toast from 'react-hot-toast'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true
})

/* ===========================
   REQUEST INTERCEPTOR
=========================== */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    if (!config.headers) {
      config.headers = {}
    }

    const hasValidToken =
      typeof token === 'string' &&
      token !== 'undefined' &&
      token !== 'null' &&
      token.trim().length > 0

    if (hasValidToken) {
      config.headers.Authorization = `Bearer ${token.trim()}`
    }

    // Do NOT force content-type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] =
        config.headers['Content-Type'] || 'application/json'
    }

    if (import.meta.env.DEV) {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: hasValidToken,
        isFormData: config.data instanceof FormData,
        headers: Object.keys(config.headers)
      })
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* ===========================
   RESPONSE INTERCEPTOR
=========================== */
axiosClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      )
    }

    if (response.data && typeof response.data === 'object') {
      if (response.data.success === true && response.data.data !== undefined) {
        return response.data.data
      }

      if (response.data.success === true) {
        const { success, ...rest } = response.data
        return rest
      }
    }

    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status,
        data: error.response?.data
      })
    }

    // Handle 401 ONLY for protected routes
    if (status === 401) {
      const isAuthRoute =
        error.config?.url?.includes('/auth') ||
        window.location.pathname.includes('/login')

      if (!isAuthRoute) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        toast.error('Session expired. Please login again.')

        setTimeout(() => {
          window.location.href = '/login'
        }, 1200)
      }
    } else if (status) {
      toast.error(message || `Request failed (${status})`)
    } else if (error.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check backend.')
    }

    return Promise.reject(error)
  }
)

export default axiosClient