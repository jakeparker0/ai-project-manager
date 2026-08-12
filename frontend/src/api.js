const BASE = import.meta.env.VITE_API_URL

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const getGoals = () => req('/goals')
export const createGoal = (data) => req('/goals', { method: 'POST', body: JSON.stringify(data) })
export const getTasks = (goalId) => req(`/tasks${goalId ? `?goal_id=${goalId}` : ''}`)
export const createTask = (data) => req('/tasks', { method: 'POST', body: JSON.stringify(data) })
export const updateTask = (id, status) => req(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const getBlockers = () => req('/blockers')
export const updateBlocker = (id, status) => req(`/blockers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const getSessions = () => req('/sessions')
export const createSession = (content) => req('/sessions', { method: 'POST', body: JSON.stringify({ content }) })
