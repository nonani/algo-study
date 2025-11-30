import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // TODO: JWT 토큰 추가
    const userId = 1 // 임시
    config.headers['X-USER-ID'] = userId
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Submission API
export const submissionAPI = {
  getAll: (page = 0, size = 20) =>
    api.get('/submissions', { params: { page, size } }),

  getById: (id) =>
    api.get(`/submissions/${id}`),

  getByUser: (userId) =>
    api.get(`/submissions/user/${userId}`),

  getByProblem: (site, problemId) =>
    api.get(`/submissions/problem/${site}/${problemId}`),

  create: (data) =>
    api.post('/submissions', data)
}

// Review API
export const reviewAPI = {
  getBySubmission: (submissionId) =>
    api.get(`/reviews/submission/${submissionId}`),

  create: (data) =>
    api.post('/reviews', data),

  update: (id, data) =>
    api.put(`/reviews/${id}`, data),

  delete: (id) =>
    api.delete(`/reviews/${id}`),

  getComments: (reviewId) =>
    api.get(`/reviews/${reviewId}/comments`),

  createComment: (reviewId, data) =>
    api.post(`/reviews/${reviewId}/comments`, data)
}

export default api
