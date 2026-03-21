import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pos-system-production-c99e.up.railway.app/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
export const STORAGE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '/storage')
  : 'http://127.0.0.1:8000/storage'
export default api
