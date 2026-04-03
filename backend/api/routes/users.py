from fastapi import APIRouter, Depends
from bson import ObjectId

from core.dependencies import get_current_user
from database.mongodb import get_collection
from schemas.user import (
    UserProfileResponse,
    DietaryPreferencesRequest,
    DietaryPreferencesResponse,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    prefs_col = get_collection("user_preferences")
    has_prefs = await prefs_col.find_one({"user_id": current_user["_id"]}) is not None

    return UserProfileResponse(
        user_id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        has_preferences=has_prefs,
    )


@router.get("/me/preferences", response_model=DietaryPreferencesResponse)
async def get_preferences(current_user: dict = Depends(get_current_user)):
    prefs_col = get_collection("user_preferences")
    prefs = await prefs_col.find_one({"user_id": current_user["_id"]})

    if not prefs:
        return DietaryPreferencesResponse(
            user_id=str(current_user["_id"]),
            dietary_flags=[],
            allergens=[],
        )

    return DietaryPreferencesResponse(
        user_id=str(current_user["_id"]),
        dietary_flags=prefs.get("dietary_flags", []),
        allergens=prefs.get("allergens", []),
    )


@router.put("/me/preferences", response_model=DietaryPreferencesResponse)
async def upsert_preferences(
    body: DietaryPreferencesRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create or fully replace the user's dietary preferences.
    Called during onboarding and when the user updates their profile.
    """
    prefs_col = get_collection("user_preferences")

    update_doc = {
        "user_id": current_user["_id"],
        "dietary_flags": body.validated_flags(),
        "allergens": body.validated_allergens(),
    }

    await prefs_col.update_one(
        {"user_id": current_user["_id"]},
        {"$set": update_doc},
        upsert=True,
    )

    return DietaryPreferencesResponse(
        user_id=str(current_user["_id"]),
        dietary_flags=update_doc["dietary_flags"],
        allergens=update_doc["allergens"],
    )