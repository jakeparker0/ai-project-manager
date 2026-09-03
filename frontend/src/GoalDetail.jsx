import { useState } from 'react'
import NewBlockerModal from './NewBlockerModal'
import ConfirmModal from './ConfirmModal'
import {
  AddIcon, CheckIcon, DeleteIcon, RestoreIcon, ErrorOutlineIcon, FlagIcon,
  CheckCircleIcon, CircleOutlineIcon, TimelapseIcon,
} from './Icons'

const TASK_NEXT = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const TASK_LABEL = { todo: 'to do', in_progress: 'in progress', done: 'done' }
const STATUS_LABEL = { active: 'Active', completed: 'Completed', paused: 'Paused' }

function TaskStatusIcon({ status }) {
  if (status === 'done') return <CheckCircleIcon size={22} />
  if (status === 'in_progress') return <TimelapseIcon size={22} />
  return <CircleOutlineIcon size={22} />
}

export default function GoalDetail({
  goal, blockers, toggleTask, addTask, resolveBlocker, addBlocker,
  setGoalStatus, removeGoal, removeTask, removeBlocker,
}) {
  const [newTask, setNewTask] = useState('')
  const [showNewBlocker, setShowNewBlocker] = useState(false)
  const [confirm, setConfirm] = useState(null)

  if (!goal) {
    return (
      <div className="detail-empty">
        <FlagIcon size={40} />
        <span>Select a goal to see its details</span>
      </div>
    )
  }

  const isArchived = goal.status === 'completed'
  const doneCount = goal.tasks.filter(t => t.status === 'done').length
  const pct = goal.tasks.length > 0 ? Math.round((doneCount / goal.tasks.length) * 100) : 0

  async function handleAddKeyDown(e) {
    if (e.key === 'Enter' && newTask.trim()) {
      const task = await addTask(goal.id, newTask.trim())
      if (task) setNewTask('')
    }
  }

  return (
    <div className="goal-detail">
      <div className="detail-header">
        <div className="detail-heading">
          <h2 className="detail-title">{goal.title}</h2>
          <span className={`chip chip-${goal.status}`}>
            {STATUS_LABEL[goal.status] || goal.status}
          </span>
        </div>
        <div className="detail-actions">
          {isArchived ? (
            <button className="btn btn-outlined" onClick={() => setGoalStatus(goal.id, 'active')}>
              <RestoreIcon size={16} /> Restore
            </button>
          ) : (
            <button
              className="btn btn-outlined btn-success"
              onClick={() => setGoalStatus(goal.id, 'completed')}
            >
              <CheckIcon size={16} /> Complete
            </button>
          )}
          <button
            className="btn btn-text btn-error"
            onClick={() => setConfirm({
              type: 'goal',
              id: goal.id,
              title: 'Delete goal?',
              message: `“${goal.title}” and all of its tasks and blockers will be permanently deleted. This cannot be undone.`,
            })}
          >
            <DeleteIcon size={16} /> Delete
          </button>
        </div>
      </div>

      {goal.horizon && <div className="detail-horizon">Horizon · {goal.horizon}</div>}

      {isArchived && (
        <div className="archived-banner">
          <RestoreIcon size={16} />
          This goal is archived and read-only. Restore it to make changes.
        </div>
      )}

      {goal.description && (
        <p className="detail-description">{goal.description}</p>
      )}

      <div className="detail-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="overline">Tasks</h3>
            {goal.tasks.length > 0 && (
              <span className="section-count">{doneCount} of {goal.tasks.length} done</span>
            )}
          </div>
        </div>

        {goal.tasks.length > 0 && (
          <div className="task-progress">
            <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="task-list">
          {goal.tasks.map(task => (
            <div key={task.id} className={`task-item${task.status === 'done' ? ' task-item-done' : ''}`}>
              <button
                className={`icon-btn task-status-btn task-${task.status}`}
                disabled={isArchived}
                title={isArchived ? undefined : `Mark as ${TASK_LABEL[TASK_NEXT[task.status]]}`}
                aria-label={`${task.title} — ${TASK_LABEL[task.status]}. Mark as ${TASK_LABEL[TASK_NEXT[task.status]]}`}
                onClick={() => toggleTask(goal.id, task.id, task.status)}
              >
                <TaskStatusIcon status={task.status} />
              </button>
              <span className="task-title">{task.title}</span>
              {task.status === 'in_progress' && (
                <span className="chip chip-progress">In progress</span>
              )}
              {!isArchived && (
                <button
                  className="icon-btn icon-btn-error"
                  aria-label="Delete task"
                  title="Delete task"
                  onClick={() => setConfirm({
                    type: 'task',
                    id: task.id,
                    title: 'Delete task?',
                    message: `The task “${task.title}” will be permanently deleted.`,
                  })}
                >
                  <DeleteIcon size={18} />
                </button>
              )}
            </div>
          ))}

          {goal.tasks.length === 0 && isArchived && (
            <div className="empty-note">No tasks.</div>
          )}

          {!isArchived && (
            <div className="task-add">
              <AddIcon size={20} />
              <input
                className="task-add-input"
                placeholder="Add a task — press Enter"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={handleAddKeyDown}
              />
            </div>
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="overline">Blockers</h3>
            {blockers.length > 0 && <span className="section-count">{blockers.length} open</span>}
          </div>
          {!isArchived && (
            <button className="btn btn-text btn-error" onClick={() => setShowNewBlocker(true)}>
              <AddIcon size={16} /> Add blocker
            </button>
          )}
        </div>
        {blockers.length > 0 ? (
          <div className="blockers-list">
            {blockers.map(b => (
              <div key={b.id} className="blocker-item">
                <ErrorOutlineIcon size={20} className="blocker-icon" />
                <span className="blocker-desc">{b.description}</span>
                {!isArchived && (
                  <div className="blocker-actions">
                    <button className="btn btn-text btn-success" onClick={() => resolveBlocker(b.id)}>
                      Resolve
                    </button>
                    <button
                      className="icon-btn icon-btn-error"
                      aria-label="Delete blocker"
                      title="Delete blocker"
                      onClick={() => setConfirm({
                        type: 'blocker',
                        id: b.id,
                        title: 'Delete blocker?',
                        message: `The blocker “${b.description}” will be permanently deleted.`,
                      })}
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-note">No open blockers.</div>
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
