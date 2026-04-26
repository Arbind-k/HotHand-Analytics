from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import settings
from app.database import create_tables

create_tables()

app = FastAPI(
    title=settings.app_name,
    description="NBA analytics backend for recent form, aging curves, schedule difficulty, and chart-ready insights.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"app": settings.app_name, "docs": "/docs", "health": "/health"}
