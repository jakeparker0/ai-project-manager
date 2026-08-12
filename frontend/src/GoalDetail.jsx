import { useState } from 'react'
import NewBlockerModal from './NewBlockerModal'

const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const TASK_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export default function GoalDetail({ goal, blockers, toggleTask, addTask, resolveBlocker, addBlocker }) {
  const [newTask, setNewTask] = useState('')
  const [showNewBlocker, setShowNewBlocker] = useState(false)

  if (!goal) {
    return (
      <div className="goal-detail goal-detail-empty">
        <span>Select a goal to see details</span>
      </div>
    )
  }

  function handleAddKeyDown(e) {
    if (e.key === 'Enter' && newTask.trim()) {
      addTask(goal.id, newTask.trim())
      setNewTask('')
    }
  }

  return (
    <div className="goal-detail">
      <h2 className="panel-title">{goal.title}</h2>
      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

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
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={handleAddKeyDown}
        />
      </div>

      <div className="blockers-section">
        <div className="panel-header">
          <h3 className="panel-title">Blockers</h3>
          <button className="btn-add" onClick={() => setShowNewBlocker(true)}>+ New Blocker</button>
        </div>
        {blockers.length > 0 ? (
          <div className="blockers-list">
            {blockers.map(b => (
              <div key={b.id} className="blocker-item">
                <span className="blocker-desc">{b.description}</span>
                <button className="btn-resolve" onClick={() => resolveBlocker(b.id)}>
                  Resolve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="blockers-empty">No open blockers.</div>
        )}
      </div>

      {showNewBlocker && (
        <NewBlockerModal
          goalId={goal.id}
          tasks={goal.tasks}
          onClose={() => setShowNewBlocker(false)}
          onCreate={addBlocker}
        />
      )}
    </div>
  )
}
