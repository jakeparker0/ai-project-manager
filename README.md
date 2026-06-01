# PM Agent

A personal project manager built around how I actually work — goals and tasks live in a local database, and I manage everything through natural language conversations in Claude Desktop via an MCP server.

Built with FastAPI, React, FastMCP, and SQLite.

---

## Why I built this

I wanted something that felt less like a task tracker and more like a thinking partner — something that understands the context behind my goals, not just a list of checkboxes. The architecture reflects how I already work: I plan in Claude Desktop, so instead of building a separate chat interface, I exposed the database directly to Claude via MCP.

---

## How it works

Claude Desktop connects to a local MCP server that sits in front of the SQLite database. During a planning session, Claude can read current context (goals, tasks, blockers, recent session logs) and write back to the database directly. The React frontend is a read/display layer — it shows current state but the conversational interface lives in Claude Desktop.

---

## Features

- **MCP server** — Claude Desktop can read and write project state directly via tools
- **Session logs** — drop a note at the end of each session so context survives across breaks
- **Goal and task tracking** — goals with horizons and statuses, tasks with todo/in_progress/done states
- **Blocker tracking** — linked to a goal and optionally a specific task
- **Dashboard** — live view of goals, tasks, and blockers via the React frontend
- **Focus suggestion** — Claude-generated prompt on what to work on next

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python, FastAPI |
| MCP server | FastMCP (stdio transport) |
| Database | SQLite |
| Auth | None (personal tool, local use) |

---

## Project structure

```
pm-agent/
├── backend/
│   ├── main.py           # FastAPI app, REST endpoints
│   ├── database.py       # SQLite schema, queries, seed data
│   ├── mcp_server.py     # FastMCP server, tool definitions
│   ├── agent.py          # Focus suggestion (Claude API)
│   ├── requirements.txt
│   └── .env              # ANTHROPIC_API_KEY (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Root component, layout
│   │   ├── Dashboard.jsx # Goals, tasks, blockers panel
│   │   └── api.js        # Backend fetch helpers
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

---

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Claude Desktop
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the API server:

```bash
uvicorn main:app --reload
```

### MCP server (Claude Desktop)

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac):

```json
{
  "mcpServers": {
    "pm-agent": {
      "command": "/absolute/path/to/backend/venv/bin/python",
      "args": ["/absolute/path/to/backend/mcp_server.py"]
    }
  }
}
```

Use the absolute path to the Python binary inside your venv. Restart Claude Desktop after saving.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## MCP tools

| Tool | Description |
|---|---|
| `get_context` | Current goals, tasks, blockers, and recent session logs |
| `log_session` | Write a session note for context recovery |
| `create_goal` | Add a new goal |
| `update_goal` | Update title, description, horizon, or status |
| `create_task` | Add a task under a goal |
| `update_task` | Update title or status |
| `log_blocker` | Log a blocker against a goal and optionally a task |
| `update_blocker` | Update blocker description or resolve it |

## REST endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/goals` | All goals with tasks and open blocker count |
| `POST` | `/goals` | Create a goal |
| `GET` | `/tasks` | Tasks, optionally filtered by goal |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/{id}` | Update task status |
| `GET` | `/blockers` | Open blockers |
| `PATCH` | `/blockers/{id}` | Update blocker status |
| `GET` | `/focus` | Tonight's focus suggestion |

---

## Roadmap

- [ ] Activity log panel — replace chat with a chronological feed of writes
- [ ] Streak tracking — visualise consistency over time
- [ ] Weekly summary tool — agent-generated review across all goals
- [ ] Push repo public on GitHub

---

## Author

Jake Parker — [linkedin.com/in/jakeparker0](https://linkedin.com/in/jakeparker0)