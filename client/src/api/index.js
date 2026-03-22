/**
 * API client module.
 * All fetch calls live here. Components never touch fetch directly.
 * BASE_URL is empty so requests go to the same origin — Vite proxies
 * /api → localhost:3001 in dev; Express serves everything in production.
 */

// In production VITE_API_URL = your Render backend URL (e.g. https://ledgers-api.onrender.com)
// In dev, falls back to /api which Vite proxies to localhost:3001
const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const getClients = () =>
  fetch(`${BASE}/clients`).then(handleResponse)

export const getTasksByClient = (clientId) =>
  fetch(`${BASE}/clients/${clientId}/tasks`).then(handleResponse)

export const getCategories = () =>
  fetch(`${BASE}/tasks/categories`).then(handleResponse)

export const createTask = (payload) =>
  fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse)

export const updateTaskStatus = (taskId, status) =>
  fetch(`${BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(handleResponse)
