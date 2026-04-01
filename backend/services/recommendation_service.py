import uuid
from models.schemas import UserAnswer, DishRecommendation
from services.llm_service import predict_mood_and_tags, generate_reasoning
from services.matching_service import get_top_dishes
from core.config import settings


def get_recommendations(
    initial_mood: str,
    answers: list[UserAnswer]
) -> dict:
    """
    Full recommendation pipeline:
    1. LLM predicts refined mood + tags from user answers
    2. Tag matching finds top dishes
    3. LLM generates reasoning for each dish
    4. Returns final recommendations
    """

    # Step 1: Predict mood + extract tags
    mood_result = predict_mood_and_tags(initial_mood, answers)
    refined_mood = mood_result["refined_mood"]
    refined_tags = mood_result["tags"]

    # Step 2: Match dishes by tags
    top_dishes = get_top_dishes(refined_tags, n=settings.MAX_RECOMMENDATIONS)

    # Step 3: Generate reasoning for each dish
    recommendations = []
    for dish in top_dishes:
        reasoning = generate_reasoning(
            mood=refined_mood,
            dish_name=dish["dish"],
            restaurant=dish["restaurant"],
            tags=dish["tags"]
        )
        recommendations.append(DishRecommendation(
            dish=dish["dish"],
            restaurant=dish["restaurant"],
            tags=dish["tags"],
            reasoning=reasoning,
            foodpanda_link=dish["foodpanda_link"],
            price_range=dish.get("price_range", ""),
        ))

    session_id = str(uuid.uuid4())

    return {
        "session_id": session_id,
        "refined_mood": refined_mood,
        "refined_tags": refined_tags,
        "recommendations": recommendations,
    }