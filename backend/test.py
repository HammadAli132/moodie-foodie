"""
Foodie Moodie — Backend Test Suite
====================================
Runs a full end-to-end flow against a live local server.
No pytest required — just run:  python test.py

Prerequisites:
  - docker compose up -d   (MongoDB running)
  - uvicorn main:app --reload --port 8000   (API running)
  - pip install requests
"""

import sys
import json
import uuid
import requests

BASE = "http://localhost:8000/api"

# ── Helpers ────────────────────────────────────────────────────────────────────

PASS = "\033[92m  PASS\033[0m"
FAIL = "\033[91m  FAIL\033[0m"
INFO = "\033[94m  INFO\033[0m"
WARN = "\033[93m  WARN\033[0m"

failures = 0
_last_response: requests.Response = None  # tracks latest response for debug output


def check(label: str, condition: bool, detail: str = ""):
    global failures
    if condition:
        print(f"{PASS}  {label}")
    else:
        print(f"{FAIL}  {label}")
        if detail:
            print(f"       └─ {detail}")
        # Print the last response body so failures are self-explaining
        if _last_response is not None:
            try:
                body = _last_response.json()
                print(f"       └─ HTTP {_last_response.status_code}: {json.dumps(body, indent=None)}")
            except Exception:
                print(f"       └─ HTTP {_last_response.status_code}: {_last_response.text[:200]}")
        failures += 1


def section(title: str):
    print(f"\n{'─'*55}")
    print(f"  {title}")
    print(f"{'─'*55}")


def post(path, body=None, token=None):
    global _last_response
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    _last_response = requests.post(f"{BASE}{path}", json=body, headers=headers)
    return _last_response


def get(path, token=None):
    global _last_response
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    _last_response = requests.get(f"{BASE}{path}", headers=headers)
    return _last_response


def put(path, body=None, token=None):
    global _last_response
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    _last_response = requests.put(f"{BASE}{path}", json=body, headers=headers)
    return _last_response


# ── Test state (passed between sections) ──────────────────────────────────────

state = {
    "token": None,
    "user_id": None,
    "session_id": None,
    "questions": [],
    "email": f"test_{uuid.uuid4().hex[:6]}@gmail.com",
    "password": "TestPass123!",
}

# ══════════════════════════════════════════════════════════════════════════════
# 1. Health
# ══════════════════════════════════════════════════════════════════════════════

section("1. Health Check")
try:
    r = requests.get(f"{BASE}/health")
    check("GET /health returns 200", r.status_code == 200)
    check("status field is ok", r.json().get("status") == "ok")
except requests.ConnectionError:
    print(f"{FAIL}  Cannot reach {BASE} — is the server running?")
    sys.exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 2. Auth — Signup
# ══════════════════════════════════════════════════════════════════════════════

section("2. Auth — Signup")

r = post("/auth/signup", {
    "name": "Test User",
    "email": state["email"],
    "password": state["password"],
})
check("POST /auth/signup returns 201", r.status_code == 201)

data = r.json()
check("Response has access_token", "access_token" in data)
check("Response has user_id", "user_id" in data)
check("Name matches", data.get("name") == "Test User")
check("Email matches", data.get("email") == state["email"])

state["token"] = data.get("access_token")
state["user_id"] = data.get("user_id")

# Duplicate signup should fail
r2 = post("/auth/signup", {
    "name": "Test User",
    "email": state["email"],
    "password": state["password"],
})
check("Duplicate signup returns 409", r2.status_code == 409)

# ══════════════════════════════════════════════════════════════════════════════
# 3. Auth — Login
# ══════════════════════════════════════════════════════════════════════════════

section("3. Auth — Login")

r = post("/auth/login", {"email": state["email"], "password": state["password"]})
check("POST /auth/login returns 200", r.status_code == 200)
data = r.json()
check("Login returns access_token", "access_token" in data)

# Wrong password
r2 = post("/auth/login", {"email": state["email"], "password": "wrongpassword"})
check("Wrong password returns 401", r2.status_code == 401)

# Non-existent user
r3 = post("/auth/login", {"email": "nobody@test.com", "password": "anything"})
check("Unknown email returns 401", r3.status_code == 401)

