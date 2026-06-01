from fastmcp import FastMCP
from agent import get_current_context
from database import (
    get_db,
    log_session_entry as db_log_session_entry,
    create_goal as db_create_goal,
    create_task as db_create_task,
    log_blocker as db_log_blocker,
    update_goal as db_update_goal,
    update_task as db_update_task,
    update_blocker as db_update_blocker,
)

mcp = FastMCP("PM Agent")

@mcp.tool(
    name="get_context", 
    tags=["context", "status", "summary"],
    description="Fetches a summary of the current project context, including active goals, tasks, blockers, and recent session logs. This information can be used to inform decision-making and provide updates on project status."
)
def get_context() -> dict:
    '''Returns a summary of the current project context, including active goals, tasks, and blockers.'''
    return get_current_context()

# Session Logs
@mcp.tool(
    name="log_session",
    tags=["session", "log", "update"],
    description="Logs a session entry with the provided content. This tool is used to record significant events, decisions, or updates that occur during the project, providing a historical record that can be referenced in future sessions."
)
def log_session(content: str) -> dict:
    '''Logs a session entry with the provided content.'''
    return db_log_session_entry(content)

# Goals

@mcp.tool(
    name="create_goal" ,
    tags=["goal", "create", "update"],
    description="Creates a new goal. Requires a title and optionally a description. This tool is used to define new objectives for the project based on the current context and needs."
)
def create_goal(title: str, description: str = None, horizon: str = None) -> dict:
    '''Creates a new goal'''
    return db_create_goal(title, description, horizon)

@mcp.tool(
    name="update_goal",
    tags=["goal", "update"],
    description="""Updates one or more fields on an existing goal. Only provided fields will be updated.

Fields:
- title: the goal title
- description: longer form description of the goal  
- horizon: target timeframe (e.g. '3 months', '12 months')
- status: one of 'active', 'completed', 'paused', 'abandoned'

Requires the goal ID from get_context."""
)
def mcp_update_goal(goal_id: int, title: str = None, description: str = None, horizon: str = None, status: str = None) -> dict:
    return db_update_goal(goal_id, title=title, description=description, horizon=horizon, status=status)

# Tasks

@mcp.tool(
    name="create_task",
    tags=["task", "create", "update"],
    description="Creates a new task under a specified goal. Requires the goal ID, task title, and optionally a status (defaults to 'todo'). This tool is used to add new tasks to the project based on the current context and needs."
)
def create_task(goal_id: int, title: str, status: str = "todo") -> dict:
    '''Creates a new task under a specified goal.'''
    return db_create_task(goal_id, title, status)

@mcp.tool(
    name="update_task",
    tags=["task", "update"],
    description="""Updates one or more fields on an existing task. Only provided fields will be updated.

Fields:
- title: the task title
- status: one of 'todo', 'in progress', 'done'

Requires the task ID from get_context."""
)
def update_task(task_id: int, title: str = None, status: str = None) -> dict:
    return db_update_task(task_id, title=title, status=status)

# Blockers

@mcp.tool(
    name="log_blocker",
    tags=["blocker", "log", "update"],
    description="Logs a new blocker for a specified goal. Requires the goal ID and a description of the blocker. This tool is used to record obstacles that are hindering progress on a goal, allowing for better tracking and resolution of issues."
)
def log_blocker(goal_id: int, description: str, task_id: int = None) -> dict:
    '''Logs a new blocker for a specified goal.'''
    return db_log_blocker(goal_id, description, task_id)

@mcp.tool(
    name="update_blocker",
    tags=["blocker", "update"],
    description="""Updates the status of an existing blocker. Requires the blocker ID and the new status.

Fields: 
- status: one of 'open', 'resolved' (optional)
- description: updated description of the blocker (optional)

Requires the blocker ID from get_context."""
)
def update_blocker(blocker_id: int, description: str = None, status: str = None) -> dict:
    return db_update_blocker(blocker_id, description=description, status=status)

if __name__ == "__main__":
    mcp.run()