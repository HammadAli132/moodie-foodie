import json
import random
from core.config import settings


def load_restaurants() -> list[dict]:
    try:
        with open(settings.RESTAURANTS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"restaurants.json not found at '{settings.RESTAURANTS_JSON_PATH}'. "
            "Ensure the data file exists in the backend/data/ folder."
        )


# ── Dietary filtering (hard exclusion) ────────────────────────────────────────

def _dish_passes_dietary_filters(
    dish: dict,
    required_flags: list[str],
    excluded_allergens: list[str],
) -> bool:
    """
    A dish is included ONLY if:
      1. It satisfies every required dietary flag (halal, vegan, vegetarian).
      2. It does not contain any of the user's allergens.
    """
    dish_dietary: dict = dish.get("dietary", {})

    # Check required flags
    for flag in required_flags:
        flag_key = f"is_{flag}"  # e.g., "is_halal", "is_vegan"
        if not dish_dietary.get(flag_key, False):
            return False

    # Check allergens
    dish_allergens: list[str] = dish_dietary.get("allergens", [])
    for allergen in excluded_allergens:
        if allergen in dish_allergens:
            return False

    return True


# ── Tag scoring ────────────────────────────────────────────────────────────────

def _score_dish(dish_tags: list[str], mood_tags: list[str]) -> float:
    """
    Normalized overlap score:  matching_tags / total_mood_tags.
    Avoids bias toward dishes with many tags.
    """
    if not mood_tags:
        return 0.0
    overlap = len(set(dish_tags) & set(mood_tags))
    return overlap / len(mood_tags)


# ── Restaurant-level diversity ────────────────────────────────────────────────

def _apply_diversity(candidates: list[dict], n: int) -> list[dict]:
    """
    Prefer recommendations from different restaurants when possible.
    Strategy: greedily pick the highest-scoring dish, then de-prioritize
    that restaurant for subsequent picks.
    """
    picks = []
    used_restaurants: set[str] = set()
    remaining = list(candidates)

    # First pass: pick best dish per restaurant
    for item in remaining:
        if item["restaurant"] not in used_restaurants and len(picks) < n:
            picks.append(item)
            used_restaurants.add(item["restaurant"])

    # Second pass: fill remaining slots if needed (same restaurant allowed)
    if len(picks) < n:
        for item in remaining:
            if item not in picks and len(picks) < n:
                picks.append(item)

    return picks[:n]


# ── Main entry point ───────────────────────────────────────────────────────────

def get_top_dishes(
    mood_tags: list[str],
    dietary_flags: list[str],
    excluded_allergens: list[str],
    n: int = 3,
) -> list[dict]:
    """
    Full matching pipeline:
    1. Load all dishes from restaurants.json
    2. Hard-filter by dietary constraints
    3. Score remaining dishes by tag overlap
    4. Apply restaurant diversity
    5. Return top N

    Falls back to comfort-tagged dishes if no matches survive filtering.
    """
    restaurants = load_restaurants()
    candidates = []

    for restaurant in restaurants:
        for dish in restaurant.get("dishes", []):
            # Step 1: Hard dietary filter
            if not _dish_passes_dietary_filters(dish, dietary_flags, excluded_allergens):
                continue

            # Step 2: Score by mood tag overlap
            dish_tags = dish.get("tags", [])
            score = _score_dish(dish_tags, mood_tags)

            candidates.append({
                "score": score,
                "dish": dish.get("name", ""),
                "restaurant": restaurant.get("restaurant", ""),
                "tags": dish_tags,
                "foodpanda_link": restaurant.get("link", ""),
                "price_range": dish.get("price_range", ""),
            })

    # Keep only dishes with at least one tag overlap
    matches = [c for c in candidates if c["score"] > 0]

    # Fallback: relax to "comfort" dishes that passed dietary filter
    if not matches:
        matches = [c for c in candidates if "comfort" in c["tags"]]

    # Final fallback: return anything that passed dietary filter
    if not matches:
        matches = candidates

    # Shuffle ties at the top score for variety across sessions
    if matches:
        top_score = matches[0]["score"]
        top_tier = [c for c in matches if c["score"] == top_score]
        rest = [c for c in matches if c["score"] < top_score]
        random.shuffle(top_tier)
        matches = top_tier + rest

    return _apply_diversity(matches, n)