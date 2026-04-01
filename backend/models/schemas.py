from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class InitialMood(str, Enum):
    stressed = "stressed"
    happy = "happy"
    tired = "tired"
    celebratory = "celebratory"
    sad = "sad"
    neutral = "neutral"


# ─── Request Models ───────────────────────────────────────────────────────────

class GenerateQuestionsRequest(BaseModel):
    mood: InitialMood

class UserAnswer(BaseModel):
    question: str
    answer: str

class PredictMoodRequest(BaseModel):
    initial_mood: InitialMood
    answers: list[UserAnswer]

class GetRecommendationsRequest(BaseModel):
    initial_mood: InitialMood
    answers: list[UserAnswer]

class SubmitFeedbackRequest(BaseModel):
    session_id: str
    recommended_dishes: list[str]
    thumbs_up: bool
    initial_mood: str
    refined_tags: list[str]


# ─── Response Models ──────────────────────────────────────────────────────────

class Question(BaseModel):
    question: str
    options: Optional[list[str]] = None  # Optional multiple choice options

class GenerateQuestionsResponse(BaseModel):
    mood: str
    questions: list[Question]

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
    recommendations: list[DishRecommendation]

class SubmitFeedbackResponse(BaseModel):
    success: bool
    message: str