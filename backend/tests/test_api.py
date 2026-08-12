import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
import database
import main


@pytest.fixture
def client(tmp_path):
    """
    Each test gets a fresh DB and mocked agent functions so no real
    Claude API calls are made and no state bleeds between tests.
    """
    db_path = tmp_path / "test.db"
    with patch.object(database, "DB_PATH", db_path):
        database.init_db()
        database.seed_goals()
        yield TestClient(main.app)


# ── Goals ──────────────────────────────────────────────────────────────────────

def test_list_goals_returns_seeded_data(client):
    resp = client.get("/goals")
    assert resp.status_code == 200
    goals = resp.json()
    assert len(goals) == 3
    assert goals[0]["title"] == "Land a software/product engineering role"
    # each goal should include tasks list and open blocker count
    assert "tasks" in goals[0]
    assert "open_blocker_count" in goals[0]


def test_create_goal(client):
    resp = client.post("/goals", json={"title": "Learn Rust", "horizon": "6 months"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "Learn Rust"
    assert body["horizon"] == "6 months"
    # should now appear in goal list
    titles = [g["title"] for g in client.get("/goals").json()]
    assert "Learn Rust" in titles


# ── Tasks ──────────────────────────────────────────────────────────────────────

def test_create_task_and_list_by_goal(client):
    goal_id = client.get("/goals").json()[0]["id"]
    resp = client.post("/tasks", json={"goal_id": goal_id, "title": "Update CV"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "todo"

    tasks = client.get(f"/tasks?goal_id={goal_id}").json()
    assert any(t["title"] == "Update CV" for t in tasks)


def test_update_task_status(client):
    goal_id = client.get("/goals").json()[0]["id"]
    task = client.post("/tasks", json={"goal_id": goal_id, "title": "Apply to jobs"}).json()

    resp = client.patch(f"/tasks/{task['id']}", json={"status": "done"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "done"


def test_update_nonexistent_task_returns_404(client):
    resp = client.patch("/tasks/99999", json={"status": "done"})
    assert resp.status_code == 404


# ── Blockers ───────────────────────────────────────────────────────────────────

def test_blockers_list_is_empty_initially(client):
    resp = client.get("/blockers")
    assert resp.status_code == 200
    assert resp.json() == []


def test_resolve_nonexistent_blocker_returns_404(client):
    resp = client.patch("/blockers/99999", json={"status": "resolved"})
    assert resp.status_code == 404


# ── Sessions ───────────────────────────────────────────────────────────────────

def test_sessions_list_is_empty_initially(client):
    resp = client.get("/sessions")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_session_appears_in_list(client):
    resp = client.post("/sessions", json={"content": "Sent a job application today"})
    assert resp.status_code == 200
    assert resp.json()["content"] == "Sent a job application today"

    sessions = client.get("/sessions").json()
    assert any(s["content"] == "Sent a job application today" for s in sessions)


def test_sessions_list_newest_first(client):
    client.post("/sessions", json={"content": "first update"})
    client.post("/sessions", json={"content": "second update"})
    sessions = client.get("/sessions").json()
    assert sessions[0]["content"] == "second update"
    assert sessions[1]["content"] == "first update"
