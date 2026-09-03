import { useState, useEffect, useCallback, useRef } from 'react'
import { getGoals, getBlockers, updateTask, updateBlocker, createTask, createGoal, createBlocker, updateGoal, deleteGoal, deleteTask, deleteBlocker } from './api'

const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

export default function useGoalsData(refreshKey, onError) {
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const hasLoaded = useRef(false)

  useEffect(() => {
    // Only show the loading state on first fetch, not on background polls
    if (!hasLoaded.current) setLoading(true)
    Promise.all([getGoals(), getBlockers()])
      .then(([g, b]) => {
        setGoals(g)
        setBlockers(b)
        setLoadError(false)
        hasLoaded.current = true
        setLoading(false)
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
        if (hasLoaded.current) onError('Lost connection to the backend')
      })
  }, [refreshKey, onError])

  const toggleTask = useCallback(async (goalId, taskId, currentStatus) => {
    const next = TASK_NEXT[currentStatus]
    try {
      await updateTask(taskId, next)
    } catch {
      onError('Could not update the task')
      return false
    }
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: next } : t) }
          : g
      )
    )
    return true
  }, [onError])

  const addTask = useCallback(async (goalId, title) => {
    let task
    try {
      task = await createTask({ goal_id: goalId, title })
    } catch {
      onError('Could not add the task')
      return null
    }
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId ? { ...g, tasks: [...g.tasks, task] } : g
      )
    )
    return task
  }, [onError])

  const resolveBlocker = useCallback(async (blockerId) => {
    try {
      await updateBlocker(blockerId, 'resolved')
    } catch {
      onError('Could not resolve the blocker')
      return false
    }
    setBlockers(prev => prev.filter(b => b.id !== blockerId))
    return true
  }, [onError])

  const addGoal = useCallback(async (data) => {
    let goal
    try {
      goal = await createGoal(data)
    } catch {
      onError('Could not create the goal')
      return null
    }
    setGoals(prev => [...prev, goal])
    return goal
  }, [onError])

  const addBlocker = useCallback(async (data) => {
    let blocker
    try {
      blocker = await createBlocker(data)
    } catch {
      onError('Could not log the blocker')
      return null
    }
    setBlockers(prev => [blocker, ...prev])
    return blocker
  }, [onError])

  const setGoalStatus = useCallback(async (goalId, status) => {
    try {
      await updateGoal(goalId, status)
    } catch {
      onError('Could not update the goal')
      return false
    }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g))
    return true
  }, [onError])

  const removeGoal = useCallback(async (goalId) => {
    try {
      await deleteGoal(goalId)
    } catch {
      onError('Could not delete the goal')
      return false
    }
    setGoals(prev => prev.filter(g => g.id !== goalId))
    setBlockers(prev => prev.filter(b => b.goal_id !== goalId))
    return true
  }, [onError])

  const removeTask = useCallback(async (goalId, taskId) => {
    try {
      await deleteTask(taskId)
    } catch {
      onError('Could not delete the task')
      return false
    }
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId ? { ...g, tasks: g.tasks.filter(t => t.id !== taskId) } : g
      )
    )
    setBlockers(prev => prev.map(b => b.task_id === taskId ? { ...b, task_id: null } : b))
    return true
  }, [onError])

  const removeBlocker = useCallback(async (blockerId) => {
    try {
      await deleteBlocker(blockerId)
    } catch {
      onError('Could not delete the blocker')
      return false
    }
    setBlockers(prev => prev.filter(b => b.id !== blockerId))
    return true
  }, [onError])

  return {
    goals, blockers, loading, loadError,
    toggleTask, addTask, resolveBlocker, addGoal, addBlocker,
    setGoalStatus, removeGoal, removeTask, removeBlocker,
  }
}
