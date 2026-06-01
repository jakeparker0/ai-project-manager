import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "pm_agent.db"

sql = """
-- Tasks (goal_id 1 = engineering role, 2 = PM Agent, 3 = photography)
INSERT INTO tasks (goal_id, title, status) VALUES
(1, 'Update CV to highlight engineering work', 'in_progress'),
(1, 'Write cover letter template', 'todo'),
(1, 'List 20 target companies', 'done'),
(2, 'Set up MCP server with stdio transport', 'in_progress'),
(2, 'Replace chat panel with activity log', 'todo'),
(2, 'Push repo public on GitHub', 'todo'),
(3, 'Pick a theme for the project', 'todo'),
(3, 'Scout 3 locations in Melbourne', 'todo');

-- Blockers
INSERT INTO blockers (goal_id, description, status) VALUES
(1, 'CV still reads as Oracle consultant, not engineer — need to reframe project work', 'open'),
(2, 'sqlite3.Row objects not JSON serialisable in MCP get_context response', 'open');

-- Session logs
INSERT INTO session_logs (content, created) VALUES
('Got the FastMCP server scaffolded and get_context tool returning data. Hit a serialisation issue with sqlite3.Row objects. Need to fix that and then wire up Claude Desktop config.'),
('Set up the project structure, backend running, frontend loading goals from seed data. Decided to replace in-app chat with MCP server approach after planning session.'),
('First session. Got the full stack running locally. Three goals seeded. Decided on the architecture: FastAPI for frontend reads, MCP for conversational writes.');
"""

# Use a fresh connection for the seed inserts to avoid interfering with any existing cursor state.
with sqlite3.connect(DB_PATH) as write_conn:
    write_conn.executescript(sql)