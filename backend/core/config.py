from pydantic_settings import BaseSettings
from os import environ

class Settings(BaseSettings):
    # Groq API
    GROQ_API_KEY: str = environ.get("GROQ_API_KEY")  # Replace with your actual API key or set in .env
    # Recommended free models on Groq: llama-3.3-70b-versatile, mixtral-8x7b-32768, gemma2-9b-it
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # App settings
    RESTAURANTS_JSON_PATH: str = "data/restaurants.json"
    FEEDBACK_DB_PATH: str = "data/feedback.db"
    MAX_RECOMMENDATIONS: int = 3

    # Fixed tag vocabulary - LLM must only output tags from this list
    VALID_TAGS: list[str] = [
        "comfort", "spicy", "light", "heavy", "sweet",
        "quick", "filling", "healthy", "premium", "cozy",
        "trendy", "sharing", "cheap", "savory"
    ]

    class Config:
        env_file = ".env"


settings = Settings()