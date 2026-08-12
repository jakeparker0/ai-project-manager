from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from database import init_db, seed_goals, get_db
# from agent import get_focus_suggestion

from contextlib import asynccontextmanager

# @asynccontextmanager
# async def startup():
#     init_db()
#     seed_goals()
#     yield


# app = FastAPI(lifespan=startup)

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()
    seed_goals()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Goals ──────────────────────────────────────────────────────────────────────

@app.get("/goals")
def list_goals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals ORDER BY created_at ASC")
    goals = [dict(row) for row in cursor.fetchall()]
    for goal in goals:
        cursor.execute(
            "SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at ASC",
            (goal["id"],),
        )
        goal["tasks"] = [dict(row) for row in cursor.fetchall()]
        cursor.execute(
            "SELECT COUNT(*) as count FROM blockers WHERE goal_id = ? AND status = 'open'",
            (goal["id"],),
        )
        goal["open_blocker_count"] = cursor.fetchone()["count"]
    conn.close()
    return goals


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    horizon: Optional[str] = None


@app.post("/goals")
def create_goal(goal: GoalCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO goals (title, description, horizon) VALUES (?, ?, ?)",
        (goal.title, goal.description, goal.horizon),
    )
    conn.commit()
    goal_id = cursor.lastrowid
    cursor.execute("SELECT * FROM goals WHERE id = ?", (goal_id,))
    new_goal = dict(cursor.fetchone())
    new_goal["tasks"] = []
    new_goal["open_blocker_count"] = 0
    conn.close()
    return new_goal


# ── Tasks ──────────────────────────────────────────────────────────────────────

@app.get("/tasks")
def list_tasks(goal_id: Optional[int] = None):
    conn = get_db()
    cursor = conn.cursor()
    if goal_id:
        cursor.execute(
            "SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at ASC",
            (goal_id,),
        )
    else:
        cursor.execute("SELECT * FROM tasks ORDER BY created_at ASC")
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tasks


class TaskCreate(BaseModel):
    goal_id: int
    title: str


@app.post("/tasks")
def create_task(task: TaskCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (goal_id, title) VALUES (?, ?)",
        (task.goal_id, task.title),
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"id": task_id, **task.dict(), "status": "todo"}


class TaskUpdate(BaseModel):
    status: str


@app.patch("/tasks/{task_id}")
def update_task(task_id: int, update: TaskUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (update.status, task_id),
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    conn.commit()
    conn.close()
    return {"id": task_id, "status": update.status}


# ── Blockers ───────────────────────────────────────────────────────────────────

@app.get("/blockers")
def list_blockers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM blockers WHERE status = 'open' ORDER BY created_at DESC"
    )
    blockers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return blockers


class BlockerCreate(BaseModel):
    goal_id: int
    description: str
    task_id: Optional[int] = None


@app.post("/blockers")
def create_blocker(blocker: BlockerCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO blockers (goal_id, task_id, description) VALUES (?, ?, ?)",
        (blocker.goal_id, blocker.task_id, blocker.description),
    )
    conn.commit()
    blocker_id = cursor.lastrowid
    cursor.execute("SELECT * FROM blockers WHERE id = ?", (blocker_id,))
    new_blocker = dict(cursor.fetchone())
    conn.close()
    return new_blocker


class BlockerUpdate(BaseModel):
    status: str


@app.patch("/blockers/{blocker_id}")
def update_blocker(blocker_id: int, update: BlockerUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE blockers SET status = ? WHERE id = ?",
        (update.status, blocker_id),
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Blocker not found")
    conn.commit()
    conn.close()
    return {"id": blocker_id, "status": update.status}

# ── Focus ──────────────────────────────────────────────────────────────────────

# @app.get("/focus")
# def focus():
#     suggestion = get_focus_suggestion()
#     return {"suggestion": suggestion}


# ── Sessions ───────────────────────────────────────────────────────────────────

@app.get("/sessions")
def list_sessions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM session_logs ORDER BY created_at DESC, id DESC")
    sessions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sessions


class SessionCreate(BaseModel):
    content: str


@app.post("/sessions")
def create_session(session: SessionCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO session_logs (content) VALUES (?)",
        (session.content,),
    )
    conn.commit()
    session_id = cursor.lastrowid
    cursor.execute("SELECT * FROM session_logs WHERE id = ?", (session_id,))
    new_session = dict(cursor.fetchone())
    conn.close()
    return new_session
