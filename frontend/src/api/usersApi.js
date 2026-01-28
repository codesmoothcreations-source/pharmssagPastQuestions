// src/api/usersApi.js - For your backend
import axiosClient from './axiosClient'

export const usersApi = {
  // GET /api/users/count
  getStats: () => axiosClient.get('/users/count'),
  
  // GET /api/users
  getAll: (params) => axiosClient.get('/users', { params }),
  
  // GET /api/users/:id
  getById: (id) => axiosClient.get(`/users/${id}`),
  
  // PUT /api/users/:id
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  
  // DELETE /api/users/:id (if available)
  delete: (id) => axiosClient.delete(`/users/${id}`),
  
  // PUT /api/users/:id/activate
  activate: (id) => axiosClient.put(`/users/${id}/activate`),
  
  // PUT /api/users/:id/deactivate
  deactivate: (id) => axiosClient.put(`/users/${id}/deactivate`),
}