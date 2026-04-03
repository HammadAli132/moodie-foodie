from typing import Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.security import decode_access_token
from database.mongodb import get_collection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Require a valid JWT. Raises 401 if missing or invalid.
    Use this for protected endpoints.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    users = get_collection("users")
    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user


async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    """
    Optionally resolve the current user from a JWT.
    Returns None (no error) if unauthenticated.
    Use this for endpoints that work both logged-in and as a guest.
    """
    if not token:
        return None

    user_id = decode_access_token(token)
    if not user_id:
        return None

    users = get_collection("users")
    return await users.find_one({"_id": ObjectId(user_id)})