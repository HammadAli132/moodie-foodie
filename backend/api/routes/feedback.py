from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone

from core.dependencies import get_optional_user
from database.mongodb import get_collection
from schemas.feedback import SubmitFeedbackRequest, SubmitFeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/submit", response_model=SubmitFeedbackResponse)
async def submit_feedback(
    body: SubmitFeedbackRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """
    Attach a thumbs_up / thumbs_down to an existing session document.
    Works for both authenticated and guest users.
    The session must exist — we never create a session here.
    """
    sessions = get_collection("sessions")
    session = await sessions.find_one({"session_id": body.session_id})

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Cannot record feedback for an unknown session.",
        )

    await sessions.update_one(
        {"session_id": body.session_id},
        {
            "$set": {
                "feedback": {
                    "thumbs_up": body.thumbs_up,
                    "submitted_at": datetime.now(timezone.utc),
                    "user_id": current_user["_id"] if current_user else None,
                }
            }
        },
    )

    return SubmitFeedbackResponse(
        success=True,
        message="Thanks for the feedback! It helps us get better 🙌",
    )