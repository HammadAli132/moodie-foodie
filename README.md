# moodie-foodie

Moodie-Foodie is a mood-based food recommendation prototype for Islamabad/Rawalpindi.  It uses a FastAPI backend with Groq LLM calls for mood refinement, tag extraction, and recommendation reasoning, paired with a dish/tag-matching engine and feedback persistence.

## 🧭 Architecture

- `backend/`
  - `main.py`: FastAPI app entrypoint + CORS and startup hook
  - `api/routes.py`: REST routes for health, generate-questions, predict-mood, get-recommendations, and submit-feedback
  - `services/`
    - `llm_service.py`: Groq LLM wrapper and prompts for question generation, mood/tag prediction, and reasoning text
    - `matching_service.py`: Tag-based scoring and top dish selection from restaurant dataset
    - `recommendation_service.py`: orchestration pipeline (predict -> match -> reason -> session id)
  - `database/db.py`: SQLite feedback table creation and persistence
  - `models/schemas.py`: Pydantic request/response models
  - `core/config.py`: env settings (GROQ API key, model, paths, vocabulary)
  - `data/restaurants.json`: dish dataset
  - `data/feedback.db`: auto-created by `init_db()`

- `frontend/`
  - Vite + React skeleton (currently template content in `src/App.jsx`)

## ⚙️ Prerequisites

- Python 3.11+ (fastapi + pydantic-settings)
- Node 18+ / npm (for frontend)
- `GROQ_API_KEY` in `.env` or env var
- Optional: your preferred terminal/virtual environment

## 📦 Backend setup

1. `cd backend`
2. `python -m venv .venv`
3. `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux)
4. `pip install -r requirements.txt`
5. Create `.env` with:

   ```text
   GROQ_API_KEY=your_groq_key_here
   # GROQ_MODEL=llama-3.3-70b-versatile (optional override)
   ```

6. Ensure `backend/data/restaurants.json` exists (provided) and contains menu data

## ▶️ Run backend

- `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Open `http://127.0.0.1:8000/docs` for interactive API docs

## 🧩 Frontend setup (boilerplate)

1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

> Note: current frontend is Vite template and not yet wired to backend endpoints. Integrate your custom UI with `/api/*` endpoints.

## 🔌 API Endpoints

- `GET /api/health`
  - success: `{ "status": "ok", "message": "Foodie Moodie backend is healthy" }`

- `POST /api/generate-questions`
  - body: `GenerateQuestionsRequest` (e.g. `{ "mood": "stressed" }`)
  - response: questions list for follow-up

- `POST /api/predict-mood`
  - body: `{ "initial_mood": "sad", "answers": [{"question":"..","answer":".."}] }`
  - response: refined mood + tags

- `POST /api/get-recommendations`
  - body: same as predict-mood
  - response: `session_id`, `refined_mood`, `refined_tags`, `recommendations`

- `POST /api/submit-feedback`
  - body: `{ "session_id":"...","recommended_dishes":[...],"thumbs_up":true,"initial_mood":"...","refined_tags":[...] }`
  - stores feedback in SQLite

## 🗄️ Feedback persistence

- `backend/database/db.py` creates SQLite table `feedback` if missing
- Calls to `POST /api/submit-feedback` store rows with JSON arrays as text

## 🛠️ Development Notes

- `core/config.py` maintains static valid tags for `llm_service.predict_mood_and_tags`
- `matching_service.get_top_dishes` matches on tags and falls back to comfort food
- `recommendation_service.get_recommendations` wraps all pipeline steps and generates UUID session IDs
- For debugging, use `backend/database/db.get_all_feedback()` in Python shell or add endpoint if needed

## ✅ Quick sanity checks

- `GET /api/health`
- `POST /api/generate-questions` should return 2-3 question objects + options
- `POST /api/get-recommendations` should return 3 dish recommendations with reasoning

## 📌 TODO

- Build an integrated React UI for the mood flow and feedback loop
- Add proper error handling around Groq rate limits and timeouts
- Add unit tests for `matching_service` and `recommendation_service`
