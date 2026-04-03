import uuid
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from database.mongodb import get_collection
from schemas.recommendations import (
    DietaryContext,
    DishRecommendation,
    GetRecommendationsResponse,
)
from services.llm_service import predict_mood_and_tags, generate_reasoning
from services.matching_service import get_top_dishes
from core.config import settings


async def _resolve_dietary_context(
    user: Optional[dict],
    dietary_override: Optional[DietaryContext],
) -> DietaryContext:
    """
    Merge dietary context from two sources (priority: override > profile > empty):
    - If authenticated, load the user's saved preferences from DB.
    - If a per-request override is provided, merge it on top (union of restrictions).
    """
    flags: set[str] = set()
    allergens: set[str] = set()

    # Load from user profile if authenticated
    if user:
        prefs_col = get_collection("user_preferences")
        prefs = await prefs_col.find_one({"user_id": ObjectId(user["_id"])})
        if prefs:
            flags.update(prefs.get("dietary_flags", []))
            allergens.update(prefs.get("allergens", []))

    # Layer override on top
    if dietary_override:
        flags.update(dietary_override.dietary_flags)
        allergens.update(dietary_override.allergens)

    return DietaryContext(
        dietary_flags=list(flags),
        allergens=list(allergens),
    )


async def run_recommendation_pipeline(
    initial_mood: str,
    answers: list,
    user: Optional[dict],
    dietary_override: Optional[DietaryContext],
) -> GetRecommendationsResponse:
    """
    Full pipeline:
    1. Resolve dietary context (profile + override)
    2. LLM: predict refined mood + food tags
    3. Matching: filter + score dishes
    4. LLM: generate per-dish reasoning
    5. Persist session to MongoDB
    6. Return structured response
    """

    # Step 1: Dietary context
    dietary_ctx = await _resolve_dietary_context(user, dietary_override)

    # Step 2: LLM mood + tag prediction
    mood_result = predict_mood_and_tags(initial_mood, answers)
    refined_mood: str = mood_result["refined_mood"]
    refined_tags: list[str] = mood_result["tags"]

    # Step 3: Dish matching with dietary hard-filter
    top_dishes = get_top_dishes(
        mood_tags=refined_tags,
        dietary_flags=dietary_ctx.dietary_flags,
        excluded_allergens=dietary_ctx.allergens,
        n=settings.MAX_RECOMMENDATIONS,
    )

    # Step 4: Per-dish reasoning
    recommendations: list[DishRecommendation] = []
    for dish in top_dishes:
        reasoning = generate_reasoning(
            refined_mood=refined_mood,
            dish_name=dish["dish"],
            restaurant=dish["restaurant"],
            tags=dish["tags"],
        )
        recommendations.append(DishRecommendation(
            dish=dish["dish"],
            restaurant=dish["restaurant"],
            tags=dish["tags"],
            reasoning=reasoning,
            foodpanda_link=dish["foodpanda_link"],
            price_range=dish.get("price_range"),
        ))

    # Step 5: Persist session
    session_id = str(uuid.uuid4())
    session_doc = {
        "session_id": session_id,
        "user_id": ObjectId(user["_id"]) if user else None,
        "initial_mood": initial_mood,
        "refined_mood": refined_mood,
        "refined_tags": refined_tags,
        "dietary_filters_applied": dietary_ctx.model_dump(),
        "recommendations": [r.model_dump() for r in recommendations],
        "feedback": None,
        "created_at": datetime.now(timezone.utc),
    }
    sessions = get_collection("sessions")
    await sessions.insert_one(session_doc)

    # Step 6: Return
    return GetRecommendationsResponse(
        session_id=session_id,
        refined_mood=refined_mood,
        refined_tags=refined_tags,
        dietary_filters_applied=dietary_ctx,
        recommendations=recommendations,
    )