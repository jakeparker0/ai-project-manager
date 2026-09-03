import { useState } from 'react'
import NewGoalModal from './NewGoalModal'
import { AddIcon, ErrorOutlineIcon, ExpandMoreIcon, ChevronRightIcon } from './Icons'

const STATUS_LABEL = { active: 'Active', completed: 'Completed', paused: 'Paused' }

function GoalCard({ goal, blockers, isSelected, onSelect }) {
  const total = goal.tasks.length
  const done = goal.tasks.filter(t => t.status === 'done').length
  const openBlockers = blockers.filter(b => b.goal_id === goal.id && b.status !== 'resolved').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <button
      type="button"
      className={
        'goal-card' +
        (isSelected ? ' goal-card-selected' : '') +
        (goal.status === 'completed' ? ' goal-card-archived' : '')
      }
      onClick={() => onSelect(goal.id)}
      aria-pressed={isSelected}
    >
      <div className="goal-card-top">
        <div>
          <span className="goal-card-title">{goal.title}</span>
          {goal.horizon && <span className="goal-card-horizon">{goal.horizon}</span>}
        </div>
        {goal.status !== 'active' && (
          <span className={`chip chip-${goal.status}`}>
            {STATUS_LABEL[goal.status] || goal.status}
          </span>
        )}
      </div>
      <div className="goal-card-progress">
        <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="goal-card-count">{done}/{total}</span>
      </div>
      {openBlockers > 0 && (
        <div className="goal-card-blockers">
          <ErrorOutlineIcon size={15} />
          {openBlockers} blocker{openBlockers > 1 ? 's' : ''}
        </div>
      )}
    </button>
  )
}

export default function Dashboard({ goals, blockers, loading, loadError, selectedGoalId, onSelect, addGoal }) {
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const activeGoals = goals.filter(g => g.status !== 'completed')
  const archivedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2 className="overline">Goals</h2>
        <button className="btn btn-contained" onClick={() => setShowNewGoal(true)}>
          <AddIcon size={16} /> New goal
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : loadError && goals.length === 0 ? (
        <div className="empty-note">Can’t reach the backend. Is the API server running?</div>
      ) : (
        <>
          <div className="goals-list">
            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                blockers={blockers}
                isSelected={goal.id === selectedGoalId}
                onSelect={onSelect}
              />
            ))}
            {activeGoals.length === 0 && (
              <div className="empty-note">No active goals yet. Create one to get started.</div>
            )}
          </div>

          {archivedGoals.length > 0 && (
            <div className="archived-section">
              <button
                className="archived-toggle"
                onClick={() => setShowArchived(v => !v)}
                aria-expanded={showArchived}
              >
                {showArchived ? <ExpandMoreIcon size={18} /> : <ChevronRightIcon size={18} />}
                Archived ({archivedGoals.length})
              </button>
              {showArchived && (
                <div className="goals-list">
                  {archivedGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      blockers={blockers}
                      isSelected={goal.id === selectedGoalId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showNewGoal && (
        <NewGoalModal onClose={() => setShowNewGoal(false)} onCreate={addGoal} />
      )}
    </div>
  )
}
