import { useState, useEffect, useRef } from 'react'
import { getChatHistory, sendMessage } from './api'

export default function Chat({ onUpdate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    getChatHistory().then(setMessages)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function submit() {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text, id: Date.now() }])
    setThinking(true)
    try {
      const { reply } = await sendMessage(text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, id: Date.now() + 1 }])
      onUpdate()
    } finally {
      setThinking(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="chat">
      <h2 className="panel-title">Chat</h2>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">Start a conversation with your PM agent.</div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id ?? i} className={`message message-${msg.role}`}>
            <div className="message-bubble">{msg.content}</div>
          </div>
        ))}
        {thinking && (
          <div className="message message-assistant">
            <div className="message-bubble typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your PM agent… (Enter to send)"
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={submit}
          disabled={thinking || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
