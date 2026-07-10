from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    provider: str


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: float
    status: PaymentStatus
    provider: str | None
    created_at: datetime
    client_secret: str | None = None