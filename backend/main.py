from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from database.db import init_db

app = FastAPI(
    title="Foodie Moodie API",
    description="Mood-based food recommendation system for Islamabad/Rawalpindi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Foodie Moodie API is running"}