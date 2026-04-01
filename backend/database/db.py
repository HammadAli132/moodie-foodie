import sqlite3
import json
from core.config import settings


def get_connection():
    conn = sqlite3.connect(settings.FEEDBACK_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            initial_mood TEXT NOT NULL,
            refined_tags TEXT NOT NULL,       -- stored as JSON array string
            recommended_dishes TEXT NOT NULL, -- stored as JSON array string
            thumbs_up INTEGER NOT NULL,       -- 1 = yes, 0 = no
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized")


def save_feedback(
    session_id: str,
    initial_mood: str,
    refined_tags: list[str],
    recommended_dishes: list[str],
    thumbs_up: bool
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO feedback (session_id, initial_mood, refined_tags, recommended_dishes, thumbs_up)
        VALUES (?, ?, ?, ?, ?)
    """, (
        session_id,
        initial_mood,
        json.dumps(refined_tags),
        json.dumps(recommended_dishes),
        1 if thumbs_up else 0
    ))

    conn.commit()
    conn.close()


def get_all_feedback():
    """Utility: retrieve all feedback records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feedback ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]