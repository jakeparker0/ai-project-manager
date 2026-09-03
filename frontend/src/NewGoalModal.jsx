import { useState } from 'react'
import Modal from './Modal'

export default function NewGoalModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [horizon, setHorizon] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    try {
      const goal = await onCreate({
        title: title.trim(),
        description: description.trim() || null,
        horizon: horizon.trim() || null,
      })
      if (goal) onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New goal" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="modal-label">
          Title
          <input
            className="modal-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label className="modal-label">
          Description
          <textarea
            className="modal-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label className="modal-label">
          Horizon
          <input
            className="modal-input"
            value={horizon}
            onChange={e => setHorizon(e.target.value)}
            placeholder="e.g. 3 months"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-text" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-contained" disabled={!title.trim() || saving}>
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
