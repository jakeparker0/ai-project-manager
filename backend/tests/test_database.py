import pytest
from unittest.mock import patch
import database


@pytest.fixture
def db(tmp_path):
    """Fresh in-memory-equivalent DB for each test — never touches pm_agent.db."""
    db_path = tmp_path / "test.db"
    with patch.object(database, "DB_PATH", db_path):
        database.init_db()
        yield database


def test_init_db_creates_all_tables(db):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cursor.fetchall()}
    conn.close()
    assert tables == {"goals", "tasks", "blockers", "messages"}


def test_seed_goals_inserts_three(db):
    db.seed_goals()
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM goals ORDER BY id")
    titles = [row[0] for row in cursor.fetchall()]
    conn.close()
    assert len(titles) == 3
    assert titles[0] == "Land a software/product engineering role"
    assert titles[1] == "Build and ship PM Agent"
    assert titles[2] == "Start a deliberate photography project"


def test_seed_goals_is_idempotent(db):
    db.seed_goals()
    db.seed_goals()  # second call must not insert duplicates
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM goals")
    count = cursor.fetchone()[0]
    conn.close()
    assert count == 3
