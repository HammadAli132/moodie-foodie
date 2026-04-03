from typing import Optional
from pydantic import BaseModel, Field
from core.config import settings


# ── Shared building blocks ─────────────────────────────────────────────────────

class UserAnswer(BaseModel):
    question: str
    answer: str


class DietaryContext(BaseModel):
    """
    Optional per-session dietary override.
    If the user is authenticated, their profile prefs are used automatically.
    This allows a guest user to still apply filters for a single session,
    or an authenticated user to temporarily override their profile.
    """
    dietary_flags: list[str] = Field(default_factory=list)
    allergens: list[str] = Field(default_factory=list)


# ── /generate-questions ────────────────────────────────────────────────────────

class GenerateQuestionsRequest(BaseModel):
    mood: str = Field(..., description=f"One of: {settings.VALID_MOODS}")


class QuestionOption(BaseModel):
    label: str
    value: str


class Question(BaseModel):
    question: str
    options: list[QuestionOption]


class GenerateQuestionsResponse(BaseModel):
    mood: str
    questions: list[Question]


# ── /get-recommendations ───────────────────────────────────────────────────────

class GetRecommendationsRequest(BaseModel):
    initial_mood: str = Field(..., description=f"One of: {settings.VALID_MOODS}")
    answers: list[UserAnswer]
    dietary_override: Optional[DietaryContext] = None  # Optional guest/override filters


class DishRecommendation(BaseModel):
    dish: str
    restaurant: str
    tags: list[str]
    reasoning: str
    foodpanda_link: str
    price_range: Optional[str] = None


class GetRecommendationsResponse(BaseModel):
    session_id: str
    refined_mood: str
    refined_tags: list[str]
    dietary_filters_applied: DietaryContext
    recommendations: list[DishRecommendation]