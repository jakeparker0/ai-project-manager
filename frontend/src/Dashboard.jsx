const STATUS_LABEL = { active: 'Active', completed: 'Completed', paused: 'Paused' }

export default function Dashboard({ goals, blockers, loading, selectedGoalId, onSelect }) {
  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="dashboard">
      <h2 className="panel-title">Goals</h2>
      <div className="goals-list">
        {goals.map(goal => {
          const total = goal.tasks.length
          const done = goal.tasks.filter(t => t.status === 'done').length
          const openBlockers = blockers.filter(b => b.goal_id === goal.id && b.status !== 'resolved').length
          const isSelected = goal.id === selectedGoalId
          return (
            <div
              key={goal.id}
              className={`goal-card goal-card-selectable${isSelected ? ' goal-card-selected' : ''}`}
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
        })}
      </div>
    </div>
  )
}
