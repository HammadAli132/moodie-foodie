import json
import re
from groq import Groq
from core.config import settings
from models.schemas import UserAnswer


# ─── LLM Client ───────────────────────────────────────────────────────────────

def call_llm(system_prompt: str, user_prompt: str) -> str:
    """Single entry point for all LLM calls via Groq API."""
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def _parse_json_response(raw: str) -> dict | list:
    """Strip markdown fences and parse JSON safely."""
    cleaned = re.sub(r"```json|```", "", raw).strip()
    return json.loads(cleaned)


# ─── LLM Tasks ────────────────────────────────────────────────────────────────

def generate_questions(mood: str) -> list[dict]:
    """
    Given an initial mood, generate 2-3 follow-up questions to refine it.
    Returns a list of {question, options} dicts.
    """
    system_prompt = """You are a helpful assistant for a food recommendation app.
Your job is to ask follow-up questions to better understand how the user is feeling,
so we can recommend the perfect food for their mood.
Always return valid JSON only. No extra text."""

    user_prompt = f"""The user selected their mood as: "{mood}"

Generate 2-3 short follow-up questions to better understand what kind of food they want.
Each question should have 3-4 short answer options.

Return ONLY this JSON format:
{{
  "questions": [
    {{
      "question": "How hungry are you right now?",
      "options": ["Just a snack", "Medium hungry", "Very hungry"]
    }},
    {{
      "question": "Do you prefer something familiar or want to try something new?",
      "options": ["Familiar comfort food", "Something new and exciting"]
    }}
  ]
}}"""

    raw = call_llm(system_prompt, user_prompt)
    parsed = _parse_json_response(raw)
    return parsed["questions"]


def predict_mood_and_tags(initial_mood: str, answers: list[UserAnswer]) -> dict:
    """
    Given initial mood + user answers, predict refined mood and extract tags.
    Tags MUST come from the fixed tag vocabulary.
    Returns {refined_mood, tags}
    """
    valid_tags_str = ", ".join(settings.VALID_TAGS)

    answers_text = "\n".join(
        [f"Q: {a.question}\nA: {a.answer}" for a in answers]
    )

    system_prompt = f"""You are a mood analysis assistant for a food recommendation app.
Your job is to analyze a user's mood and return food preference tags.
You MUST only use tags from this fixed list: [{valid_tags_str}]
Always return valid JSON only. No extra text."""

    user_prompt = f"""Initial mood: "{initial_mood}"

Follow-up Q&A:
{answers_text}

Based on the above, predict:
1. A short refined mood label (e.g., "stressed and tired", "happy and celebratory")
2. 3-5 food tags from the fixed list that best match this mood

Return ONLY this JSON format:
{{
  "refined_mood": "stressed and tired",
  "tags": ["comfort", "heavy", "quick"]
}}"""

    raw = call_llm(system_prompt, user_prompt)
    parsed = _parse_json_response(raw)

    # Sanitize: remove any tags not in the valid list
    parsed["tags"] = [t for t in parsed["tags"] if t in settings.VALID_TAGS]

    return parsed


def generate_reasoning(mood: str, dish_name: str, restaurant: str, tags: list[str]) -> str:
    """
    Generate a one-line human-friendly reasoning for why this dish was recommended.
    """
    system_prompt = """You are a friendly food recommendation assistant.
Write one short, warm, conversational sentence explaining why a dish matches someone's mood.
Keep it under 20 words. No markdown. Just the sentence."""

    user_prompt = f"""Mood: {mood}
Dish: {dish_name} from {restaurant}
Tags: {", ".join(tags)}

Write one sentence explaining why this dish is perfect for this mood."""

    return call_llm(system_prompt, user_prompt)