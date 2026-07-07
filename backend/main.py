from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.models import (User, Space, Amenity, SpaceImage, Booking, Payment, Review, RefreshToken, PasswordResetToken)
from app.routers import spaces, auth,booking


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="CoWorkHub API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(spaces.router)
app.include_router(booking.router)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/api/health")
async def health():
    return {"status": "ok"}

