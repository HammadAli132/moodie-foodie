from typing import Optional
from pydantic import BaseModel, Field
from core.config import settings


class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    has_preferences: bool


class UpdateProfileRequest(BaseModel):
    """All fields optional — only provided fields are updated."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    current_password: Optional[str] = Field(default=None)
    new_password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class DietaryPreferencesRequest(BaseModel):
    """
    Sent during onboarding or profile update.
    All fields optional — only provided fields will be updated.
    """
    dietary_flags: Optional[list[str]] = Field(
        default=None,
        description=f"One or more of: {settings.VALID_DIETARY_FLAGS}",
    )
    allergens: Optional[list[str]] = Field(
        default=None,
        description=f"One or more of: {settings.VALID_ALLERGENS}",
    )

    def validated_flags(self) -> list[str]:
        if not self.dietary_flags:
            return []
        return [f.lower() for f in self.dietary_flags if f.lower() in settings.VALID_DIETARY_FLAGS]

    def validated_allergens(self) -> list[str]:
        if not self.allergens:
            return []
        return [a.lower() for a in self.allergens if a.lower() in settings.VALID_ALLERGENS]


class DietaryPreferencesResponse(BaseModel):
    user_id: str
    dietary_flags: list[str]
    allergens: list[str]