import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "pm_agent.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            horizon TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER REFERENCES goals(id),
            title TEXT NOT NULL,
            status TEXT DEFAULT 'todo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS blockers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER REFERENCES goals(id) NOT NULL,
            task_id INTEGER REFERENCES tasks(id),
            description TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS session_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )               
    """)
    conn.commit()
    conn.close()


def seed_goals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM goals")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO goals (title, description, horizon) VALUES (?, ?, ?)",
            [
                (
                    "Land a software/product engineering role",
                    "Move from Oracle consulting into a product engineering role at a tech company working on something that matters. Target: fintech, climate tech, or a product I'd actually use. Timeline: 12 months.",
                    "12 months",
                ),
                (
                    "Build and ship PM Agent",
                    "Build this AI project manager app as a side project and portfolio piece. It should be publicly on GitHub, functional, and something I'd actually use daily. Target: shipped MVP in 3 months.",
                    "3 months",
                ),
                (
                    "Start a deliberate photography project",
                    "Stop only shooting when travelling. Pick a theme (Melbourne architecture, coastal landscapes, or something environmental), shoot 20 intentional images over 8 weeks, and edit them into a cohesive set.",
                    "3 months",
                ),
            ],
        )
        conn.commit()
    conn.close()


def get_current_context() -> dict:
    '''Fetches the current active goals, tasks, blockers, and recent session logs from the database and returns them as a dictionary.'''

    conn = get_db()
    cursor = conn.cursor()


    cursor.execute("SELECT id, title, status, horizon FROM goals WHERE status = 'active'")

    fetch_goals = cursor.fetchall()

    active_goals = [dict(goal) for goal in fetch_goals]

    for goal in active_goals:
        cursor.execute("SELECT * FROM tasks WHERE goal_id = ? and status != 'done'", (goal["id"],))
        tasks = cursor.fetchall()
        #print(json.dumps(vars(tasks), indent=2))
        goal["tasks"] = [dict(task) for task in tasks]

        cursor.execute("SELECT * FROM blockers WHERE goal_id = ? and status = 'open'", (goal["id"],))
        blockers = cursor.fetchall()
        goal["blockers"] = [dict(blocker) for blocker in blockers]
        

    cursor.execute("SELECT content, created_at FROM session_logs ORDER BY created_at DESC LIMIT 3")
    recent_session_logs = cursor.fetchall()

    conn.close()
    return {
        "active_goals": active_goals,
        "recent_session_logs": [f"{log['content']} ({(datetime.now() - log['created_at']).days} days ago)" for log in recent_session_logs],
    }


# Session Logs
def log_session_entry(content: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO session_logs (content) VALUES (?)",
        (content,)
    )
    conn.commit()
    conn.close()


# Goals

def create_goal(title: str, description: str = None, horizon: str = None) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO goals (title, description, horizon) VALUES (?, ?, ?)",
        (title, description, horizon)
    )
    conn.commit()
    goal_id = cursor.lastrowid
    conn.close()
    return {"id": goal_id, "title": title, "description": description, "horizon": horizon}

def update_goal(goal_id: int, title: str = None, description: str = None, horizon: str = None, status: str = None) -> dict:
    fields = {"title": title, "description": description, "horizon": horizon, "status": status}
    updates = {k: v for k, v in fields.items() if v is not None}
    
    if not updates:
        raise ValueError("No fields provided to update")
    
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [goal_id]
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE goals SET {set_clause} WHERE id = ?", values)
    conn.commit()
    cursor.execute("SELECT * FROM goals WHERE id = ?", (goal_id,))
    updated_goal = cursor.fetchone()
    conn.close()
    return dict(updated_goal)

# Tasks

def create_task(goal_id: int, title: str, status: str = "todo") -> dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (goal_id, title, status) VALUES (?, ?, ?)",
        (goal_id, title, status)
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"id": task_id, "goal_id": goal_id, "title": title, "status": status}

def update_task(task_id: int, title: str = None, status: str = None) -> dict:
    fields = {"title": title, "status": status}
    updates = {k: v for k, v in fields.items() if v is not None}

    if not updates:
        raise ValueError("No fields provided to update")
    
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [task_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE tasks SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)
    conn.commit()
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    updated_task = cursor.fetchone()
    conn.close()
    return dict(updated_task)

#Blockers

def log_blocker(goal_id: int, description: str, task_id: int = None) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO blockers (goal_id, task_id, description) VALUES (?, ?, ?)",
        (goal_id, task_id, description)
    )
    conn.commit()
    blocker_id = cursor.lastrowid
    conn.close()
    return {"id": blocker_id, "goal_id": goal_id, "task_id": task_id, "description": description, "status": "open"}


def update_blocker(blocker_id: int, description: str = None, status: str = None) -> dict:
    fields = {"description": description, "status": status}
    updates = {k: v for k, v in fields.items() if v is not None}

    if not updates:
        raise ValueError("No fields provided to update")

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [blocker_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE blockers SET {set_clause} WHERE id = ?", values)
    conn.commit()
    cursor.execute("SELECT * FROM blockers WHERE id = ?", (blocker_id,))
    updated_blocker = cursor.fetchone()
    conn.close()
    return dict(updated_blocker)


