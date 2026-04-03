from fastapi import APIRouter
from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.recommendations import router as recommendations_router
from api.routes.feedback import router as feedback_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(recommendations_router)
api_router.include_router(feedback_router)


@api_router.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Foodie Moodie API"}