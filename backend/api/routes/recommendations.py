from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status

from core.dependencies import get_optional_user
from core.config import settings
from schemas.recommendations import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    Question,
    QuestionOption,
    GetRecommendationsRequest,
    GetRecommendationsResponse,
)
from services.llm_service import generate_questions
from services.recommendation_service import run_recommendation_pipeline

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions_endpoint(body: GenerateQuestionsRequest):
    """
    Step 1: User selects their initial mood.
    Returns 2-3 LLM-generated follow-up questions to refine it.
    Works for both authenticated and guest users.
    """
    if body.mood not in settings.VALID_MOODS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid mood. Must be one of: {settings.VALID_MOODS}",
        )

    try:
        raw_questions = generate_questions(body.mood)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    questions = [
        Question(
            question=q["question"],
            options=[QuestionOption(**opt) for opt in q["options"]],
        )
        for q in raw_questions
    ]

    return GenerateQuestionsResponse(mood=body.mood, questions=questions)


@router.post("/get-recommendations", response_model=GetRecommendationsResponse)
async def get_recommendations_endpoint(
    body: GetRecommendationsRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """
    Step 2: Full recommendation pipeline.
    - If authenticated: dietary prefs loaded from profile automatically.
    - dietary_override in the request body merges with (or replaces for guests) profile prefs.
    - Returns 3 dish recommendations with reasoning, session_id, and applied filters.
    """
    if body.initial_mood not in settings.VALID_MOODS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid mood. Must be one of: {settings.VALID_MOODS}",
        )

    try:
        result = await run_recommendation_pipeline(
            initial_mood=body.initial_mood,
            answers=body.answers,
            user=current_user,
            dietary_override=body.dietary_override,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

    return result