import { useState, useEffect } from 'react'
import { getGoals, getBlockers, updateTask, updateBlocker } from './api'

const BASE = 'http://localhost:8000'

const STATUS_LABEL = { active: 'Active', completed: 'Completed', paused: 'Paused' }
const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const TASK_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export default function Dashboard({ refreshKey }) {
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [g, b] = await Promise.all([getGoals(), getBlockers()])
    setGoals(g)
    setBlockers(b)
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshKey])

  async function toggleTask(goalId, taskId, currentStatus) {
    const next = TASK_NEXT[currentStatus]
    await updateTask(taskId, next)
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: next } : t) }
          : g
      )
    )
  }

  async function resolveBlocker(blockerId) {
    await updateBlocker(blockerId, 'resolved')
    setBlockers(prev => prev.filter(b => b.id !== blockerId))
  }

  function handleTaskKeyDown(e, goalId) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const title = e.target.value.trim()
      e.target.value = ''
      fetch(`${BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId, title }),
      })
        .then(r => r.json())
        .then(task => {
          setGoals(prev =>
            prev.map(g =>
              g.id === goalId ? { ...g, tasks: [...g.tasks, task] } : g
            )
          )
        })
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="dashboard">
      <h2 className="panel-title">Goals</h2>

      <div className="goals-list">
        {goals.map(goal => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <div>
                <h3 className="goal-title">{goal.title}</h3>
                <span className="goal-horizon">{goal.horizon}</span>
              </div>
              <span className={`badge badge-${goal.status}`}>
                {STATUS_LABEL[goal.status] || goal.status}
              </span>
            </div>

            <div className="task-list">
              {goal.tasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item task-${task.status}`}
                  onClick={() => toggleTask(goal.id, task.id, task.status)}
                  title={`Click to advance: ${TASK_LABEL[task.status]}`}
                >
                  <span className="task-check">
                    {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '◐' : '○'}
                  </span>
                  <span className="task-title">{task.title}</span>
                  <span className={`task-badge task-badge-${task.status}`}>
                    {TASK_LABEL[task.status]}
                  </span>
                </div>
              ))}
              <input
                className="task-add-input"
                placeholder="Add task…"
                onKeyDown={(e) => handleTaskKeyDown(e, goal.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {blockers.length > 0 && (
        <div className="blockers-section">
          <h2 className="panel-title">Blockers</h2>
          <div className="blockers-list">
            {blockers.map(b => (
              <div key={b.id} className="blocker-item">
                <span className="blocker-desc">{b.description}</span>
                <button
                  className="btn-resolve"
                  onClick={() => resolveBlocker(b.id)}
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
