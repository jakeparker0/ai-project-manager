import { useState, useEffect, useCallback } from 'react'
import Dashboard from './Dashboard'
import SessionLog from './SessionLog'
import GoalDetail from './GoalDetail'
import useGoalsData from './useGoalsData'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedGoalId, setSelectedGoalId] = useState(null)

  const {
    goals, blockers, loading, toggleTask, addTask, resolveBlocker, addGoal, addBlocker,
    setGoalStatus, removeGoal, removeTask, removeBlocker,
  } = useGoalsData(refreshKey)

  useEffect(() => {
    if (goals.length > 0 && selectedGoalId === null) {
      setSelectedGoalId(goals[0].id)
    }
  }, [goals, selectedGoalId])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const handleRemoveGoal = useCallback(async (goalId) => {
    await removeGoal(goalId)
    setSelectedGoalId(prev => (prev === goalId ? null : prev))
  }, [removeGoal])

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null
  const selectedBlockers = blockers.filter(b => b.goal_id === selectedGoalId)

  return (
    <div className="app">
      <div className="panels">
        <div className="panel panel-left">
          <Dashboard
            goals={goals}
            blockers={blockers}
            loading={loading}
            selectedGoalId={selectedGoalId}
            onSelect={setSelectedGoalId}
            addGoal={addGoal}
          />
        </div>
        <div className="panel panel-right">
          <SessionLog onUpdate={refresh} />
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
        </div>
      </div>
    </div>
  )
}
