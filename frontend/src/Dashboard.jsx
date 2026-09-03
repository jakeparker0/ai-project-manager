import { useState } from 'react'
import NewGoalModal from './NewGoalModal'

const STATUS_LABEL = { active: 'Active', completed: 'Completed', paused: 'Paused' }

function GoalCard({ goal, blockers, isSelected, onSelect }) {
  const total = goal.tasks.length
  const done = goal.tasks.filter(t => t.status === 'done').length
  const openBlockers = blockers.filter(b => b.goal_id === goal.id && b.status !== 'resolved').length
  return (
    <div
      className={`goal-card goal-card-selectable${isSelected ? ' goal-card-selected' : ''}${goal.status === 'completed' ? ' goal-card-archived' : ''}`}
      onClick={() => onSelect(goal.id)}
    >
      <div className="goal-header">
        <div>
          <h3 className="goal-title">{goal.title}</h3>
          <span className="goal-horizon">{goal.horizon}</span>
        </div>
        <span className={`badge badge-${goal.status}`}>
          {STATUS_LABEL[goal.status] || goal.status}
        </span>
      </div>
      <div className="goal-summary">
        {done}/{total} tasks done
        {openBlockers > 0 && (
          <span className="goal-summary-blockers">
            {openBlockers} blocker{openBlockers > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ goals, blockers, loading, selectedGoalId, onSelect, addGoal }) {
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  if (loading) return <div className="loading">Loading...</div>

  const activeGoals = goals.filter(g => g.status !== 'completed')
  const archivedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="dashboard">
      <div className="panel-header">
        <h2 className="panel-title">Goals</h2>
        <button className="btn-add" onClick={() => setShowNewGoal(true)}>+ New Goal</button>
      </div>
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
          <div className="goals-empty">No active goals.</div>
        )}
      </div>

      {archivedGoals.length > 0 && (
        <div className="archived-section">
          <button
            className="archived-toggle"
            onClick={() => setShowArchived(v => !v)}
          >
            <span className="archived-toggle-arrow">{showArchived ? '▾' : '▸'}</span>
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

      {showNewGoal && (
        <NewGoalModal onClose={() => setShowNewGoal(false)} onCreate={addGoal} />
      )}
    </div>
  )
}
