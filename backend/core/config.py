from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):

    # ── MongoDB ────────────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://admin:secret@localhost:27017/foodie_moodie?authSource=admin"
    MONGODB_DB_NAME: str = "foodie_moodie"

    # ── JWT ────────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── Groq LLM ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ── App ────────────────────────────────────────────────────────────────────
    RESTAURANTS_JSON_PATH: str = "data/restaurants.json"
    MAX_RECOMMENDATIONS: int = 3

    # Fixed tag vocabulary — LLM must only output tags from this list.
    # Dietary tags are intentionally excluded; dietary filtering is a hard
    # pre-processing step, not a scoring tag.
    VALID_TAGS: list[str] = [
        "comfort", "spicy", "light", "heavy", "sweet", "savory",
        "quick", "filling", "healthy", "premium", "cozy", "trendy",
        "sharing", "cheap", "crispy", "hearty", "rich", "refreshing",
        "indulgent", "warm",
    ]

    # Controlled vocabularies for dietary data
    VALID_ALLERGENS: list[str] = ["gluten", "nuts", "dairy", "eggs", "shellfish", "soy"]
    VALID_DIETARY_FLAGS: list[str] = ["halal", "vegan", "vegetarian"]

    # Allowed mood values for the initial picker
    VALID_MOODS: list[str] = [
        "stressed", "happy", "tired", "celebratory", "sad", "neutral",
        "anxious", "bored", "excited", "romantic",
    ]

    class Config:
        env_file = ".env"


settings = Settings()