import { useState, useEffect, useCallback } from 'react'
import Dashboard from './Dashboard'
import SessionLog from './SessionLog'
import GoalDetail from './GoalDetail'
import useGoalsData from './useGoalsData'
import { FlagIcon, ErrorOutlineIcon } from './Icons'

const POLL_INTERVAL_MS = 30000

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const [toast, setToast] = useState(null)

  const showError = useCallback((message) => setToast(message), [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  const {
    goals, blockers, loading, loadError,
    toggleTask, addTask, resolveBlocker, addGoal, addBlocker,
    setGoalStatus, removeGoal, removeTask, removeBlocker,
  } = useGoalsData(refreshKey, showError)

  useEffect(() => {
    if (goals.length > 0 && selectedGoalId === null) {
      setSelectedGoalId(goals[0].id)
    }
  }, [goals, selectedGoalId])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  // Writes can also come from Claude Desktop via the MCP server, so keep the
  // view live by refetching on an interval.
  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh])

  const handleAddGoal = useCallback(async (data) => {
    const goal = await addGoal(data)
    if (goal) setSelectedGoalId(goal.id)
    return goal
  }, [addGoal])

  const handleRemoveGoal = useCallback(async (goalId) => {
    const ok = await removeGoal(goalId)
    if (ok) setSelectedGoalId(prev => (prev === goalId ? null : prev))
    return ok
  }, [removeGoal])

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null
  const selectedBlockers = blockers.filter(b => b.goal_id === selectedGoalId)

  return (
    <div className="app">
      <header className="appbar">
        <FlagIcon className="appbar-icon" size={22} />
        <h1 className="appbar-title">PM Agent</h1>
      </header>

      <div className="layout">
        <aside className="col col-goals">
          <Dashboard
            goals={goals}
            blockers={blockers}
            loading={loading}
            loadError={loadError}
            selectedGoalId={selectedGoalId}
            onSelect={setSelectedGoalId}
            addGoal={handleAddGoal}
          />
        </aside>

        <main className="col col-detail">
          <GoalDetail
            goal={selectedGoal}
            blockers={selectedBlockers}
            toggleTask={toggleTask}
            addTask={addTask}
            resolveBlocker={resolveBlocker}
            addBlocker={addBlocker}
            setGoalStatus={setGoalStatus}
            removeGoal={handleRemoveGoal}
            removeTask={removeTask}
            removeBlocker={removeBlocker}
          />
        </main>

        <aside className="col col-sessions">
          <SessionLog refreshKey={refreshKey} onError={showError} />
        </aside>
      </div>

      {toast && (
        <div className="snackbar" role="alert">
          <ErrorOutlineIcon className="snackbar-icon" />
          {toast}
        </div>
      )}
    </div>
  )
}
