from fastapi import APIRouter, HTTPException
from models.schemas import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    PredictMoodRequest,
    GetRecommendationsRequest,
    GetRecommendationsResponse,
    SubmitFeedbackRequest,
    SubmitFeedbackResponse,
    Question,
)
from services.llm_service import generate_questions, predict_mood_and_tags
from services.recommendation_service import get_recommendations
from database.db import save_feedback

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Foodie Moodie backend is healthy"}


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions_endpoint(body: GenerateQuestionsRequest):
    """
    Step 1: User picks initial mood.
    Returns 2-3 follow-up questions to refine the mood.
    """
    try:
        questions_raw = generate_questions(body.mood.value)
        questions = [Question(**q) for q in questions_raw]
        return GenerateQuestionsResponse(
            mood=body.mood.value,
            questions=questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")


@router.post("/predict-mood")
def predict_mood_endpoint(body: PredictMoodRequest):
    """
    Step 2 (optional standalone): Predict refined mood + tags from answers.
    Frontend can use this separately if needed.
    """
    try:
        result = predict_mood_and_tags(body.initial_mood.value, body.answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")


@router.post("/get-recommendations", response_model=GetRecommendationsResponse)
def get_recommendations_endpoint(body: GetRecommendationsRequest):
    """
    Step 3: Full pipeline.
    Takes mood + answers → returns 3 dish recommendations with reasoning.
    """
    try:
        result = get_recommendations(
            initial_mood=body.initial_mood.value,
            answers=body.answers
        )
        return GetRecommendationsResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.post("/submit-feedback", response_model=SubmitFeedbackResponse)
def submit_feedback_endpoint(body: SubmitFeedbackRequest):
    """
    Step 4: Store user feedback (thumbs up/down).
    """
    try:
        save_feedback(
            session_id=body.session_id,
            initial_mood=body.initial_mood,
            refined_tags=body.refined_tags,
            recommended_dishes=body.recommended_dishes,
            thumbs_up=body.thumbs_up,
        )
        return SubmitFeedbackResponse(
            success=True,
            message="Feedback saved! Thanks for helping us improve 🙌"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback error: {str(e)}")