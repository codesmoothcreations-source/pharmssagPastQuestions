// src/contexts/AuthContext.jsx - Update admin detection
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          // Try to get current user from API
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
          localStorage.setItem('user', JSON.stringify(currentUser))
        }
      } catch (error) {
        console.log('Auth check failed, clearing tokens:', error.message)
        // Clear invalid tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      console.log('✅ Registration successful - Full response:', data)
      
      // Backend returns: { user: {...}, tokens: { accessToken, refreshToken } }
      // After axiosClient interceptor, data is already extracted from response.data.data
      const accessToken = data?.tokens?.accessToken || data?.accessToken || data?.token
      const refreshToken = data?.tokens?.refreshToken || data?.refreshToken
      const userData = data?.user || data
      
      console.log('🔍 Extracted tokens:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
        userData: userData
      })
      
      // Only store tokens if they exist and are valid
      if (accessToken && accessToken !== 'undefined' && typeof accessToken === 'string' && accessToken.trim().length > 0) {
        localStorage.setItem('accessToken', accessToken.trim())
        console.log('✅ Access token stored successfully')
      } else {
        console.error('❌ No valid accessToken in response:', { accessToken, data })
        toast.error('Registration succeeded but token storage failed. Please login again.')
        return
      }
      
      if (refreshToken && refreshToken !== 'undefined' && typeof refreshToken === 'string' && refreshToken.trim().length > 0) {
        localStorage.setItem('refreshToken', refreshToken.trim())
        console.log('✅ Refresh token stored successfully')
      } else {
        console.warn('⚠️ No valid refreshToken in response')
      }
      
      // Store user
      const userWithRole = {
        ...userData,
        role: userData.role || 'USER'
      }
      setUser(userWithRole)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      
      queryClient.invalidateQueries(['currentUser'])
      toast.success('Registration successful! Welcome to Pharmssage.')
    },
    onError: (error) => {
      console.error('❌ Registration error:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      console.log('✅ Login successful - Full response:', data)
      
      // Backend returns: { user: {...}, tokens: { accessToken, refreshToken } }
      // After axiosClient interceptor, data is already extracted from response.data.data
      const accessToken = data?.tokens?.accessToken || data?.accessToken || data?.token
      const refreshToken = data?.tokens?.refreshToken || data?.refreshToken
      const userData = data?.user || data
      
      console.log('🔍 Extracted tokens:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
        userData: userData
      })
      
      // Only store tokens if they exist and are valid
      if (accessToken && accessToken !== 'undefined' && typeof accessToken === 'string' && accessToken.trim().length > 0) {
        localStorage.setItem('accessToken', accessToken.trim())
        console.log('✅ Access token stored successfully')
      } else {
        console.error('❌ No valid accessToken in response:', { accessToken, data })
        toast.error('Login succeeded but token storage failed. Please try again.')
        return
      }
      
      if (refreshToken && refreshToken !== 'undefined' && typeof refreshToken === 'string' && refreshToken.trim().length > 0) {
        localStorage.setItem('refreshToken', refreshToken.trim())
        console.log('✅ Refresh token stored successfully')
      } else {
        console.warn('⚠️ No valid refreshToken in response')
      }
      
      // Store user with proper role detection
      const userWithRole = {
        ...userData,
        role: userData.role || (userData.email?.includes('admin') ? 'ADMIN' : 'USER')
      }
      
      setUser(userWithRole)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      
      queryClient.invalidateQueries(['currentUser'])
      toast.success(`Welcome back, ${userWithRole.name || userWithRole.email}!`)
    },
    onError: (error) => {
      console.error('❌ Login error:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Login failed. Please check your credentials.')
      }
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      toast.success('Logged out successfully')
      window.location.href = '/login'
    },
    onError: (error) => {
      console.error('Logout error:', error)
      clearAuth()
      toast.success('Logged out successfully')
      window.location.href = '/login'
    }
  })

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    queryClient.clear()
  }

  // Force set user as admin (for development)
  const forceAdmin = () => {
    const adminUser = {
      _id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@phamsag.edu',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    // Create a valid JWT-like token
    const mockToken = btoa(JSON.stringify({
      userId: 'admin-001',
      role: 'ADMIN',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    }))
    
    localStorage.setItem('accessToken', `mock.${mockToken}.admin`)
    localStorage.setItem('user', JSON.stringify(adminUser))
    setUser(adminUser)
    
    toast.success('Forced admin login successful!')
    return adminUser
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    forceAdmin,
    clearAuth,
    refetchUser: async () => {
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      } catch (error) {
        console.error('Failed to refetch user:', error)
      }
    },
    loginLoading: loginMutation.isLoading,
    registerLoading: registerMutation.isLoading,
    logoutLoading: logoutMutation.isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}