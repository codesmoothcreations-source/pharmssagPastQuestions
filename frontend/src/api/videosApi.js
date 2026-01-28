// src/api/videosApi.js - Updated to work with backend YouTube API
import axiosClient from './axiosClient'

export const videosApi = {
  // GET /api/videos/search?q=query
  search: async (query) => {
    try {
      const response = await axiosClient.get('/videos/search', { 
        params: { q: query, maxResults: 20 } 
      })
      
      // Backend returns: { success: true, data: [...], count: X }
      if (response?.data && Array.isArray(response.data)) {
        return {
          videos: response.data,
          totalResults: response.count || response.data.length,
          pagination: response.pagination
        }
      }
      
      // Fallback for different structures
      if (Array.isArray(response)) {
        return { videos: response, totalResults: response.length }
      }
      
      return { videos: [], totalResults: 0 }
      
    } catch (error) {
      console.error('Video search error:', error)
      return { videos: [], totalResults: 0 }
    }
  },
  
  // GET /api/videos/trending
  getTrending: async () => {
    try {
      const response = await axiosClient.get('/videos/trending')
      
      // Backend returns: { success: true, data: [...], count: X }
      if (response?.data && Array.isArray(response.data)) {
        return { videos: response.data, count: response.count || response.data.length }
      }
      
      // Fallback
      if (Array.isArray(response)) {
        return { videos: response, count: response.length }
      }
      
      return { videos: [], count: 0 }
      
    } catch (error) {
      console.error('Trending videos error:', error)
      return { videos: [], count: 0 }
    }
  },
  
  // GET /api/videos/playlists
  getPlaylists: async () => {
    try {
      const response = await axiosClient.get('/videos/playlists')
      
      // Backend returns: { success: true, data: [...], count: X }
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      
      // Fallback
      if (Array.isArray(response)) {
        return response
      }
      
      return []
      
    } catch (error) {
      console.error('Playlists error:', error)
      return []
    }
  },
  
  // GET /api/videos/:id
  getById: async (id) => {
    try {
      const response = await axiosClient.get(`/videos/${id}`)
      
      // Backend returns: { success: true, data: {...} }
      if (response?.data) {
        return response.data
      }
      
      return response
      
    } catch (error) {
      console.error('Get video by ID error:', error)
      throw error
    }
  }
}