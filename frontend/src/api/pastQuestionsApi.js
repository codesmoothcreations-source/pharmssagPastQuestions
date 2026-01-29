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

  update: (id, data) => {
    let updateData = data;
  
    // If we are sending a file, we MUST use FormData
    if (!(data instanceof FormData) && data.file) {
      updateData = new FormData();
      Object.keys(data).forEach((key) => {
        updateData.append(key, data[key]);
      });
    }
  
    return axiosClient.put(`/past-questions/${id}`, updateData, {
      headers: {
        // This tells the server to expect a file if updateData is FormData
        'Content-Type': updateData instanceof FormData 
          ? 'multipart/form-data' 
          : 'application/json'
      }
    });
  },

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
