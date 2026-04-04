from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from core.dependencies import get_current_user
from core.security import verify_password, hash_password
from database.mongodb import get_collection
from schemas.user import (
    UserProfileResponse,
    UpdateProfileRequest,
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


@router.patch("/me", response_model=UserProfileResponse)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update name and/or password.
    Password change requires current_password for verification.
    """
    users = get_collection("users")
    update_fields = {}

    # Name update
    if body.name is not None:
        update_fields["name"] = body.name.strip()

    # Password update — requires current_password
    if body.new_password is not None:
        if not body.current_password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="current_password is required to set a new password.",
            )
        if not verify_password(body.current_password, current_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect.",
            )
        update_fields["password_hash"] = hash_password(body.new_password)

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields provided to update.",
        )

    await users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields},
    )

    # Return fresh profile
    updated = await users.find_one({"_id": current_user["_id"]})
    prefs_col = get_collection("user_preferences")
    has_prefs = await prefs_col.find_one({"user_id": current_user["_id"]}) is not None

    return UserProfileResponse(
        user_id=str(updated["_id"]),
        name=updated["name"],
        email=updated["email"],
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
    """Create or fully replace the user's dietary preferences."""
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