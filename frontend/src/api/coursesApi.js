// src/api/coursesApi.js - For your backend
import axiosClient from './axiosClient'

export const coursesApi = {
  // GET /api/courses
  getAll: (params) => axiosClient.get('/courses', { params }),
  
  // GET /api/courses/:level/:semester
  getByLevelAndSemester: (level, semester) => 
    axiosClient.get(`/courses/${level}/${semester}`),
  
  // GET /api/courses/levels
  getLevels: () => axiosClient.get('/courses/levels'),
  
  // GET /api/courses/search?q=query
  search: (query) => axiosClient.get('/courses/search', { params: { q: query } }),
}