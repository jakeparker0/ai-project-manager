import { useState, useEffect, useCallback } from 'react'
import Dashboard from './Dashboard'
import Chat from './Chat'
import { getFocus } from './api'

export default function App() {
  const [focus, setFocus] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getFocus()
      .then(data => setFocus(data.suggestion))
      .catch(() => {})
  }, [])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return (
    <div className="app">
      {focus && (
        <div className="focus-banner">
          <span className="focus-label">Tonight</span>
          <span className="focus-text">{focus}</span>
        </div>
      )}
      <div className="panels">
        <div className="panel panel-left">
          <Dashboard refreshKey={refreshKey} />
        </div>
        <div className="panel panel-right">
          <Chat onUpdate={refresh} />
        </div>
      </div>
    </div>
  )
}
