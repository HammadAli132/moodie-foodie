from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router import api_router
from database.mongodb import connect, disconnect


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open DB connection on startup, close on shutdown."""
    await connect()
    yield
    await disconnect()


app = FastAPI(
    title="Foodie Moodie API",
    description="Mood-based food discovery for urban Pakistan.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",  # CRA dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {"message": "Foodie Moodie API is running ✅"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)