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
        with patch("main.chat", return_value="Got it, logged."), \
             patch("main.get_focus_suggestion", return_value="Ship the MVP."):
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


# ── Chat ───────────────────────────────────────────────────────────────────────

def test_chat_returns_mocked_reply(client):
    resp = client.post("/chat", json={"message": "Just finished my CV"})
    assert resp.status_code == 200
    assert resp.json()["reply"] == "Got it, logged."


def test_chat_history_starts_empty(client):
    resp = client.get("/chat/history")
    assert resp.status_code == 200
    assert resp.json() == []


def test_chat_history_persists_both_sides(client):
    client.post("/chat", json={"message": "Sent a job application today"})
    messages = client.get("/chat/history").json()
    roles = [m["role"] for m in messages]
    assert "user" in roles
    assert "assistant" in roles
    assert any(m["content"] == "Sent a job application today" for m in messages)


# ── Focus ──────────────────────────────────────────────────────────────────────

def test_focus_returns_suggestion(client):
    resp = client.get("/focus")
    assert resp.status_code == 200
    assert resp.json()["suggestion"] == "Ship the MVP."
