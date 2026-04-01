import json
import random
from core.config import settings


def load_restaurants() -> list[dict]:
    """Load restaurants from JSON file."""
    try:
        with open(settings.RESTAURANTS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"restaurants.json not found at {settings.RESTAURANTS_JSON_PATH}. "
            "Make sure Person 2's data file is in the backend/data/ folder."
        )


def score_dish(dish_tags: list[str], mood_tags: list[str]) -> int:
    """Count how many mood tags overlap with dish tags."""
    return len(set(mood_tags) & set(dish_tags))


def get_top_dishes(mood_tags: list[str], n: int = 3) -> list[dict]:
    """
    Score all dishes against mood tags, return top N.
    Falls back to comfort food if no matches found.
    """
    restaurants = load_restaurants()

    scored = []

    for restaurant in restaurants:
        for dish in restaurant.get("dishes", []):
            dish_tags = dish.get("tags", [])
            score = score_dish(dish_tags, mood_tags)

            scored.append({
                "score": score,
                "dish": dish.get("name", ""),
                "restaurant": restaurant.get("restaurant", ""),
                "tags": dish_tags,
                "foodpanda_link": restaurant.get("link", ""),
                "price_range": dish.get("price_range", ""),
            })

    # Filter dishes with at least 1 tag match
    matches = [d for d in scored if d["score"] > 0]

    # Fallback: if nothing matches, return dishes tagged "comfort"
    if not matches:
        matches = [
            d for d in scored
            if "comfort" in d["tags"]
        ]

    # Sort by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)

    # If there are ties at the top score, shuffle among tied dishes
    # so users don't always see the same results
    if len(matches) > n:
        top_score = matches[0]["score"]
        top_tier = [d for d in matches if d["score"] == top_score]
        rest = [d for d in matches if d["score"] < top_score]

        if len(top_tier) > n:
            random.shuffle(top_tier)
            return top_tier[:n]
        else:
            needed = n - len(top_tier)
            return top_tier + rest[:needed]

    return matches[:n]