import { useState, useEffect } from 'react'
import { getSessions, createSession } from './api'

export default function SessionLog({ onUpdate }) {
  const [entries, setEntries] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getSessions()
      .then(setEntries)
      .catch(() => {})
  }, [])

  async function submit() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    try {
      const entry = await createSession(text)
      setEntries(prev => [entry, ...prev])
      onUpdate()
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="session-log">
      <h2 className="panel-title">Session Log</h2>

      <div className="session-entries">
        {entries.length === 0 && (
          <div className="session-empty">Log a session update to get started.</div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="session-entry">
            <div className="session-entry-text">{entry.content}</div>
          </div>
        ))}
      </div>

      <div className="session-input-bar">
        <textarea
          className="session-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Log a session update… (Enter to send)"
          rows={1}
        />
        <button
          className="session-send-btn"
          onClick={submit}
          disabled={sending || !input.trim()}
        >
          Log
        </button>
      </div>
    </div>
  )
}
