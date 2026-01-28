// src/hooks/useUsers.js - Create this file
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersApi.getStats(),
    retry: false, // Don't retry on 401
    enabled: !!localStorage.getItem('accessToken'), // Only run if authenticated
  })
}

export function useUsers(params = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    retry: false,
    enabled: !!localStorage.getItem('accessToken'),
  })
}