from pydantic import BaseModel


class SubmitFeedbackRequest(BaseModel):
    session_id: str
    thumbs_up: bool


class SubmitFeedbackResponse(BaseModel):
    success: bool
    message: str