from core.config import settings


def sanitize_tags(tags: list[str]) -> list[str]:
    """Remove any tags not in the fixed vocabulary."""
    return [t.lower().strip() for t in tags if t.lower().strip() in settings.VALID_TAGS]


def deduplicate_dishes(dishes: list[dict]) -> list[dict]:
    """Remove duplicate dish+restaurant combos from a list."""
    seen = set()
    unique = []
    for dish in dishes:
        key = (dish["dish"].lower(), dish["restaurant"].lower())
        if key not in seen:
            seen.add(key)
            unique.append(dish)
    return unique


def format_tags_for_prompt(tags: list[str]) -> str:
    """Format tag list into a readable string for LLM prompts."""
    return ", ".join(tags)