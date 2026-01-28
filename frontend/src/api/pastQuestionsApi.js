import axiosClient from './axiosClient'

export const pastQuestionsApi = {
  getAll: (params) => axiosClient.get('/past-questions', { params }),

  getById: (id) => axiosClient.get(`/past-questions/${id}`),

  create: (formData) => {
    let uploadData = formData

    if (!(formData instanceof FormData)) {
      uploadData = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key === 'file' && formData[key] instanceof File) {
          uploadData.append('file', formData[key])
        } else if (formData[key] !== undefined && formData[key] !== null) {
          uploadData.append(key, formData[key])
        }
      })
    }

    return axiosClient.post('/past-questions', uploadData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    })
  },

  update: (id, data) =>
    axiosClient.put(`/past-questions/${id}`, data),

  delete: (id) =>
    axiosClient.delete(`/past-questions/${id}`),

  search: (query, params = {}) => {
    const searchParams = { q: query, ...params }
    return axiosClient.get('/past-questions/search', { params: searchParams })
  },

  getAcademicYears: () =>
    axiosClient.get('/past-questions/academic-years'),

  getStats: () =>
    axiosClient.get('/past-questions/stats'),

  incrementViews: (id) =>
    axiosClient.post(`/past-questions/${id}/view`),

  incrementDownloads: (id) =>
    axiosClient.post(`/past-questions/${id}/download`)
}
