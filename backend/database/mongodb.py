from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, IndexModel
from core.config import settings

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect():
    """Open the Motor connection and ensure indexes exist."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _db = _client[settings.MONGODB_DB_NAME]
    await _create_indexes()
    print("✅ Connected to MongoDB")


async def disconnect():
    """Close the Motor connection."""
    global _client
    if _client:
        _client.close()
        print("🔌 Disconnected from MongoDB")


def get_collection(name: str):
    """Return a Motor collection by name."""
    return _db[name]


async def _create_indexes():
    """
    Declare all indexes in one place so they are idempotent on startup.
    """
    # users
    await _db["users"].create_indexes([
        IndexModel([("email", ASCENDING)], unique=True, name="unique_email"),
    ])

    # user_preferences — one document per user
    await _db["user_preferences"].create_indexes([
        IndexModel([("user_id", ASCENDING)], unique=True, name="unique_user_prefs"),
    ])

    # sessions — queried by session_id and user_id
    await _db["sessions"].create_indexes([
        IndexModel([("session_id", ASCENDING)], unique=True, name="unique_session_id"),
        IndexModel([("user_id", ASCENDING)], name="idx_session_user"),
        IndexModel([("created_at", ASCENDING)], name="idx_session_created"),
    ])

    print("✅ MongoDB indexes ensured")