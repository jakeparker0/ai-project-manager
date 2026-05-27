import sqlite3
from pathlib import Path

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
            goal_id INTEGER REFERENCES goals(id),
            description TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
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
