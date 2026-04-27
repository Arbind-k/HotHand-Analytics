from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(
    title="HotHand Analytics - Live NBA Backend",
    version="2.0.0",
    description="FastAPI backend powered by nba_api live/stats endpoints.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "HotHand live NBA backend is running",
        "docs": "/docs",
        "health": "/api/health",
        "players": "/api/players",
        "dashboard": "/api/dashboard",
    }