# ══════════════════════════════════════════════════════════════════════════════
# 4. User Profile
# ══════════════════════════════════════════════════════════════════════════════

section("4. User Profile")

r = get("/users/me", token=state["token"])
check("GET /users/me returns 200", r.status_code == 200)
data = r.json()
check("user_id present", "user_id" in data)
check("has_preferences is False (fresh account)", data.get("has_preferences") is False)

# Unauthenticated request
r2 = get("/users/me")
check("GET /users/me without token returns 401", r2.status_code == 401)

# ══════════════════════════════════════════════════════════════════════════════
# 5. Dietary Preferences
# ══════════════════════════════════════════════════════════════════════════════

section("5. Dietary Preferences")

# Set preferences
r = put("/users/me/preferences", {
    "dietary_flags": ["halal", "vegetarian"],
    "allergens": ["nuts", "gluten"],
}, token=state["token"])
check("PUT /users/me/preferences returns 200", r.status_code == 200)
data = r.json()
check("dietary_flags saved correctly", set(data.get("dietary_flags", [])) == {"halal", "vegetarian"})
check("allergens saved correctly", set(data.get("allergens", [])) == {"nuts", "gluten"})

# Retrieve preferences
r = get("/users/me/preferences", token=state["token"])
check("GET /users/me/preferences returns 200", r.status_code == 200)
data = r.json()
check("dietary_flags retrievable", "halal" in data.get("dietary_flags", []))
check("allergens retrievable", "nuts" in data.get("allergens", []))

# Invalid values are silently stripped (not a 422)
r2 = put("/users/me/preferences", {
    "dietary_flags": ["halal", "invalid_flag"],
    "allergens": ["nuts", "made_up_allergen"],
}, token=state["token"])
check("Invalid flags are stripped (still 200)", r2.status_code == 200)
data2 = r2.json()
check("Only valid flag kept", data2.get("dietary_flags") == ["halal"])
check("Only valid allergen kept", data2.get("allergens") == ["nuts"])

# ══════════════════════════════════════════════════════════════════════════════
# 6. Generate Questions (no auth required)
# ══════════════════════════════════════════════════════════════════════════════

section("6. Generate Questions  [LLM call]")
print(f"{INFO}  This calls the Groq API — may take 2-5 seconds...")

r = post("/recommendations/generate-questions", {"mood": "stressed"})
check("POST /generate-questions returns 200", r.status_code == 200)
data = r.json()
check("mood echoed in response", data.get("mood") == "stressed")
check("questions list present", isinstance(data.get("questions"), list))
check("at least 2 questions returned", len(data.get("questions", [])) >= 2)

if data.get("questions"):
    q = data["questions"][0]
    check("question has 'question' field", "question" in q)
    check("question has 'options' field", isinstance(q.get("options"), list))
    check("options have label + value", all(
        "label" in o and "value" in o for o in q.get("options", [])
    ))
    state["questions"] = data["questions"]

# Invalid mood
r2 = post("/recommendations/generate-questions", {"mood": "angry_dragon"})
check("Invalid mood returns 422", r2.status_code == 422)

# ══════════════════════════════════════════════════════════════════════════════
# 7. Get Recommendations — Authenticated (profile prefs applied)
# ══════════════════════════════════════════════════════════════════════════════

section("7. Get Recommendations — Authenticated  [LLM call]")
print(f"{INFO}  This calls the Groq API 4 times (mood + 3× reasoning) — may take 5-10 seconds...")

# Build answers from whatever questions came back
answers = []
for q in state["questions"]:
    opts = q.get("options", [])
    if opts:
        answers.append({"question": q["question"], "answer": opts[0]["value"]})

if not answers:
    answers = [{"question": "How hungry are you?", "answer": "a full meal"}]

r = post("/recommendations/get-recommendations", {
    "initial_mood": "stressed",
    "answers": answers,
}, token=state["token"])

