import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL: baseURL || window.location.origin,
  withCredentials: false,
})

api.interceptors.request.use((config: any) => {
  // attach token from localStorage if present
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
