import httpx
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing /api/health...")
    try:
        response = httpx.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_generate_questions():
    print("\nTesting /api/generate-questions...")
    payload = {"mood": "happy"}
    try:
        response = httpx.post(f"{BASE_URL}/api/generate-questions", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_predict_mood():
    print("\nTesting /api/predict-mood...")
    payload = {
        "initial_mood": "happy",
        "answers": [
            {"question": "What's your energy level?", "answer": "High"}
        ]
    }
    try:
        response = httpx.post(f"{BASE_URL}/api/predict-mood", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_get_recommendations():
    print("\nTesting /api/get-recommendations...")
    payload = {
        "initial_mood": "happy",
        "answers": [
            {"question": "What's your energy level?", "answer": "High"}
        ]
    }
    try:
        response = httpx.post(f"{BASE_URL}/api/get-recommendations", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_submit_feedback():
    print("\nTesting /api/submit-feedback...")
    payload = {
        "session_id": "test-session-123",
        "recommended_dishes": ["Dish1", "Dish2"],
        "thumbs_up": True,
        "initial_mood": "happy",
        "refined_tags": ["comfort", "light"]
    }
    try:
        response = httpx.post(f"{BASE_URL}/api/submit-feedback", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting API tests...")
    test_health()
    test_generate_questions()
    test_predict_mood()
    test_get_recommendations()
    test_submit_feedback()
    print("\nAll tests completed.")