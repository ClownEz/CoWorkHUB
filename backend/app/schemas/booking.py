from pydantic import BaseModel
from app.models.booking import BookingStatus
from datetime import datetime


class BookingCreate(BaseModel):
    space_id: int
    start_time: datetime
    end_time: datetime
    promo_code: str | None = None


class SpaceBriefOut(BaseModel):
    id: int
    name: str
    type: str
    price_per_hour: float

    class Config:
        from_attributes = True


class BookingOut(BaseModel):
    id: int
    user_id: int
    space_id: int
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    total_price: float
    promo_code: str | None = None
    created_at: datetime
    updated_at: datetime
    space: SpaceBriefOut | None = None

    class Config:
        from_attributes = True

