from pydantic import BaseModel
from app.models.space import SpaceType
from datetime import datetime

class AmenityOut(BaseModel):
    id: int
    name: str
    icon: str | None = None

    model_config = {"from_attributes": True}


class SpaceImageOut(BaseModel):
    id: int
    url: str
    position: int

    model_config = {"from_attributes": True}


class SpaceOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    type: SpaceType
    capacity: int
    price_per_hour: float
    description: str | None = None
    address: str | None = None
    is_active: bool
    owner_id: int | None = None
    owner_name: str | None = None
    amenities: list[AmenityOut] = []
    images: list[SpaceImageOut] = []
    created_at: datetime
    updated_at: datetime


class SpaceCreate(BaseModel):
    name: str
    type: SpaceType
    capacity: int
    price_per_hour: float
    description: str | None = None
    address: str | None = None
    is_active: bool = True
    amenity_ids: list[int] = []


class SpaceUpdate(BaseModel):
    name: str | None = None
    type: SpaceType | None = None
    capacity: int | None = None
    price_per_hour: float | None = None
    description: str | None = None
    address: str | None = None
    is_active: bool | None = None
    amenity_ids: list[int] | None = None

class AvailabilitySlotOut(BaseModel):
    start_time : datetime
    end_time : datetime
    available : bool

    model_config = {"from_attributes": True}