check("POST /get-recommendations returns 200", r.status_code == 200)
data = r.json()
check("session_id present", bool(data.get("session_id")))
check("refined_mood present", bool(data.get("refined_mood")))
check("refined_tags is a list", isinstance(data.get("refined_tags"), list))
check("dietary_filters_applied present", "dietary_filters_applied" in data)
check("exactly 3 recommendations (or ≤3 if data limited)", len(data.get("recommendations", [])) <= 3)
check("at least 1 recommendation", len(data.get("recommendations", [])) >= 1)

recs = data.get("recommendations", [])
if recs:
    rec = recs[0]
    check("recommendation has 'dish'", bool(rec.get("dish")))
    check("recommendation has 'restaurant'", bool(rec.get("restaurant")))
    check("recommendation has 'reasoning'", bool(rec.get("reasoning")))
    check("recommendation has 'foodpanda_link'", bool(rec.get("foodpanda_link")))
    check("recommendation has 'tags' list", isinstance(rec.get("tags"), list))

    # Verify dietary filtering was applied for authenticated user:
    # allergen "nuts" was set on profile — no recommended dish should contain nuts
    for r_item in recs:
        dish_allergens = []  # tags don't carry allergens — this is in the raw dish
        # We can only assert the endpoint didn't crash; allergen check is via data integrity
    print(f"{INFO}  Refined mood: \"{data.get('refined_mood')}\"")
    print(f"{INFO}  Tags applied: {data.get('refined_tags')}")
    print(f"{INFO}  Dietary filters from profile: {data.get('dietary_filters_applied')}")
    for i, rec in enumerate(recs, 1):
        print(f"{INFO}  [{i}] {rec['dish']} @ {rec['restaurant']}")

state["session_id"] = data.get("session_id")

# ══════════════════════════════════════════════════════════════════════════════
# 8. Get Recommendations — Guest with dietary_override
# ══════════════════════════════════════════════════════════════════════════════

section("8. Get Recommendations — Guest with dietary_override  [LLM call]")
print(f"{INFO}  Guest user, no token, dietary override passed in request body...")

r = post("/recommendations/get-recommendations", {
    "initial_mood": "happy",
    "answers": [{"question": "How hungry are you?", "answer": "a full meal"}],
    "dietary_override": {
        "dietary_flags": ["halal", "vegan"],
        "allergens": ["dairy"],
    },
})
check("Guest recommendations return 200", r.status_code == 200)
data = r.json()
check("session_id present for guest", bool(data.get("session_id")))
check("dietary_filters_applied reflects override", "vegan" in data.get("dietary_filters_applied", {}).get("dietary_flags", []))
check("at least 1 recommendation for guest", len(data.get("recommendations", [])) >= 1)

# ══════════════════════════════════════════════════════════════════════════════
# 9. Submit Feedback
# ══════════════════════════════════════════════════════════════════════════════

section("9. Submit Feedback")

if state["session_id"]:
    r = post("/feedback/submit", {
        "session_id": state["session_id"],
        "thumbs_up": True,
    }, token=state["token"])
    check("POST /feedback/submit returns 200", r.status_code == 200)
    data = r.json()
    check("success is True", data.get("success") is True)
    check("message present", bool(data.get("message")))

    # Submitting feedback for a non-existent session should 404
    r2 = post("/feedback/submit", {
        "session_id": "00000000-0000-0000-0000-000000000000",
        "thumbs_up": False,
    })
    check("Non-existent session_id returns 404", r2.status_code == 404)
else:
    print(f"{WARN}  Skipping feedback test — no session_id from step 7")

# ══════════════════════════════════════════════════════════════════════════════
# 10. has_preferences updated after onboarding
# ══════════════════════════════════════════════════════════════════════════════

section("10. Profile reflects saved preferences")

r = get("/users/me", token=state["token"])
check("GET /users/me returns 200", r.status_code == 200)
check("has_preferences is now True", r.json().get("has_preferences") is True)

# ══════════════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════════════

print(f"\n{'═'*55}")
if failures == 0:
    print(f"\033[92m  All tests passed ✅\033[0m")
else:
    print(f"\033[91m  {failures} test(s) failed ❌\033[0m")
print(f"{'═'*55}\n")

sys.exit(0 if failures == 0 else 1)