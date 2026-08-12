import { useState } from 'react'
import Modal from './Modal'

export default function NewBlockerModal({ goalId, tasks, onClose, onCreate }) {
  const [description, setDescription] = useState('')
  const [taskId, setTaskId] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim() || saving) return
    setSaving(true)
    try {
      await onCreate({
        goal_id: goalId,
        description: description.trim(),
        task_id: taskId ? Number(taskId) : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New Blocker" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="modal-label">
          Description
          <textarea
            className="modal-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            autoFocus
            required
          />
        </label>
        {tasks.length > 0 && (
          <label className="modal-label">
            Related task (optional)
            <select className="modal-input" value={taskId} onChange={e => setTaskId(e.target.value)}>
              <option value="">None</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!description.trim() || saving}>
            {saving ? 'Logging…' : 'Log Blocker'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
