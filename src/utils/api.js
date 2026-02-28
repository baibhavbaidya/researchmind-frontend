import axios from 'axios'
import { auth } from './firebase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
})

// Attach Firebase token to every request automatically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})


// --- Document endpoints ---

export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getDocuments = async () => {
  const response = await api.get('/documents')
  return response.data
}

export const clearDocuments = async () => {
  const response = await api.delete('/documents')
  return response.data
}


// --- Query endpoints ---

export const queryResearch = async (query, useDocuments = true) => {
  const response = await api.post('/query', {
    query,
    use_documents: useDocuments
  })
  return response.data
}


// --- History endpoints ---

export const getHistory = async (limit = 20) => {
  const response = await api.get(`/history?limit=${limit}`)
  return response.data
}


// --- WebSocket with auth token ---

export const createWebSocket = async () => {
  const user = auth.currentUser
  let token = ""
  if (user) {
    token = await user.getIdToken()
  }
  const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
  return new WebSocket(`${WS_BASE}/ws/query?token=${token}`)
}

export const deleteHistory = async () => {
  const response = await api.delete('/history')
  return response.data
}

export const deleteAccount = async () => {
  const response = await api.delete('/account')
  return response.data
}

export const followUp = async (original_query, original_answer, followup_question) => {
  const response = await api.post('/followup', {
    original_query,
    original_answer,
    followup_question
  })
  return response.data
}

export const deleteDocument = async (filename) => {
  const response = await api.delete(`/documents/${encodeURIComponent(filename)}`)
  return response.data
}