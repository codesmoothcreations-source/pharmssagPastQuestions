// src/routes/ProtectedRoute.jsx - Updated with better protection
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loader from '../components/ui/Loader/Loader'

export default function ProtectedRoute({ 
  children, 
  adminOnly = false,
  redirectTo = '/login'
}) {
  const { user, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loader />
  }

  if (!user) {
    // Redirect to login, but save the current location
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}