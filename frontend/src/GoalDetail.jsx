import { useState } from 'react'
import NewBlockerModal from './NewBlockerModal'
import ConfirmModal from './ConfirmModal'

const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const TASK_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export default function GoalDetail({
  goal, blockers, toggleTask, addTask, resolveBlocker, addBlocker,
  setGoalStatus, removeGoal, removeTask, removeBlocker,
}) {
  const [newTask, setNewTask] = useState('')
  const [showNewBlocker, setShowNewBlocker] = useState(false)
  const [confirm, setConfirm] = useState(null)

  if (!goal) {
    return (
      <div className="goal-detail goal-detail-empty">
        <span>Select a goal to see details</span>
      </div>
    )
  }

  const isArchived = goal.status === 'completed'

  function handleAddKeyDown(e) {
    if (e.key === 'Enter' && newTask.trim()) {
      addTask(goal.id, newTask.trim())
      setNewTask('')
    }
  }

  return (
    <div className="goal-detail">
      <div className="goal-detail-header">
        <h2 className="panel-title">{goal.title}</h2>
        <div className="goal-detail-actions">
          {isArchived ? (
            <button
              className="btn-add"
              onClick={() => setGoalStatus(goal.id, 'active')}
            >
              ↩ Restore
            </button>
          ) : (
            <button
              className="btn-add btn-complete"
              onClick={() => setGoalStatus(goal.id, 'completed')}
            >
              ✓ Complete
            </button>
          )}
          <button
            className="btn-add btn-delete"
            onClick={() => setConfirm({
              type: 'goal',
              id: goal.id,
              title: 'Delete goal',
              message: `Delete "${goal.title}"? Its tasks and blockers will also be deleted. This cannot be undone.`,
            })}
          >
            Delete
          </button>
        </div>
      </div>

      {isArchived && (
        <div className="archived-banner">
          This goal is archived and read-only. Restore it to make changes.
        </div>
      )}

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      <div className="task-list">
        {goal.tasks.map(task => (
          <div
            key={task.id}
            className={`task-item task-${task.status}${isArchived ? ' task-item-readonly' : ''}`}
            onClick={isArchived ? undefined : () => toggleTask(goal.id, task.id, task.status)}
            title={isArchived ? undefined : `Click to advance: ${TASK_LABEL[task.status]}`}
          >
            <span className="task-check">
              {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '◐' : '○'}
            </span>
            <span className="task-title">{task.title}</span>
            <span className={`task-badge task-badge-${task.status}`}>
              {TASK_LABEL[task.status]}
            </span>
            {!isArchived && (
              <button
                className="btn-delete-item"
                aria-label="Delete task"
                title="Delete task"
                onClick={e => {
                  e.stopPropagation()
                  setConfirm({
                    type: 'task',
                    id: task.id,
                    title: 'Delete task',
                    message: `Delete task "${task.title}"? This cannot be undone.`,
                  })
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {!isArchived && (
          <input
            className="task-add-input"
            placeholder="Add task…"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={handleAddKeyDown}
          />
        )}
      </div>

      <div className="blockers-section">
        <div className="panel-header">
          <h3 className="panel-title">Blockers</h3>
          {!isArchived && (
            <button className="btn-add" onClick={() => setShowNewBlocker(true)}>+ New Blocker</button>
          )}
        </div>
        {blockers.length > 0 ? (
          <div className="blockers-list">
            {blockers.map(b => (
              <div key={b.id} className="blocker-item">
                <span className="blocker-desc">{b.description}</span>
                {!isArchived && (
                  <div className="blocker-actions">
                    <button className="btn-resolve" onClick={() => resolveBlocker(b.id)}>
                      Resolve
                    </button>
                    <button
                      className="btn-delete-item"
                      aria-label="Delete blocker"
                      title="Delete blocker"
                      onClick={() => setConfirm({
                        type: 'blocker',
                        id: b.id,
                        title: 'Delete blocker',
                        message: `Delete blocker "${b.description}"? This cannot be undone.`,
                      })}
                    >
                      ×
                    </button>
                  </div>
                )}
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

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === 'goal') return removeGoal(confirm.id)
            if (confirm.type === 'task') return removeTask(goal.id, confirm.id)
            return removeBlocker(confirm.id)
          }}
        />
      )}
    </div>
  )
}
