import json
import re
from groq import Groq
from core.config import settings
from prompts.templates import (
    GENERATE_QUESTIONS_SYSTEM,
    GENERATE_QUESTIONS_USER,
    PREDICT_MOOD_SYSTEM,
    PREDICT_MOOD_USER,
    GENERATE_REASONING_SYSTEM,
    GENERATE_REASONING_USER,
)

_client = Groq(api_key=settings.GROQ_API_KEY)


# ── Internal helpers ───────────────────────────────────────────────────────────

def _call_llm(system: str, user: str, temperature: float = 0.7) -> str:
    """Single entry point for all Groq calls."""
    response = _client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=temperature,
    )
    return response.choices[0].message.content.strip()


def _parse_json(raw: str) -> dict | list:
    """Strip markdown fences and parse JSON safely."""
    cleaned = re.sub(r"```json\s*|```", "", raw).strip()
    return json.loads(cleaned)


# ── Public LLM tasks ───────────────────────────────────────────────────────────

def generate_questions(mood: str) -> list[dict]:
    """
    Given an initial mood string, generate 2-3 contextual follow-up questions.
    Returns a list of {question, options: [{label, value}]} dicts.
    """
    user_prompt = GENERATE_QUESTIONS_USER.format(mood=mood)
    raw = _call_llm(GENERATE_QUESTIONS_SYSTEM, user_prompt, temperature=0.8)
    parsed = _parse_json(raw)
    return parsed["questions"]


def predict_mood_and_tags(initial_mood: str, answers: list) -> dict:
    """
    Given initial mood + user answers, predict refined mood and food tags.
    Tags are sanitized against VALID_TAGS before returning.
    Returns {refined_mood: str, tags: list[str]}
    """
    answers_block = "\n".join(
        f"  Q: {a.question}\n  A: {a.answer}" for a in answers
    )
    user_prompt = PREDICT_MOOD_USER.format(
        initial_mood=initial_mood,
        answers_block=answers_block,
    )
    raw = _call_llm(PREDICT_MOOD_SYSTEM, user_prompt, temperature=0.5)
    parsed = _parse_json(raw)

    # Sanitize — only allow tags from the fixed vocabulary
    parsed["tags"] = [
        t for t in parsed.get("tags", []) if t in settings.VALID_TAGS
    ]
    return parsed


def generate_reasoning(refined_mood: str, dish_name: str, restaurant: str, tags: list[str]) -> str:
    """
    Generate one warm sentence explaining why a dish matches the user's mood.
    Temperature 0.9 for creative variation across the 3 picks.
    """
    user_prompt = GENERATE_REASONING_USER.format(
        refined_mood=refined_mood,
        dish_name=dish_name,
        restaurant=restaurant,
        tags=", ".join(tags),
    )
    return _call_llm(GENERATE_REASONING_SYSTEM, user_prompt, temperature=0.9)