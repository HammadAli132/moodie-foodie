from fastapi import APIRouter, HTTPException, status
from bson import ObjectId

from core.security import hash_password, verify_password, create_access_token
from database.mongodb import get_collection
from schemas.auth import SignupRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


def _serialize_user(user: dict) -> dict:
    return {**user, "_id": str(user["_id"])}


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    users = get_collection("users")

    if await users.find_one({"email": body.email.lower()}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "is_active": True,
    }
    result = await users.insert_one(doc)
    user_id = str(result.inserted_id)

    token = create_access_token(subject=user_id)
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=doc["name"],
        email=doc["email"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    users = get_collection("users")
    user = await users.find_one({"email": body.email.lower()})

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(subject=str(user["_id"]))
    return TokenResponse(
        access_token=token,
        user_id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
    )