# PM Agent

An AI-powered personal project manager that helps you set goals, track progress, and stay accountable — built as a web app with a conversational interface.

You give it natural language updates ("worked on the backend for an hour tonight, got the database schema done but hit a blocker with async routes"). It logs what matters, extracts tasks and blockers automatically, and tells you what to focus on next.

Built with FastAPI, React, and the Claude API.

---

## Why I built this

I wanted a tool that felt less like a task tracker and more like a thinking partner — something that understands the *context* behind your goals, not just a list of checkboxes. It also happens to be a good portfolio project: it uses a real LLM API, has a clean full-stack architecture, and solves an actual problem I have.

---

## Features

- **Dashboard + chat in one view** — see all your goals and tasks at a glance, with a chat panel alongside it
- **Natural language updates** — just describe what you did; the agent extracts tasks, progress, and blockers automatically
- **Persistent memory** — everything is stored in SQLite so your context survives between sessions
- **Blocker tracking** — the agent notices when the same blocker keeps coming up and surfaces it
- **Focus suggestions** — based on your goals and recent activity, it tells you what to work on tonight

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python, FastAPI |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Database | SQLite |
| Auth | None (personal tool, local use) |

---

## Project structure

```
pm-agent/
├── backend/
│   ├── main.py          # FastAPI app, route definitions
│   ├── database.py      # SQLite setup, models, queries
│   ├── agent.py         # Claude API integration, system prompt
│   ├── requirements.txt
│   └── .env             # ANTHROPIC_API_KEY (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component, layout
│   │   ├── Dashboard.jsx    # Goals, tasks, blockers panel
│   │   ├── Chat.jsx         # Conversation interface
│   │   └── api.js           # Backend fetch helpers
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
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/goals` | Fetch all goals and their current status |
| `POST` | `/goals` | Create a new goal |
| `GET` | `/tasks` | Fetch all tasks (optionally filtered by goal) |
| `POST` | `/tasks` | Create or update a task |
| `GET` | `/blockers` | Fetch open blockers |
| `POST` | `/chat` | Send a message and get a response from the agent |
| `GET` | `/chat/history` | Fetch conversation history |

---

## Roadmap

- [ ] MVP: goals, tasks, blockers, chat — fully working
- [ ] Streak tracking — visualise consistency over time
- [ ] Weekly summary — agent-generated review of the week
- [ ] Mobile-friendly layout
- [ ] Export to markdown — dump your progress log as a readable file

---

## Author

Jake Parker — [linkedin.com/in/jakeparker0](https://linkedin.com/in/jakeparker0)