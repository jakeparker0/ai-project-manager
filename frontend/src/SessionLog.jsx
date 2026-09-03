import { useState, useEffect } from 'react'
import { getSessions, createSession } from './api'

// Timestamps come from SQLite as UTC 'YYYY-MM-DD HH:MM:SS' strings
function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts.replace(' ', 'T') + 'Z')
  if (isNaN(d)) return ts
  return d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function SessionLog({ refreshKey, onError }) {
  const [entries, setEntries] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getSessions()
      .then(setEntries)
      .catch(() => {})
  }, [refreshKey])

  async function submit() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const entry = await createSession(text)
      setEntries(prev => [entry, ...prev])
      setInput('')
    } catch {
      onError('Could not log the session note')
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
    <>
      <div className="section-header">
        <h2 className="overline">Session Log</h2>
      </div>

      <div className="session-entries">
        {entries.length === 0 && (
          <div className="session-empty">
            No session notes yet.<br />
            Notes logged here or from Claude Desktop keep context between sessions.
          </div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="session-entry">
            <div className="session-entry-date">{formatDate(entry.created_at)}</div>
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
          placeholder="Log a session note… (Enter to send)"
          rows={2}
        />
        <button
          className="btn btn-contained"
          onClick={submit}
          disabled={sending || !input.trim()}
        >
          Log
        </button>
      </div>
    </>
  )
}
