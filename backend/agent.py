from datetime import datetime
import os
from dotenv import load_dotenv
from anthropic import Anthropic
from database import get_db

import json

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-haiku-4-5-20251001"

SYSTEM_PROMPT = """You are Jake's personal AI project manager. You help him stay on track with his three main goals:

1. Land a software/product engineering role — Move from Oracle consulting into a product engineering role at a tech company working on something that matters. Target: fintech, climate tech, or a product he'd actually use. Timeline: 12 months.

2. Build and ship PM Agent — Build this AI project manager app as a side project and portfolio piece. It should be publicly on GitHub, functional, and something he'd actually use daily. Target: shipped MVP in 3 months.

3. Start a deliberate photography project — Stop only shooting when travelling. Pick a theme (Melbourne architecture, coastal landscapes, or something environmental), shoot 20 intentional images over 8 weeks, and edit them into a cohesive set. Timeline: 3 months.

Your responsibilities:
- Acknowledge updates conversationally and naturally
- When Jake mentions tasks or progress (even implicitly), extract them and confirm what you've logged
- When Jake mentions obstacles or blockers, note them and confirm
- Suggest what to focus on when it seems relevant or when asked
- Be direct and brief — not corporate, not overly enthusiastic, no filler phrases
- Treat Jake as an adult who knows what he's doing; add value, don't hand-hold

Important: Respond in plain text only. No markdown formatting — no bold, no bullet points with asterisks, no headers with #. This is a chat UI and markdown will render as raw characters. Use plain sentences and natural paragraph breaks instead."""


def get_context_summary() -> str:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals WHERE status = 'active'")
    goals = cursor.fetchall()

    parts = []
    for goal in goals:
        cursor.execute(
            "SELECT title, status FROM tasks WHERE goal_id = ?", (goal["id"],)
        )
        tasks = cursor.fetchall()
        cursor.execute(
            "SELECT description FROM blockers WHERE goal_id = ? AND status = 'open'",
            (goal["id"],),
        )
        blockers = cursor.fetchall()

        text = f"Goal: {goal['title']} ({goal['horizon']})"
        if tasks:
            text += "\nTasks:\n" + "\n".join(
                f"  - {t['title']} [{t['status']}]" for t in tasks
            )
        if blockers:
            text += "\nBlockers:\n" + "\n".join(
                f"  - {b['description']}" for b in blockers
            )
        parts.append(text)

    conn.close()
    return "\n\n".join(parts)

def get_focus_suggestion() -> str:
    context = get_context_summary()
    prompt = f"""Current state of Jake's goals and tasks:

{context}

What's the single most valuable thing Jake could work on tonight? Be specific and brief — one or two sentences max. Plain text only, no markdown."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=256,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text
