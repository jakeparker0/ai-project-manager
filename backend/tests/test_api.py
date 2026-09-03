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


def test_complete_and_restore_goal(client):
    goal_id = client.get("/goals").json()[0]["id"]

    resp = client.patch(f"/goals/{goal_id}", json={"status": "completed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    resp = client.patch(f"/goals/{goal_id}", json={"status": "active"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"


def test_update_nonexistent_goal_returns_404(client):
    resp = client.patch("/goals/99999", json={"status": "completed"})
    assert resp.status_code == 404


def test_delete_goal_removes_tasks_and_blockers(client):
    goal_id = client.get("/goals").json()[0]["id"]
    task = client.post("/tasks", json={"goal_id": goal_id, "title": "Doomed task"}).json()
    client.post("/blockers", json={"goal_id": goal_id, "description": "Doomed blocker"})

    resp = client.delete(f"/goals/{goal_id}")
    assert resp.status_code == 200

    assert goal_id not in [g["id"] for g in client.get("/goals").json()]
    assert client.get(f"/tasks?goal_id={goal_id}").json() == []
    assert client.get("/blockers").json() == []


def test_delete_nonexistent_goal_returns_404(client):
    resp = client.delete("/goals/99999")
    assert resp.status_code == 404


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


def test_delete_task_detaches_blockers(client):
    goal_id = client.get("/goals").json()[0]["id"]
    task = client.post("/tasks", json={"goal_id": goal_id, "title": "Doomed"}).json()
    blocker = client.post(
        "/blockers", json={"goal_id": goal_id, "description": "Blocked", "task_id": task["id"]}
    ).json()

    resp = client.delete(f"/tasks/{task['id']}")
    assert resp.status_code == 200

    assert task["id"] not in [t["id"] for t in client.get(f"/tasks?goal_id={goal_id}").json()]
    remaining = [b for b in client.get("/blockers").json() if b["id"] == blocker["id"]]
    assert len(remaining) == 1
    assert remaining[0]["task_id"] is None


def test_delete_nonexistent_task_returns_404(client):
    resp = client.delete("/tasks/99999")
    assert resp.status_code == 404


# ── Blockers ───────────────────────────────────────────────────────────────────

def test_blockers_list_is_empty_initially(client):
    resp = client.get("/blockers")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_blocker(client):
    goal_id = client.get("/goals").json()[0]["id"]
    resp = client.post("/blockers", json={"goal_id": goal_id, "description": "Waiting on access"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["description"] == "Waiting on access"
    assert body["status"] == "open"
    assert body["task_id"] is None

    blockers = client.get("/blockers").json()
    assert any(b["description"] == "Waiting on access" for b in blockers)


def test_create_blocker_with_task_id(client):
    goal_id = client.get("/goals").json()[0]["id"]
    task = client.post("/tasks", json={"goal_id": goal_id, "title": "Update CV"}).json()
    resp = client.post("/blockers", json={"goal_id": goal_id, "description": "Blocked", "task_id": task["id"]})
    assert resp.status_code == 200
    assert resp.json()["task_id"] == task["id"]


def test_resolve_nonexistent_blocker_returns_404(client):
    resp = client.patch("/blockers/99999", json={"status": "resolved"})
    assert resp.status_code == 404


def test_delete_blocker(client):
    goal_id = client.get("/goals").json()[0]["id"]
    blocker = client.post("/blockers", json={"goal_id": goal_id, "description": "Doomed"}).json()

    resp = client.delete(f"/blockers/{blocker['id']}")
    assert resp.status_code == 200
    assert client.get("/blockers").json() == []


def test_delete_nonexistent_blocker_returns_404(client):
    resp = client.delete("/blockers/99999")
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
