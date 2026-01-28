// src/utils/constants.js
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  
  // Courses
  COURSES: '/courses',
  COURSE_LEVELS: '/courses/levels',
  
  // Past Questions
  PAST_QUESTIONS: '/past-questions',
  
  // Videos
  VIDEOS: '/videos',
  
  // Users
  USERS: '/users',
  USER_STATS: '/users/count'
}

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
}

export const COURSE_LEVELS = [
  { id: '100', label: '100 Level' },
  { id: '200', label: '200 Level' },
  { id: '300', label: '300 Level' },
  { id: '400', label: '400 Level' }
]

export const SEMESTERS = [
  { id: '1st', label: '1st Semester' },
  { id: '2nd', label: '2nd Semester' }
]

export const FILE_TYPES = {
  PDF: 'pdf',
  IMAGE: 'image'
}

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: '-views', label: 'Most Views' },
  { value: '-downloads', label: 'Most Downloads' }
]