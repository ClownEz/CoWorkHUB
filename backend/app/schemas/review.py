from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: str | None = None


class ReviewUpdate(BaseModel):
    rating: int | None = None
    comment: str | None = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    user_id: int
    space_id: int
    rating: int
    comment: str | None
    created_at: datetime
