import { useState, useEffect, useCallback } from 'react'
import { getGoals, getBlockers, updateTask, updateBlocker, createTask, createGoal, createBlocker } from './api'

const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

export default function useGoalsData(refreshKey) {
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getGoals(), getBlockers()])
      .then(([g, b]) => {
        setGoals(g)
        setBlockers(b)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [refreshKey])

  const toggleTask = useCallback(async (goalId, taskId, currentStatus) => {
    const next = TASK_NEXT[currentStatus]
    await updateTask(taskId, next)
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: next } : t) }
          : g
      )
    )
  }, [])

  const addTask = useCallback(async (goalId, title) => {
    const task = await createTask({ goal_id: goalId, title })
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId ? { ...g, tasks: [...g.tasks, task] } : g
      )
    )
  }, [])

  const resolveBlocker = useCallback(async (blockerId) => {
    await updateBlocker(blockerId, 'resolved')
    setBlockers(prev => prev.filter(b => b.id !== blockerId))
  }, [])

  const addGoal = useCallback(async (data) => {
    const goal = await createGoal(data)
    setGoals(prev => [...prev, goal])
    return goal
  }, [])

  const addBlocker = useCallback(async (data) => {
    const blocker = await createBlocker(data)
    setBlockers(prev => [blocker, ...prev])
    return blocker
  }, [])

  return { goals, blockers, loading, toggleTask, addTask, resolveBlocker, addGoal, addBlocker }
}
