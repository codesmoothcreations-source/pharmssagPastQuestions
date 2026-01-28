// src/api/authApi.js - Updated for your backend
import axiosClient from './axiosClient'

export const authApi = {
  // POST /api/auth/register
  register: (userData) => {
    console.log('Sending registration data:', userData)
    return axiosClient.post('/auth/register', userData)
  },
  
  // POST /api/auth/login
  login: (credentials) => {
    console.log('Sending login data:', credentials)
    return axiosClient.post('/auth/login', credentials)
  },
  
  // POST /api/auth/logout
  logout: () => axiosClient.post('/auth/logout'),
  
  // GET /api/auth/me
  getCurrentUser: () => axiosClient.get('/auth/me'),
}