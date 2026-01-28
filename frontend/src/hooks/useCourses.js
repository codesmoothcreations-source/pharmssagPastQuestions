// src/hooks/useCourses.js - Updated for backend
import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api/coursesApi'

export function useCourses(params = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.getAll(params),
    // Transform the data if needed
    select: (data) => {
      // If data is already an array, return it
      if (Array.isArray(data)) {
        return data
      }
      
      // If backend returns { data: [...] } format
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      // If backend returns { courses: [...] } format
      if (data?.courses && Array.isArray(data.courses)) {
        return data.courses
      }
      
      // If no array found, return empty array
      console.warn('Unexpected courses data structure from backend:', data)
      return []
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCourseLevels() {
  return useQuery({
    queryKey: ['course-levels'],
    queryFn: () => coursesApi.getLevels(),
    select: (data) => {
      if (Array.isArray(data)) {
        return data
      }
      
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      if (data?.levels && Array.isArray(data.levels)) {
        return data.levels
      }
      
      console.warn('Unexpected course levels structure from backend:', data)
      return []
    },
    staleTime: 5 * 60 * 1000,
  })
}